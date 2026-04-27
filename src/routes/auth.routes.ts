import { signup, signin, signout } from "#controllers/auth.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.post("/sign-out", signout);

export default router;
