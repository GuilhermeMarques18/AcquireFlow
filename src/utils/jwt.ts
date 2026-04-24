import jwt, { type JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import logger from "#config/logger";

const JWT_SECRET: string = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1h") as StringValue;

export const jwtToken = {
  sign: (payload: object | string | Buffer): string => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (e) {
      logger.error("Failed to sign token", e);
      throw new Error("Failed to sign token", { cause: e });
    }
  },

  verify: (token: string): string | JwtPayload => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      logger.error("Failed to verify token", e);
      throw new Error("Failed to verify token", { cause: e });
    }
  },
};
