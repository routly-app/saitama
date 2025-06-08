import { eq } from "drizzle-orm";
import { array, type z } from "zod";
import { HDNodeWallet } from "ethers";
import { web3 } from "@coral-xyz/anchor";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { getEnv } from "../../env";
import { wallets } from "../../db/schema";
import { RequestError } from "../../error";
import type { chains } from "../../config";
import { encrypt } from "../../core/secret";
import { withUserGuard } from "../../guards";
import { getWallet } from "../../core/wallet";
import { db, secretKey } from "../../instances";
import { getNetworkById } from "../networks/networks.controller";
import {
  insertWalletSchema,
  selectWalletSchema,
  selectWalletSchema1,
} from "../../db/zod";
import {
  createWallet,
  deleteWalletByAppAndId,
  getWalletByAppWhere,
  getWalletsByAppWhere,
  updateWalletByAppAndId,
} from "./wallet.controller";

const createWalletRoute = async (
  request: FastifyRequest<{ Body: z.infer<typeof insertWalletSchema> }>
) =>
  withUserGuard((user) =>
    insertWalletSchema
      .omit({ app: true, generated: true })
      .partial({ address: true })
      .parseAsync(request.body)
      .then(async (body) => {
        let wallet:
          | Awaited<ReturnType<typeof createWallet>>[number]
          | undefined = undefined;

        const network = await getNetworkById(db, body.network);
        if (network) {
          if (body.customer) {
            wallet = await getWalletByAppWhere(
              db,
              user.app.id,
              eq(wallets.network, network.id)
            );

            if (wallet) return wallet;
            else {
              let address, publicKey;

              if (network.name === "solana") {
                const keypair = web3.Keypair.generate();
                publicKey = keypair.publicKey;
                address = encrypt(secretKey, keypair.secretKey.toBase64());
              } else if (network.name === "ethereum") {
                const keypair = HDNodeWallet.createRandom();
                publicKey = keypair.publicKey;
                address = encrypt(secretKey, keypair.privateKey);
              }

              if (address && publicKey)
                [wallet] = await createWallet(db, {
                  ...body,
                  generated: false,
                  address,
                  app: request.user!.app!.id,
                  metadata: {
                    publicKey: publicKey,
                  },
                });
              else
                throw new RequestError(
                  400,
                  format("network=% not supported", body.network)
                );
            }
          } else {
            if (body.address)
              [wallet] = await createWallet(db, {
                ...body,
                app: request.user!.app!.id,
                address: body.address,
              });
            else {
              const [index, address] = await getWallet(
                getEnv("MNEMONIC")!,
                network.name as unknown as (typeof chains)[number]
              );
              [wallet] = await createWallet(db, {
                ...body,
                address,
                generated: true,
                app: user.app!.id,
                metadata: { index },
              });
            }
          }

          return selectWalletSchema.parseAsync(wallet);
        } else
          throw new RequestError(
            404,
            format("network with id=% not found", body.network)
          );
      })
  );

export const getWalletsRoute = async (request: FastifyRequest) =>
  array(selectWalletSchema).parseAsync(
    await getWalletsByAppWhere(db, request.user!.app!.id)
  );

const updateWalletRoute = async (
  request: FastifyRequest<{
    Params: z.infer<typeof selectWalletSchema>["id"];
    Body: Partial<z.infer<typeof insertWalletSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectWalletSchema1
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertWalletSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [wallet] = await updateWalletByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (wallet) return wallet;

            throw new RequestError(
              404,
              format("wallet with id=% not found", id)
            );
          })
      )
  );

const deleteWalletRoute = async (
  request: FastifyRequest<{
    Params: z.infer<typeof selectWalletSchema>["id"];
  }>
) =>
  withUserGuard((user) =>
    selectWalletSchema1
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const [wallet] = await deleteWalletByAppAndId(db, user.app.id, id);
        if (wallet) return wallet;

        throw new RequestError(404, format("wallet with id=% not found", id));
      })
  );

export default function registerWalletRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createWalletRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["wallets"],
        description: "This resource is to create a unique wallet.",
        body: zodToJsonSchema(
          insertWalletSchema
            .partial({ address: true })
            .omit({ app: true, generated: true })
        ),
        response: {
          201: zodToJsonSchema(selectWalletSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getWalletsRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["wallets"],
        description:
          "This resource is to retrieve information about all wallets.",
        response: {
          200: zodToJsonSchema(array(selectWalletSchema), {
            definitions: { selectWalletSchema },
          }),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updateWalletRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["wallets"],
        description:
          "This resource is to retrieve information about a single wallet.",
        params: zodToJsonSchema(selectWalletSchema1.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectWalletSchema),
        },
      },
    })
    .route({
      method: "DELETE",
      url: "/:id/",
      handler: RequestError.handler(deleteWalletRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["wallets"],
        description: "This resource is to delete a single wallet.",
        params: zodToJsonSchema(selectWalletSchema1.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectWalletSchema),
        },
      },
    });
}
