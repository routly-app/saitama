import type { z } from "zod";
import { Wallet } from "ethers";
import { web3 } from "@coral-xyz/anchor";
import { and, eq, SQL } from "drizzle-orm";
import { format } from "@saitamafun/shared";

import type { Database } from "../../db";
import { RequestError } from "../../error";
import { wallets } from "../../db/schema";
import { decrypt } from "../../core/secret";
import { secretKey } from "../../instances";
import type {
  insertWalletSchema,
  selectAppSchema,
  selectWalletSchema,
  selectWalletSchema1,
} from "../../db/zod";

export const createWallet = (
  db: Database,
  value: z.infer<typeof insertWalletSchema>
) =>
  db
    .insert(wallets)
    .values(value)
    .returning()
    .onConflictDoUpdate({
      target: [wallets.app, wallets.customer, wallets.network, wallets.address],
      set: value,
    })
    .execute();

export const getWalletsByAppWhere = <T extends SQL<unknown>>(
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  ...where: T[]
) =>
  db.query.wallets
    .findMany({
      where: and(eq(wallets.app, app), ...where),
      with: {
        network: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    })
    .execute();

export const getWalletByAppWhere = <T extends SQL<unknown>>(
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  ...where: T[]
) =>
  db.query.wallets
    .findFirst({
      where: and(eq(wallets.app, app), ...where),
      with: {
        network: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    })
    .execute();

export const updateWalletByAppAndId = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectWalletSchema>["id"],
  value: Partial<z.infer<typeof insertWalletSchema>>
) =>
  db
    .update(wallets)
    .set(value)
    .where(
      and(
        eq(wallets.id, id),
        eq(wallets.app, app),
        eq(wallets.generated, false)
      )
    )
    .returning()
    .execute();

export const deleteWalletByAppAndId = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectWalletSchema>["id"]
) =>
  db
    .delete(wallets)
    .where(
      and(
        eq(wallets.id, id),
        eq(wallets.app, app),
        eq(wallets.generated, false)
      )
    )
    .returning()
    .execute();

export function loadWalletFromDb(
  wallet: Pick<z.infer<typeof selectWalletSchema1>, "address" | "network">,
  network: "solana"
): web3.Keypair;
export function loadWalletFromDb(
  wallet: Pick<z.infer<typeof selectWalletSchema1>, "address" | "network">,
  network: "ethereum"
): Wallet;
export function loadWalletFromDb(
  wallet: Pick<z.infer<typeof selectWalletSchema1>, "address" | "network">,
  network: "tron"
): undefined;
export function loadWalletFromDb(
  wallet: Pick<z.infer<typeof selectWalletSchema1>, "address" | "network">,
  network: "solana" | "ethereum" | "tron"
) {
  const privateKey = decrypt<string>(secretKey, wallet.address);

  if (network === "solana")
    return web3.Keypair.fromSecretKey(Buffer.from(privateKey, "base64"));
  else if (network === "ethereum") return new Wallet(privateKey);
  else if (network === "tron") return undefined;

  throw new RequestError(
    400,
    format("network=% can't be loaded from db", wallet.network)
  );
}
