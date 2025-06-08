import type { z } from "zod";
import { eq } from "drizzle-orm";

import type { Database } from "../../db";
import { users } from "../../db/schema";
import type { insertUserSchema, selectUserSchema } from "../../db/zod";

export const createUser = (
  db: Database,
  values: z.infer<typeof insertUserSchema>
) => db.insert(users).values(values).returning().execute();

export const getUserById = (
  db: Database,
  id: z.infer<typeof selectUserSchema>["id"]
) =>
  db.query.users
    .findFirst({
      where: eq(users.id, id),
    })
    .execute();

export const updateUserById = (
  db: Database,
  id: z.infer<typeof selectUserSchema>["id"],
  values: Partial<z.infer<typeof insertUserSchema>>
) => db.update(users).set(values).where(eq(users.id, id)).execute();

export const deleteUserById = (db: Database, id: string) =>
  db.delete(users).where(eq(users.id, id)).execute();
