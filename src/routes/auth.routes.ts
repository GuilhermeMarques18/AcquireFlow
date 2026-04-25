import { signup } from "#controllers/auth.controller";
import express, { type Request, type Response, Router } from "express";

const router: Router = express.Router();

router.post("/sign-up", (signup)); 

router.post("/sign-in", (req: Request, res: Response) => {
  res.send("Post /api/auth/sign-in response");
});

router.post("/sign-out", (req: Request, res: Response) => {
  res.send("Post /api/auth/sign-out response");
});

export default router;
