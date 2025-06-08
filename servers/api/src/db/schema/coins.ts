import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { networks } from "./networks";

export const coins = pgTable(
  "coins",
  {
    id: uuid().defaultRandom().primaryKey(),
    mint: text().notNull(),
    name: text().notNull(),
    ticker: text().notNull(),
    logo: text().notNull(),
    isNative: boolean().default(false).notNull(),
    decimals: integer().notNull(),
    network: uuid()
      .references(() => networks.id)
      .notNull(),
    creator: text().references(() => users.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (column) => ({
    uniqueCoin: unique()
      .on(column.mint, column.network, column.name)
      .nullsNotDistinct(),
  })
);
