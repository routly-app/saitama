import passport from "@fastify/passport";
import { array, object, type z } from "zod";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import {
  insertPaymentLinkSchema,
  selectNetworkSchema,
  selectPaymentLinkSchema,
} from "../../db/zod";
import {
  createPaymentLink,
  deletePaymentLinkByAppAndId,
  getPaymentLinkByAppAndId,
  getPaymentLinksByApp,
  updatePaymentLinkByAppAndId,
} from "./payment-links.controller";

const createPaymentLinkRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertPaymentLinkSchema> }>
) =>
  withUserGuard((user) =>
    insertPaymentLinkSchema
      .omit({ app: true })
      .parseAsync(request.body)
      .then(async (body) => {
        const [paymentLink] = await createPaymentLink(db, {
          ...body,
          app: user.app.id,
        });

        return paymentLink;
      })
  );

const getPaymentLinksRoute = () =>
  withUserGuard((user) => getPaymentLinksByApp(db, user.app.id));

const getPaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectPaymentLinkSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentLinkSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const paymentLink = await getPaymentLinkByAppAndId(db, user.app.id, id);
        if (paymentLink) return paymentLink;

        throw new RequestError(
          404,
          format("paymentLink with id=% not found", id)
        );
      })
  );

const updatePaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectPaymentLinkSchema>, "id">;
    Body: Partial<z.infer<typeof insertPaymentLinkSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentLinkSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertPaymentLinkSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [paymentLink] = await updatePaymentLinkByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (paymentLink) return paymentLink;

            throw new RequestError(
              404,
              format("paymentLink with id=% not found", id)
            );
          })
      )
  );

const deletePaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectPaymentLinkSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentLinkSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const [paymentLink] = await deletePaymentLinkByAppAndId(
          db,
          user.app.id,
          id
        );
        if (paymentLink) return paymentLink;

        throw new RequestError(
          404,
          format("paymentLink with id=% not found", id)
        );
      })
  );

export default function registerPaymentLinkRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createPaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["paymentLinks"],
        description: "This resource is to create a unique paymentLink.",
        body: zodToJsonSchema(insertPaymentLinkSchema.omit({ app: true })),
        response: {
          201: zodToJsonSchema(selectPaymentLinkSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getPaymentLinksRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["paymentLinks"],
        description:
          "This resource is to retrieve information about all paymentLinks.",
        response: {
          200: zodToJsonSchema(
            array(
              selectPaymentLinkSchema.and(
                object({
                  networks: array(selectNetworkSchema),
                })
              )
            ),
            { definitions: { selectNetworkSchema } }
          ),
        },
      },
    })
    .route({
      method: "GET",
      url: "/:id/",
      handler: RequestError.handler(getPaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["paymentLinks"],
        description:
          "This resource is to retrieve information about a single paymentLink.",
        params: zodToJsonSchema(selectPaymentLinkSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(
            selectPaymentLinkSchema.and(
              object({
                networks: array(selectNetworkSchema),
              })
            ),
            { definitions: { selectNetworkSchema } }
          ),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updatePaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["paymentLinks"],
        description:
          "This resource is to update some information about a single paymentLink.",
        params: zodToJsonSchema(selectPaymentLinkSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectPaymentLinkSchema),
        },
      },
    })
    .route({
      method: "DELETE",
      url: "/:id/",
      handler: RequestError.handler(deletePaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["paymentLinks"],
        description: "This resource is to delete a single paymentLink.",
        params: zodToJsonSchema(selectPaymentLinkSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectPaymentLinkSchema),
        },
      },
    });
}
