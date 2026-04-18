import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email").notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
