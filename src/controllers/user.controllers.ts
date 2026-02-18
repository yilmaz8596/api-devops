import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { updateUserSchema } from "../validations/user.validation";
import { formatValidationErrors } from "../utils/format";
import * as userService from "../services/user.services";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    logger.error("Get all users error:", error);
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    logger.error("Get user by ID error:", error);
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = formatValidationErrors(validationResult.error);
      return res
        .status(400)
        .json({ message: `Validation error: ${errorMessage}` });
    }

    const existing = await userService.getUserById(id);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const updated = await userService.updateUser(id, validationResult.data);
    res
      .status(200)
      .json({ message: "User updated successfully", user: updated });
  } catch (error) {
    logger.error("Update user error:", error);
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", user: deleted });
  } catch (error) {
    logger.error("Delete user error:", error);
    next(error);
  }
};
