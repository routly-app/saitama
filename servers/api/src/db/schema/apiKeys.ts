import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { apps } from "./apps";

export const apiKeys = pgTable("apiKeys", {
  id: uuid().defaultRandom().primaryKey(),
  secretKey: text().notNull(),
  publicKey: text().notNull(),
  app: uuid()
    .references(() => apps.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
