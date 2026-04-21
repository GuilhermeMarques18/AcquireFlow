import express from "express";
import type { Request, Response } from "express";
import logger from "#config/logger";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookiesParser from "cookie-parser";

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookiesParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));

app.get("/", (req: Request, res: Response) => {
  logger.info("Hello from AcquireFlow!");
  res.status(200).json({ message: "Hello from AcquireFlow!" });
});

export default app;
