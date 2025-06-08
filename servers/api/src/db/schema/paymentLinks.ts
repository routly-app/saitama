import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { apps } from "./apps";

type Price = {
  amount: string;
  currency: string;
};

export const paymentLinks = pgTable("paymentLinks", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull().unique(),
  description: text(),
  price: json().$type<Price>().notNull(),
  app: uuid()
    .references(() => apps.id, { onDelete: "cascade" })
    .notNull(),
  networks: uuid().array().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
