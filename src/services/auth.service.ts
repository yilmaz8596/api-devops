import bcrypt from "bcrypt";
import logger from "../config/logger";
import { db } from "../config/database";
import { users } from "../models/user.model";
import { eq } from "drizzle-orm";
import { LoginResponse, RegisterResponse } from "../types";
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    logger.error("Error hashing password:", error);
    throw new Error("Error hashing password");
  }
};

export const comparePasswords = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    logger.error("Error comparing passwords:", error);
    throw new Error("Error comparing passwords");
  }
};

export const findUserByEmail = async (
  email: string,
): Promise<LoginResponse> => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user[0] as LoginResponse;
  } catch (error) {
    logger.error("Error finding user:", error);
    throw new Error("Error finding user");
  }
};

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: string,
): Promise<RegisterResponse> => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser?.length > 0) {
      throw new Error("User already exists");
    }

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    logger.info(`User created: ${email} with role ${role}`);
    return user;
  } catch (error) {
    logger.error("Error creating user:", error);
    throw new Error(`Error creating user: ${(error as Error).message}`);
  }
};
