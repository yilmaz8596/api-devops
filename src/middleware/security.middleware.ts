import { slidingWindow } from "@arcjet/node";
import aj from "../config/arcjet";
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

interface MyRequest extends Request {
  user?: {
    role?: string;
  };
}

export const securityMiddleware = async (
  req: MyRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = req.user?.role;

    let limit;
    let message;

    switch (role) {
      case "admin":
        limit = 20;
        message = "Admin request limit exceeded (20 requests per minute).";
        break;
      case "user":
        limit = 10;
        message = "User request limit exceeded (10 requests per minute).";
        break;
      default:
        limit = 5;
        message = "Guest request limit exceeded (5 requests per minute).";
    }

    const client = aj.withRule(
      slidingWindow({ mode: "LIVE", interval: "1m", max: limit }),
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn(
        `Bot detected: ${JSON.stringify({ ip: req.ip, path: req.path })}`,
      );
      return res.status(403).json({ message: "Access denied: Bot detected" });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn(
        `Rate limit exceeded: ${JSON.stringify({ ip: req.ip, path: req.path })}`,
      );
      return res.status(429).json({ message });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn(
        `Shield triggered: ${JSON.stringify({ ip: req.ip, path: req.path })}`,
      );
      return res
        .status(403)
        .json({ message: "Access denied: Shield triggered" });
    }

    next();
  } catch (error) {
    console.error("Security middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
