import type { Request, Response, NextFunction } from "express";
import logger from "#config/logger";
import { signUpSchema } from "validations/auth.validation";
import { formatZodError } from "#utils/format";

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const validationResult = signUpSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: formatZodError(validationResult.error) 
            });
        }

        const { name, email, role } = validationResult.data;

        logger.info(`User registered successfully: ${email}`);
        
        
        return res.status(201).json({ message: "User created" });

    } catch (e: any) {
        logger.error("Signup error ", e);

        if (e.message === "User with this email already exists") {
            return res.status(409).json({ error: "Email already exists" });
        }
        
        return res.status(500).json({ error: "Internal server error" });
    }
};