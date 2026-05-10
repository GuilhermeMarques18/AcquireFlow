import { fetchAllUsers, fetchUserById, patchUser, removeUser } from "#controllers/users.controller";
import { authenticateToken, requireRole } from "#middleware/auth.middleware";
import express from "express";
import type { Router } from "express";

const router: Router = express.Router();

router.get("/", authenticateToken, requireRole("admin"), fetchAllUsers);

router.get("/:id", authenticateToken, fetchUserById);

router.patch("/:id", authenticateToken, patchUser);

router.delete("/:id", authenticateToken, requireRole("admin"), removeUser);

export default router;
