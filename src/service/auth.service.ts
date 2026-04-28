import logger from "#config/logger";
import { users } from "#models/user.model";
import { db } from "#config/database";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error("Error hashing the password: ", e);
    throw new Error("Error hashing");
  }
};

export const comparePassword = async (
  providedPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(providedPassword, hashedPassword);
  } catch (e) {
    logger.error("Error comparing passwords: ", e);
    throw new Error("Error comparing passwords");
  }
};

export const createUser = async ({
  name,
  email,
  password,
  role = "user",
}: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<any> => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    if (existingUser.length > 0) throw new Error("User already exists");

    const password_hash = await hashPassword(password);

    const newUser = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    if (!newUser || newUser.length === 0 || !newUser[0]) throw new Error("Failed to create user");

    logger.info(`User ${newUser[0].email} created successfully`);
    return newUser[0];
  } catch (e) {
    logger.error("Error creating user: ", e);
    throw new Error("Error creating user");
  }
};

export const authenticateUser = async (email: string, password: string): Promise<any> => {
  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1).execute();

    if (!user || user.length === 0) {
      logger.warn(`Login attempt for non-existent user: ${email}`);
      throw new Error("User not found");
    }

    const foundUser = user[0]!;

    const isPasswordValid = await comparePassword(password, foundUser.password);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      throw new Error("Invalid password");
    }

    logger.info(`User ${email} authenticated successfully`);
    return {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
    };
  } catch (e) {
    logger.error("Error authenticating user: ", e);
    throw e;
  }
};
