import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { apps } from "./apps";

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid().defaultRandom().primaryKey(),
    url: text().notNull(),
    app: uuid()
      .references(() => apps.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (columns) => ({
    uniqueWebhook: unique()
      .on(columns.app, columns.url)
      .nullsNotDistinct(),
  })
);
