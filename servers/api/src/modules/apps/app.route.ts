import { array, type z } from "zod";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertAppSchema, selectAppSchema } from "../../db/zod";
import {
  createApp,
  deleteAppByUserAndId,
  getAppByUserAndId,
  getAppsByUser,
  updateAppByUserAndId,
} from "./app.controller";

const createAppRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertAppSchema> }>
) =>
  withUserGuard(
    (user) =>
      insertAppSchema
        .omit({ user: true })
        .parseAsync(request.body)
        .then(async (body) => {
          const [app] = await createApp(db, { ...body, user: user.id });
          return app;
        }),
    true
  );

const getAppsRoute = withUserGuard((user) => getAppsByUser(db, user.id), true);

const getAppRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectAppSchema>, "id">;
  }>
) =>
  withUserGuard(
    async (user) =>
      selectAppSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(async ({ id }) => {
          const app = await getAppByUserAndId(db, user.id, id);
          if (app) return app;

          throw new RequestError(404, format("app with id=% not found", id));
        }),
    true
  );

const updateAppRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectAppSchema>, "id">;
    Body: Partial<z.infer<typeof insertAppSchema>>;
  }>
) =>
  withUserGuard(
    (user) =>
      selectAppSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(({ id }) =>
          insertAppSchema
            .partial()
            .parseAsync(request.body)
            .then(async (body) => {
              const [app] = await updateAppByUserAndId(db, user.id, id, body);
              if (app) return app;

              throw new RequestError(
                404,
                format("app with id=% not found", id)
              );
            })
        ),
    true
  );

const deleteAppRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectAppSchema>, "id">;
  }>
) =>
  withUserGuard(
    (user) =>
      selectAppSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(async ({ id }) => {
          const [app] = await deleteAppByUserAndId(db, user.id, id);
          if (app) return app;

          throw new RequestError(404, format("app with id=% not found", id));
        }),
    true
  );

export default function registerAppRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createAppRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tag: ["apps", "workspaces"],
        description: "This resource is to create a unique app.",
        body: zodToJsonSchema(insertAppSchema.omit({ user: true })),
        response: {
          201: zodToJsonSchema(insertAppSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getAppsRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tag: ["apps", "workspaces"],
        description: "This resource is to retrieve information about all apps.",
        response: {
          200: zodToJsonSchema(array(selectAppSchema.omit({ user: true }))),
        },
      },
    })
    .route({
      method: "GET",
      url: "/:id/",
      handler: RequestError.handler(getAppRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tag: ["apps", "workspaces"],
        description:
          "This resource is to retrieve information about a single app.",
        params: zodToJsonSchema(selectAppSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectAppSchema.omit({ user: true })),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updateAppRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tag: ["apps", "workspaces"],
        description:
          "This resource is to update some information about a single app.",
        params: zodToJsonSchema(selectAppSchema.pick({ id: true })),
        body: zodToJsonSchema(insertAppSchema.omit({ user: true }).partial()),
        response: {
          201: zodToJsonSchema(selectAppSchema),
        },
      },
    })
    .route({
      method: "DELETE",
      url: "/:id/",
      handler: RequestError.handler(deleteAppRoute),
      preHandler: passport.authenticate("jwt"),
      schema: {
        tag: ["apps", "workspaces"],
        description: "This resource is to delete a single app.",
        params: zodToJsonSchema(selectAppSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectAppSchema),
        },
      },
    });
}
