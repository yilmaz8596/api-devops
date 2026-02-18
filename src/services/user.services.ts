import { db } from "../config/database";
import logger from "../config/logger";
import { users } from "../models/user.model";
import { eq } from "drizzle-orm";

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return allUsers;
  } catch (error) {
    logger.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};

export const getUserById = async (id: number) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  } catch (error) {
    logger.error("Error fetching user:", error);
    throw new Error("Error fetching user");
  }
};

export const updateUser = async (
  id: number,
  data: { name?: string; email?: string; role?: string },
) => {
  try {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updated || null;
  } catch (error) {
    logger.error("Error updating user:", error);
    throw new Error("Error updating user");
  }
};

export const deleteUser = async (id: number) => {
  try {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

    return deleted || null;
  } catch (error) {
    logger.error("Error deleting user:", error);
    throw new Error("Error deleting user");
  }
};
