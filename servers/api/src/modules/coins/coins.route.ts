import { array, type z } from "zod";
import { eq, isNull } from "drizzle-orm";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { coins } from "../../db/schema";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertCoinSchema, selectCoinSchema } from "../../db/zod";
import {
  createCoin,
  deleteCoinByUserAndId,
  getCoins,
  updateCoinByUserAndId,
} from "./coins.controller";

const createCoinRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertCoinSchema> }>
) =>
  withUserGuard((user) =>
    insertCoinSchema
      .omit({ creator: true })
      .parseAsync(request.body)
      .then(async (body) => {
        const [coin] = await createCoin(db, { ...body, creator: user.id });
        return coin;
      })
  );

const getCoinsRoute = withUserGuard(async (user) => {
  return (
    await Promise.all([
      getCoins(db, eq(coins.creator, user.id)),
      getCoins(db, isNull(coins.creator)),
    ])
  ).flat();
}, true);

const updateCoinRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectCoinSchema>, "id">;
    Body: Partial<z.infer<typeof insertCoinSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectCoinSchema
      .pick({ id: true })
      .parseAsync(request.body)
      .then((params) =>
        insertCoinSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [coin] = await updateCoinByUserAndId(
              db,
              user.id,
              params.id,
              body
            );
            if (coin) return coin;
            throw new RequestError(
              404,
              format("coin with id=% not found", params.id)
            );
          })
      )
  );

const deleteCoinRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectCoinSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectCoinSchema
      .pick({ id: true })
      .parseAsync(request.body)
      .then(async (params) => {
        const [coin] = await deleteCoinByUserAndId(db, user.id, params.id);
        if (coin) return coin;
        throw new RequestError(
          404,
          format("coin with id=% not found", params.id)
        );
      })
  );

export default function registerCoinRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      url: "/",
      method: "POST",
      handler: RequestError.handler(createCoinRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["coins"],
        description: "This resource is to create a unique coin.",
        body: zodToJsonSchema(insertCoinSchema.omit({ creator: true })),
        response: {
          201: zodToJsonSchema(selectCoinSchema),
        },
      },
    })
    .route({
      url: "/",
      method: "GET",
      handler: RequestError.handler(getCoinsRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["coins"],
        response: {
          200: zodToJsonSchema(array(selectCoinSchema), {
            definitions: { selectCoinSchema },
          }),
        },
      },
    })
    .route({
      url: "/:id/",
      method: "PATCH",
      handler: RequestError.handler(updateCoinRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["coins"],
        description:
          "This resource is to update some information about a single coin.",
        params: zodToJsonSchema(selectCoinSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectCoinSchema),
        },
      },
    })
    .route({
      url: "/:id/",
      method: "DELETE",
      handler: RequestError.handler(deleteCoinRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["coins"],
        description: "This resource is to delete a single coin.",
        params: zodToJsonSchema(selectCoinSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectCoinSchema),
        },
      },
    });
}
