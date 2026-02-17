import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { signupSchema, loginSchema } from "../validations/auth.validation";
import { formatValidationErrors } from "../utils/format";
import {
  createUser,
  hashPassword,
  findUserByEmail,
  comparePasswords,
} from "../services/auth.service";
import jwt, { JwtPayload } from "jsonwebtoken";
import { LoginResponse, RegisterResponse } from "../types";
import { cookies } from "../utils/cookies";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = formatValidationErrors(validationResult.error);
      return res
        .status(400)
        .json({ message: `Validation error: ${errorMessage}` });
    }

    const { name, email, password: userPassword, role } = validationResult.data;

    const passwordHash = await hashPassword(userPassword);

    const user: RegisterResponse = await createUser(
      name,
      email,
      passwordHash,
      role,
    );

    const token = (jwt as JwtPayload).sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      },
    );

    cookies.set(res, "token", token);

    const { password, ...userWithoutPassword } = user;
    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error("Signup error:", error);
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = formatValidationErrors(validationResult.error);
      return res
        .status(400)
        .json({ message: `Validation error: ${errorMessage}` });
    }

    const { email, password } = validationResult.data;

    const user: LoginResponse = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await comparePasswords(
      password,
      user?.password || "",
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = (jwt as JwtPayload).sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      },
    );

    cookies.set(res, "token", token);

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error("Login error:", error);
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    cookies.clear(res, "token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    next(error);
  }
};
