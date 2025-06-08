import {
  pgTable,
  text,
  uuid,
  timestamp,
  unique,
  boolean,
  json,
} from "drizzle-orm/pg-core";

import { apps } from "./apps";
import { networks } from "./networks";
import { customers } from "./customers";

export const wallets = pgTable(
  "wallets",
  {
    id: uuid().defaultRandom().primaryKey(),
    app: uuid()
      .references(() => apps.id, { onDelete: "cascade" })
      .notNull(),
    customer: uuid().references(() => customers.id),
    metadata: json(),
    address: text().notNull(),
    generated: boolean().default(false).notNull(),
    network: uuid()
      .references(() => networks.id)
      .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (column) => ({
    uniqueWallet: unique()
      .on(column.app, column.customer, column.network, column.address)
      .nullsNotDistinct(),
  })
);
