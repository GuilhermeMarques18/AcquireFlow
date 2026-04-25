import type { Request, Response, NextFunction } from "express";
import logger from "#config/logger";
import { signUpSchema } from "validations/auth.validation";
import { formatZodError } from "#utils/format";
import { createUser } from "#service/auth.service";
import { jwtToken } from "#utils/jwt";
import { cookies } from "#utils/cookies";

export const signup = async (req: Request,res: Response,next: NextFunction): Promise<Response | void> => {
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
  
    cookies.set(res,"token", token);

    logger.info(`User registered successfully: ${email}`);

    return res.status(201).json({ 
      message: "User created", 
      user: { id: 1, name : user.name, email: user.email, role: user.role } 
    });
  } catch (e: any) {
    logger.error("Signup error ", e);

    if (e.message === "User with this email already exists") {
      return res.status(409).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};
