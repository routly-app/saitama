import { object, string, type z } from "zod";
import { eq } from "drizzle-orm";
import { web3 } from "@coral-xyz/anchor";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db, solana } from "../../instances";
import { wallets } from "../../db/schema";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { transactionSchema } from "./transactions.schema";
import {
  getWalletByAppWhere,
  loadWalletFromDb,
} from "../wallets/wallet.controller";

const processTransactionRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof transactionSchema> }>
) =>
  withUserGuard((user) =>
    transactionSchema.parseAsync(request.body).then(async (body) => {
      console.log(body);
      const dbWallet = await getWalletByAppWhere(
        db,
        user.app.id,
        eq(wallets.id, body.wallet)
      );

      if (dbWallet) {
        if (dbWallet.network.name === "solana") {
          const wallet = loadWalletFromDb(dbWallet, dbWallet.network.name);
          const signers = body.signers?.map((signer) =>
            web3.Keypair.fromSecretKey(Buffer.from(signer, "base64"))
          );
          const transaction = web3.Transaction.from(Buffer.from(body.bytes));

          const signature = await web3.sendAndConfirmTransaction(
            solana,
            transaction,
            [wallet, ...signers],
            body.options
          );

          return { signature };
        }
      } else
        throw new RequestError(
          404,
          format("wallet with id=% not found", body.wallet)
        );
    })
  );

export default function registerTransactionRoutes(fastify: FastifyInstance) {
  fastify.route({
    url: "/",
    method: "POST",
    handler: RequestError.handler(processTransactionRoute),
    preHandler: passport.authenticate(["jwt", "apiKey"]),
    schema: {
      body: zodToJsonSchema(transactionSchema),
      response: {
        201: zodToJsonSchema(object({ signature: string() })),
      },
    },
  });
}
