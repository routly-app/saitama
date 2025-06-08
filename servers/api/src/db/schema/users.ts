import crypto from "crypto";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text()
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  lastName: text(),
  firstName: text(),
  email: text().notNull().unique(),
  isVerified: boolean().default(false).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  lastLogin: timestamp().defaultNow().notNull(),
});
