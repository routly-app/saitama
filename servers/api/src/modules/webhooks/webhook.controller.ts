import type { z } from "zod";
import { and, eq } from "drizzle-orm";

import type { Database } from "../../db";
import { webhooks } from "../../db/schema";
import type {
  insertWebhookSchema,
  selectAppSchema,
  selectWebhookSchema,
} from "../../db/zod";

export const createWebhook = (
  db: Database,
  value: z.infer<typeof insertWebhookSchema>
) => db.insert(webhooks).values(value).returning().execute();

export const getWebhooksByApp = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"]
) => db.query.webhooks.findMany({ where: eq(webhooks.app, app) }).execute();

export const updateWebhookByAppAndId = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectWebhookSchema>["id"],
  value: Partial<z.infer<typeof insertWebhookSchema>>
) =>
  db
    .update(webhooks)
    .set(value)
    .where(and(eq(webhooks.app, app), eq(webhooks.id, id)))
    .returning()
    .execute();

export const deleteWebhookByAppAndId = (
  db: Database,
  id: z.infer<typeof selectWebhookSchema>["id"],
  app: z.infer<typeof selectAppSchema>["id"]
) =>
  db
    .delete(webhooks)
    .where(and(eq(webhooks.app, app), eq(webhooks.id, id)))
    .returning()
    .execute();
