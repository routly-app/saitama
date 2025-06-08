import { users } from "./users";
import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const apps = pgTable(
  "apps",
  {
    id: uuid().defaultRandom().primaryKey(),
    user: text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    logo: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (column) => ({
    uniqueApp: unique().on(column.user, column.name),
  })
);
