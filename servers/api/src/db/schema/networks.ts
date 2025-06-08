import {
  foreignKey,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const networks = pgTable(
  "networks",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text({ enum: ["solana", "ethereum", "tron"] })
      .unique()
      .notNull(),
    logo: text().notNull(),
    parent: uuid(),
    creator: text().references(() => users.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (column) => ({
    parentReference: foreignKey({
      columns: [column.parent],
      foreignColumns: [column.id],
      name: "parentReference",
    }),
  })
);
