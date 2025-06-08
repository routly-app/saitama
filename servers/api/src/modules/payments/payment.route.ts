import assert from "assert";
import { type z, array } from "zod";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { refinedPaymentSchema } from "./payment.schema";
import {
  createPayment,
  getPaymentByAppAndId,
  getPaymentsByAppWhere,
  updatePaymentByAppAndId,
} from "./payment.controller";
import { insertPaymentSchema, selectPaymentSchema } from "../../db/zod";

// instead of getting amount quote here do it on client
const createPaymentRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertPaymentSchema> }>
) =>
  insertPaymentSchema.parseAsync(request.body).then(async (body) => {
    const payment = await createPayment(db, body);
    return refinedPaymentSchema.parseAsync(payment);
  });

const getPaymentsRoute = withUserGuard(async (user) =>
  array(refinedPaymentSchema).parseAsync(
    await getPaymentsByAppWhere(db, user.app.id)
  )
);

const getPaymentRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectPaymentSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const payment = await getPaymentByAppAndId(db, user.app.id, id);
        if (payment) return refinedPaymentSchema.parseAsync(payment);

        throw new RequestError(404, format("payment with id=% not found", id));
      })
  );

const updatePaymentRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectPaymentSchema>, "id">;
    Body: Partial<z.infer<typeof insertPaymentSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertPaymentSchema
          .pick({ amount: true, coin: true, wallet: true })
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            assert(
              body.coin ? body.wallet : body.wallet ? body.coin : true,
              new RequestError(
                404,
                "if changing coin or wallet, both coin and wallet is required."
              )
            );
            const payment = await updatePaymentByAppAndId(
              db,
              user.app!.id,
              id,
              body
            );
            if (payment) return refinedPaymentSchema.parseAsync(payment);

            throw new RequestError(
              404,
              format("payment with id=% not found", id)
            );
          })
      )
  );

export default function registerPaymentkoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description: "This resource is to create a unique payment.",
        body: zodToJsonSchema(insertPaymentSchema),
        response: {
          201: zodToJsonSchema(refinedPaymentSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getPaymentsRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description:
          "This resource is to retrieve information about all payments.",
        response: {
          200: zodToJsonSchema(array(refinedPaymentSchema), {
            definitions: { refinedPaymentSchema },
          }),
        },
      },
    })
    .route({
      method: "GET",
      url: "/:id/",
      handler: RequestError.handler(getPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description:
          "This resource is to retrieve information about a single payment.",
        params: zodToJsonSchema(selectPaymentSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(refinedPaymentSchema),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updatePaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description:
          "This resource is to update some information about a single payment.",
        params: zodToJsonSchema(selectPaymentSchema.pick({ id: true })),
        response: {
          201: zodToJsonSchema(refinedPaymentSchema),
        },
      },
    });
}
