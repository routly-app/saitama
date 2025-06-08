import { array, type z } from "zod";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertWebhookSchema, selectWebhookSchema } from "../../db/zod";
import {
  createWebhook,
  deleteWebhookByAppAndId,
  getWebhooksByApp,
  updateWebhookByAppAndId,
} from "./webhook.controller";

const createWebhookRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertWebhookSchema> }>
) =>
  withUserGuard((user) =>
    insertWebhookSchema
      .omit({ app: true })
      .parseAsync(request.body)
      .then((body) => {
        return createWebhook(db, { ...body, app: user.app.id });
      })
  );

const getWebhooksRoute = withUserGuard((user) =>
  getWebhooksByApp(db, user.app.id)
);

const updateWebhookRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectWebhookSchema>, "id">;
    Body: Partial<z.infer<typeof insertWebhookSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectWebhookSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertWebhookSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [webhook] = await updateWebhookByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (webhook) return webhook;

            throw new RequestError(
              404,
              format("webhook with id=% not found", id)
            );
          })
      )
  );

const deleteWebhookRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectWebhookSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectWebhookSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const [webhook] = await deleteWebhookByAppAndId(db, user.app.id, id);
        if (webhook) return webhook;

        throw new RequestError(404, format("webhook with id=% not found", id));
      })
  );

export default function registerWebhookRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createWebhookRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["webhooks"],
        description: "This resource is to create a unique webhook.",
        body: zodToJsonSchema(insertWebhookSchema.omit({ app: true })),
        response: {
          201: zodToJsonSchema(selectWebhookSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getWebhooksRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["webhooks"],
        description:
          "This resource is to retrieve information about all webhooks.",
        response: {
          200: zodToJsonSchema(array(selectWebhookSchema), {
            definitions: { selectWebhookSchema },
          }),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updateWebhookRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["webhooks"],
        description:
          "This resource is to update some information about a single webhook.",
        params: zodToJsonSchema(selectWebhookSchema.pick({ id: true })),
        response: {
          201: zodToJsonSchema(selectWebhookSchema),
        },
      },
    })
    .route({
      method: "DELETE",
      url: "/:id/",
      handler: RequestError.handler(deleteWebhookRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        tags: ["webhooks"],
        description: "This resource is to delete a single webhook.",
        params: zodToJsonSchema(selectWebhookSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectWebhookSchema),
        },
      },
    });
}
