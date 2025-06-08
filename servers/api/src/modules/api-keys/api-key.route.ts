import { array, type z } from "zod";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertApiKeySchema, selectApiKeySchema } from "../../db/zod";
import {
  createApiKey,
  deleteApiKeyByAppAndId,
  getApiKeysByApp,
} from "./api-key.controller";

const createApiKeyRoute = (
  request: FastifyRequest<{ Body?: z.infer<typeof insertApiKeySchema> }>
) =>
  withUserGuard((user) =>
    insertApiKeySchema
      .pick({})
      .parseAsync(request.body)
      .then(async (body) => createApiKey(db, { ...body, app: user.app.id }))
  );

const getApiKeysRoute = (request: FastifyRequest) =>
  getApiKeysByApp(db, request.user!.app!.id);

const deleteApiKeyRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectApiKeySchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectApiKeySchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const [apiKey] = await deleteApiKeyByAppAndId(db, user.app.id, id);
        if (apiKey) return apiKey;

        throw new RequestError(404, format("apiKey with id=% not found", id));
      })
  );

export default function registerApiKeyRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createApiKeyRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tags: ["apiKeys"],
        description: "This resource is to create a unique api key.",
        response: {
          200: zodToJsonSchema(selectApiKeySchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getApiKeysRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tags: ["apiKeys"],
        description:
          "This resource is to retrieve information about all api keys.",
        response: {
          200: zodToJsonSchema(array(selectApiKeySchema), {
            definitions: { selectApiKeySchema },
          }),
        },
      },
    })
    .route({
      method: "DELETE",
      url: "/:id/",
      handler: RequestError.handler(deleteApiKeyRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tags: ["apiKeys"],
        description: "This resource is to delete a single api key.",
        params: zodToJsonSchema(selectApiKeySchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectApiKeySchema),
        },
      },
    });
}
