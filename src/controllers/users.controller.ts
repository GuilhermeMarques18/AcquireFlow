import logger from "#config/logger";
import { getAllUsers, getUserById, updateUser, deleteUser } from "#service/users.services";
import type { Request, Response, NextFunction } from "express";

export const fetchAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info("Getting all users");

    const users = await getAllUsers();

    res.json({
      message: "Successfully retrieved users",
      users,
      count: users.length,
    });
  } catch (e) {
    logger.error("Error getting users: ", e);
    next(e);
  }
};

export const fetchUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    logger.info(`Getting user with ID: ${id}`);

    const user = await getUserById(id);

    res.json({
      message: "Successfully retrieved user",
      user,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      res.status(404).json({ message: e.message });
      return;
    }
    logger.error("Error getting user by ID: ", e);
    next(e);
  }
};

export const patchUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    logger.info(`Updating user with ID: ${id}`);

    const updatedUser = await updateUser(id, req.body);

    res.json({
      message: "Successfully updated user",
      user: updatedUser,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      res.status(404).json({ message: e.message });
      return;
    }
    if (e instanceof Error && e.message === "Email already in use") {
      res.status(409).json({ message: e.message });
      return;
    }
    logger.error("Error updating user: ", e);
    next(e);
  }
};

export const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    logger.info(`Deleting user with ID: ${id}`);

    const deletedUser = await deleteUser(id);

    res.json({
      message: "Successfully deleted user",
      user: deletedUser,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "User not found") {
      res.status(404).json({ message: e.message });
      return;
    }
    logger.error("Error deleting user: ", e);
    next(e);
  }
};
