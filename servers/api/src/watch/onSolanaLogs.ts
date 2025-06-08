import type { z } from "zod";
import { web3 } from "@coral-xyz/anchor";
import { format } from "@saitamafun/shared";
import type { FastifyInstance } from "fastify";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import type { Database } from "../db";
import { getPaymentById } from "../modules/payments/payment.controller";
import { refinedPaymentSchema } from "../modules/payments/payment.schema";
import type { insertPaymentSchema, selectWalletSchema } from "../db/zod";
import { apps, coins, paymentLinks, payments, wallets } from "../db/schema";
import type {
  ParsedSplTokenTransferChecked,
  ParsedTokenTransfer,
} from "./models";

const tokenProgramIds = new Set([
  TOKEN_PROGRAM_ID.toBase58(),
  TOKEN_2022_PROGRAM_ID.toBase58(),
]);

const programIds = [
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  web3.SystemProgram.programId,
];

const solanaLogs =
  (db: Database, connection: web3.Connection, fastify: FastifyInstance) =>
  async (...[{ signature }]: Parameters<web3.LogsCallback>) => {
    console.log(
      format(
        "[logs.processing] processing transactions for signature=%",
        signature
      )
    );

    const parsedTransactionWithMeta = await connection.getParsedTransaction(
      signature,
      {
        commitment: "confirmed",
      }
    );

    if (parsedTransactionWithMeta) {
      const {
        transaction: {
          message: { accountKeys, instructions },
        },
      } = parsedTransactionWithMeta;
      let wallet = await db.query.wallets
        .findFirst({
          where: or(
            ...accountKeys.map((accountKey) =>
              ilike(wallets.address, accountKey.pubkey.toBase58())
            )
          ),
        })
        .execute();

      const coin = await db.query.coins
        .findFirst({
          with: {
            network: true,
          },
          where: or(
            ...accountKeys.map((accountKey) =>
              ilike(coins.mint, accountKey.pubkey.toBase58())
            )
          ),
        })
        .execute();

      const processInstruction = (
        wallet: Omit<z.infer<typeof selectWalletSchema>, "metadata">
      ) => {
        console.log(
          format("[wallet.process] processing payment for wallet=%", wallet.id)
        );

        return Promise.all(
          instructions.map(async (instruction) => {
            let payment;
            const data: Partial<z.infer<typeof insertPaymentSchema>> = {};

            if (instruction.programId.equals(web3.SystemProgram.programId)) {
              if ("parsed" in instruction) {
                const parsed = instruction.parsed as ParsedTokenTransfer;
                payment = await db.query.payments
                  .findFirst({
                    where: eq(payments.wallet, wallet.id),
                    orderBy: desc(payments.createdAt),
                    columns: {
                      id: true,
                      amount: true,
                      metadata: true,
                    },
                    with: {
                      coin: {
                        columns: {
                          isNative: true,
                          mint: true,
                        },
                      },
                    },
                  })
                  .execute();
                if (payment) {
                  if (parsed && payment.coin.isNative) {
                    console.log(
                      "[transaction.validating] payment=",
                      payment.id
                    );
                    data.metadata = {
                      ...data.metadata,
                      transaction: {
                        from: parsed.info.source,
                      },
                    };

                    if (BigInt(parsed.info.lamports) >= payment.amount)
                      data.status = "success";
                    else {
                      const error = format(
                        "Expected % amount but got %",
                        payment.amount.toString(),
                        parsed.info.lamports
                      );

                      data.status = "failed";
                      data.metadata = {
                        ...payment.metadata,
                        error,
                      };

                      console.error(
                        "[transaction.amoount.invalid]",
                        format("reason=% signature=%", error, signature)
                      );
                    }
                  } else
                    console.error(
                      format(
                        "[transaction.invalid] unsupported native mint for payment=%",
                        payment.id
                      )
                    );
                }
              }
            } else if (tokenProgramIds.has(instruction.programId.toBase58())) {
              if ("parsed" in instruction && coin) {
                const parsed =
                  instruction.parsed as ParsedSplTokenTransferChecked;
                [payment] = await db
                  .select({
                    id: payments.id,
                    amount: payments.amount,
                    metadata: payments.metadata,
                    coin: {
                      mint: coins.mint,
                    },
                  })
                  .from(payments)
                  .innerJoin(
                    paymentLinks,
                    eq(paymentLinks.id, payments.paymentLink)
                  )
                  .innerJoin(coins, eq(coins.id, payments.coin))
                  .innerJoin(apps, eq(apps.id, paymentLinks.app))
                  .orderBy(desc(payments.createdAt))
                  .where(
                    and(
                      eq(payments.wallet, wallet.id),
                      eq(payments.coin, coin.id)
                    )
                  )
                  .execute();
                if (
                  parsed &&
                  payment &&
                  payment.coin.mint === parsed.info.mint
                ) {
                  console.log("[transaction.validating] payment=", payment.id);
                  data.metadata = {
                    ...data.metadata,
                    transaction: {
                      from: parsed.info.source,
                      authority: parsed.info.authority,
                      destination: parsed.info.destination,
                    },
                  };
                  if (BigInt(parsed.info.tokenAmount.amount) >= payment.amount)
                    data.status = "success";
                  else {
                    const error = format(
                      "Expected % amount but got %",
                      payment.amount.toString(),
                      parsed.info.tokenAmount.amount.toString()
                    );
                    data.status = "failed";

                    data.metadata = {
                      ...payment.metadata,
                      error,
                    };
                    console.error(
                      "[transaction.amounta.invalid]",
                      format("reason=% signature=%", error, signature)
                    );
                  }
                } else {
                  console.error(
                    format(
                      "[transaction.invalid] unsupported mint for payment=%",
                      payment.id
                    )
                  );
                  return;
                }
              }
            }

            if (payment) {
              if (Object.values(data).length > 0) {
                const [updatedPayment] = await db
                  .update(payments)
                  .set(data)
                  .where(eq(payments.id, payment.id))
                  .returning({ id: payments.id })
                  .execute();

                return fastify.io
                  .to(payment.id)
                  .emit(
                    "payments",
                    refinedPaymentSchema.parse(
                      await getPaymentById(db, updatedPayment.id)
                    )
                  );
              } else return;
            }

            console.error(
              "[transaction.payment.notFound] reason=payment can't be found. signature=%",
              signature
            );
          })
        );
      };

      if (!wallet) {
        const [, , associatedTokenAccount] = accountKeys.map(
          (accountKey) => accountKey.pubkey
        );
        const accountInfo = await connection.getParsedAccountInfo(
          associatedTokenAccount
        );

        if (accountInfo && accountInfo.value) {
          const data = accountInfo.value.data;

          if ("parsed" in data) {
            wallet = await db.query.wallets
              .findFirst({
                where: eq(wallets.address, data.parsed.info.owner),
              })
              .execute();
          }
        }
      }

      if (wallet) return processInstruction(wallet);
      else
        console.error(
          format(
            "[transaction.wallet.notFound] no wallet found for signature=%",
            signature
          )
        );
    }
  };

export const onSolanaLogs = (
  db: Database,
  fastify: FastifyInstance,
  connection: web3.Connection
) => {
  const subscriptions = programIds.map((programId) =>
    connection.onLogs(programId, solanaLogs(db, connection, fastify))
  );

  const close = () =>
    Promise.all(
      subscriptions.map((subscription) =>
        connection.removeOnLogsListener(subscription)
      )
    );

  return close;
};
