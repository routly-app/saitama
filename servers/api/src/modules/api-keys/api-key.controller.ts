import type { z } from "zod";
import { promisify } from "util";
import { and, eq } from "drizzle-orm";
import { generateKeyPair } from "crypto";

import type { Database } from "../../db";
import { apiKeys } from "../../db/schema";
import { encrypt } from "../../core/secret";
import { secretKey } from "../../instances";
import type {
  insertApiKeySchema,
  selectApiKeySchema,
  selectAppSchema,
} from "../../db/zod";

export const createApiKey = async (
  db: Database,
  value: z.infer<typeof insertApiKeySchema>
) => {
  const keypair = await promisify(generateKeyPair)("ed25519", {
    publicKeyEncoding: { type: "spki", format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "der" },
  });

  const publicKey = keypair.publicKey.toBase64();
  const privateKey = keypair.privateKey.toBase64();

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      ...value,
      publicKey: publicKey,
      secretKey: encrypt(secretKey, privateKey),
    })
    .returning()
    .execute();

  return { ...apiKey, publicKey, secretKey: privateKey };
};

export const getApiKeysByApp = async (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"]
) =>
  db.query.apiKeys
    .findMany({
      where: eq(apiKeys.app, app),
    })
    .execute();

export const deleteApiKeyByAppAndId = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectApiKeySchema>["id"]
) =>
  db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.app, app)))
    .returning()
    .execute();
