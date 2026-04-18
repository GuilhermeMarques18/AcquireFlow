import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is not defined");
}

const sql = neon(process.env.DB_URL);

const db = drizzle(sql);

export { db, sql };
