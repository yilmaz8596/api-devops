import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import logger from "../config/logger";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const jwtToken = {
  sign: (payload: object) => {
    try {
      return (jwt as JwtPayload).sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
    } catch (error) {
      logger.error("Error signing JWT token", { error });
      throw new Error("Failed to generate token");
    }
  },
  verify: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error("Error verifying JWT token", { error });
      throw new Error("Invalid token");
    }
  },
};
