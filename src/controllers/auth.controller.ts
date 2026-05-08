import type { Request, Response, NextFunction } from "express";
import logger from "#config/logger";
import { signUpSchema, signInSchema } from "validations/auth.validation";
import { formatZodError } from "#utils/format";
import { createUser, authenticateUser } from "#service/auth.service";
import { jwtToken } from "#utils/jwt";
import { cookies } from "#utils/cookies";

interface AuthError extends Error {
  message: string;
}

export const signup = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response | void> => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatZodError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, "token", token);

    logger.info(`User registered successfully: ${email}`);

    return res.status(201).json({
      message: "User created",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    const error = e as AuthError;
    logger.error("Signup error ", error);

    if (error.message === "User already exists") {
      return res.status(409).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signin = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response | void> => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatZodError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser(email, password);

    const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, "token", token);

    logger.info(`User signed in successfully: ${email}`);

    return res.status(200).json({
      message: "User signed in",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    const error = e as AuthError;
    logger.error("Sign-in error ", error);

    if (error.message === "User not found") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (error.message === "Invalid password") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signout = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response | void> => {
  try {
    cookies.clear(res, "token");

    logger.info("User signed out successfully");

    return res.status(200).json({ message: "User signed out" });
  } catch (e) {
    const error = e as AuthError;
    logger.error("Sign-out error ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
