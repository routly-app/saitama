import { array, type z } from "zod";
import passport from "@fastify/passport";
import { format } from "@saitamafun/shared";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertCustomerSchema, selectCustomerSchema } from "../../db/zod";
import {
  createCustomer,
  deleteCustomerByAppAndId,
  getCustomerByAppAndId,
  getCustomersByAppWhere,
  updateCustomerByAppAndId,
} from "./customers.controller";

const createCustomerRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertCustomerSchema> }>
) =>
  withUserGuard((user) =>
    insertCustomerSchema
      .omit({ app: true })
      .parseAsync(request.body)
      .then(async (body) => {
        const [customer] = await createCustomer(db, {
          ...body,
          app: user.app.id,
        });

        return customer;
      })
  );

const getCustomersRoute = withUserGuard((user) =>
  getCustomersByAppWhere(db, user.app.id)
);

const getCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectCustomerSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectCustomerSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const customer = await getCustomerByAppAndId(db, user.app.id, id);
        if (customer) return customer;

        throw new RequestError(404, format("customer with id=% not found", id));
      })
  );

const updateCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectCustomerSchema>, "id">;
    Body: Partial<z.infer<typeof insertCustomerSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectCustomerSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        selectCustomerSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [customer] = await updateCustomerByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (customer) return customer;

            throw new RequestError(
              404,
              format("customer with id=% not found", id)
            );
          })
      )
  );

const deleteCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectCustomerSchema>, "id">;
  }>
) =>
  selectCustomerSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
      const [customer] = await deleteCustomerByAppAndId(
        db,
        request.user!.app!.id,
        id
      );

      if (customer) return customer;

      throw new RequestError(404, format("customer with id=% not found", id));
    });

export default function registerCustomerRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["customers"],
        description: "This resource is to create a unique customer.",
        body: zodToJsonSchema(insertCustomerSchema.omit({ app: true })),
        response: {
          201: zodToJsonSchema(selectCustomerSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getCustomersRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["customers"],
        description:
          "This resource is to retrieve information about all customers.",
        response: {
          200: zodToJsonSchema(array(selectCustomerSchema)),
        },
      },
    })
    .route({
      method: "GET",
      url: "/:id/",
      handler: RequestError.handler(getCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["customers"],
        description:
          "This resource is to retrieve information about a single customer.",
        response: {
          200: zodToJsonSchema(selectCustomerSchema),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updateCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["customers"],
        description:
          "This resource is to update some information about a single customer.",
        params: zodToJsonSchema(selectCustomerSchema.pick({ id: true })),
        body: zodToJsonSchema(insertCustomerSchema.partial()),
        response: {
          201: zodToJsonSchema(selectCustomerSchema),
        },
      },
    })
    .route({
      method: "DELETE",
      url: "/:id/",
      handler: RequestError.handler(deleteCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["customers"],
        description: "This resource is to delete a single customer.",
        params: zodToJsonSchema(selectCustomerSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectCustomerSchema),
        },
      },
    });
}
