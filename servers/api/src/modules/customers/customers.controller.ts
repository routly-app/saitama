import type { z } from "zod";
import { and, eq, type SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { customers } from "../../db/schema";
import type { insertCustomerSchema, selectCustomerSchema } from "../../db/zod";

export const createCustomer = (
  db: Database,
  value: z.infer<typeof insertCustomerSchema>
) =>
  db
    .insert(customers)
    .values(value)
    .onConflictDoUpdate({
      target: [customers.app, customers.email],
      set: value,
    })
    .returning()
    .execute();

export const getCustomersByAppWhere = (
  db: Database,
  app: z.infer<typeof selectCustomerSchema>["id"],
  where?: SQL<unknown>
) =>
  db.query.customers
    .findMany({
      where: and(eq(customers.app, app), where),
    })
    .execute();

export const getCustomerByAppAndId = (
  db: Database,
  app: z.infer<typeof selectCustomerSchema>["id"],
  id: z.infer<typeof selectCustomerSchema>["id"]
) =>
  db.query.customers
    .findFirst({
      where: and(eq(customers.id, id), eq(customers.app, app)),
    })
    .execute();

export const updateCustomerByAppAndId = (
  db: Database,
  app: z.infer<typeof selectCustomerSchema>["id"],
  id: z.infer<typeof selectCustomerSchema>["id"],
  value: Partial<z.infer<typeof insertCustomerSchema>>
) =>
  db
    .update(customers)
    .set(value)
    .where(and(eq(customers.id, id), eq(customers.app, app)))
    .returning()
    .execute();

export const deleteCustomerByAppAndId = (
  db: Database,
  app: z.infer<typeof selectCustomerSchema>["id"],
  id: z.infer<typeof selectCustomerSchema>["id"]
) =>
  db
    .delete(customers)

    .where(and(eq(customers.id, id), eq(customers.app, app)))
    .returning()
    .execute();
