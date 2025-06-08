import passport from "@fastify/passport";
import type { FastifyInstance } from "fastify";
import zodToJsonSchema from "zod-to-json-schema";

import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { selectUserSchema } from "../../db/zod";

const getUserRoute = withUserGuard((user) => user, true);

export default function registerUserRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/me/",
    handler: RequestError.handler(getUserRoute),
    preHandler: passport.authenticate(["jwt", "firebase"]),
    schema: {
      tags: ["users"],
      description:
        "This resource is to retrieve information about a single user.",
      response: {
        200: zodToJsonSchema(selectUserSchema),
      },
    },
  });
}
