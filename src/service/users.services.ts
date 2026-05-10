import logger from "#config/logger";
import { db } from "#config/database";
import { users } from "#models/user.model";
import { eq } from "drizzle-orm";

const selectedFields = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updated_at,
} as const;

type PublicUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateUserInput = Partial<Pick<PublicUser, "email" | "name" | "role">>;

export const getAllUsers = async (): Promise<PublicUser[]> => {
  try {
    return (await db.select(selectedFields).from(users).execute()) as PublicUser[];
  } catch (e) {
    logger.error("Error getting users: ", e);
    throw e;
  }
};

export const getUserById = async (id: number): Promise<PublicUser> => {
  try {
    const [user] = await db
      .select(selectedFields)
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .execute();

    if (!user) {
      throw new Error("User not found");
    }

    return user as PublicUser;
  } catch (e) {
    logger.error("Error getting user by ID: ", e);
    throw e;
  }
};

export const updateUser = async (id: number, updates: UpdateUserInput): Promise<PublicUser> => {
  try {
    const existingUser = await getUserById(id);

    if (updates.email && updates.email !== existingUser.email) {
      const [emailInUse] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1)
        .execute();

      if (emailInUse) {
        throw new Error("Email already in use");
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning(selectedFields)
      .execute();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser as PublicUser;
  } catch (e) {
    logger.error("Error updating user: ", e);
    throw e;
  }
};

export const deleteUser = async (id: number): Promise<PublicUser> => {
  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning(selectedFields)
      .execute();

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return deletedUser as PublicUser;
  } catch (e) {
    logger.error("Error deleting user: ", e);
    throw e;
  }
};
