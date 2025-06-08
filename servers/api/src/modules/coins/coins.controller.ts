import type { z } from "zod";
import { and, eq, SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { coins } from "../../db/schema";
import type {
  insertCoinSchema,
  selectCoinSchema,
  selectUserSchema,
} from "../../db/zod";

export const createCoin = (
  db: Database,
  value: z.infer<typeof insertCoinSchema>
) => db.insert(coins).values(value).returning().execute();

export const getCoins = (db: Database, where?: SQL<unknown>) =>
  db.query.coins.findMany({ where }).execute();

export const getCoinById = (
  db: Database,
  id: z.infer<typeof selectCoinSchema>["id"]
) =>
  db.query.coins
    .findFirst({
      where: eq(coins.id, id),
    })
    .execute();

export const updateCoinByUserAndId = (
  db: Database,
  user: z.infer<typeof selectUserSchema>["id"],
  id: z.infer<typeof selectCoinSchema>["id"],
  value: Partial<z.infer<typeof insertCoinSchema>>
) =>
  db
    .update(coins)
    .set(value)
    .where(and(eq(coins.id, id), eq(coins.creator, user)))
    .returning()
    .execute();

export const deleteCoinByUserAndId = (
  db: Database,
  user: z.infer<typeof selectUserSchema>["id"],
  id: z.infer<typeof selectCoinSchema>["id"]
) =>
  db
    .delete(coins)
    .where(and(eq(coins.id, id), eq(coins.creator, user)))
    .returning()
    .execute();
