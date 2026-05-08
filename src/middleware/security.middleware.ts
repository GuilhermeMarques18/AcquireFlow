import aj from "#config/arcjet";
import logger from "#config/logger";
import { slidingWindow } from "@arcjet/node";
import type { Request, Response, NextFunction } from "express";

declare module "express" {
  interface Request {
    user?: { role?: string; id?: string };
  }
}

const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.user?.role || "guest";

    let limit: number;
    let message: string;

    switch (role) {
      case "admin":
        limit = 20;
        message = "Admin request limit exceeded (20 per minute). Slow down.";
        break;
      case "user":
        limit = 10;
        message = "User request limit exceeded (10 per minute). Slow down.";
        break;
      case "guest":
        limit = 5;
        message = "Guest request limit exceeded (5 per minute). Slow down.";
        break;
      default:
        limit = 5;
        message = "Request limit exceeded. Slow down.";
    }

    const client = aj.withRule(slidingWindow({ mode: "LIVE", interval: "1m", max: limit }));

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn(`Bot detected - ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        reason: decision.reason,
      });
      res.status(403).json({ error: "Forbidden", message: "Automated requests are not allowed" });
      return;
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn(`Shield triggered - ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        reason: decision.reason,
      });
      res.status(403).json({
        error: "Forbidden",
        message: "Your request has been blocked by our security system",
      });
      return;
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      const resetTime = decision.reason.resetTime
        ? new Date(decision.reason.resetTime).toISOString()
        : null;
      logger.warn(`Rate limit exceeded: role=${role} - ${req.method} ${req.originalUrl}`);

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", 0);
      if (resetTime) res.setHeader("X-RateLimit-Reset", resetTime);

      res.status(429).json({ error: "Too Many Requests", message });
      return;
    }

    next();
  } catch (e) {
    logger.error("Arcjet middleware error:", e);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong with security middleware",
    });
  }
};

export default securityMiddleware;
