import { sign } from "jsonwebtoken";
import { object, string } from "zod";
import passport from "@fastify/passport";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { getEnv } from "../../env";
import { RequestError } from "../../error";
import { selectUserSchema } from "../../db/zod";

const tokenAuthRoute = (request: FastifyRequest) => {
  const user = request.user;
  if (user) {
    const token = sign(
      { id: user.id, lastLogin: user.lastLogin },
      getEnv<null>("SECRET_KEY")
    );
    return { token, user };
  }
};

export default function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/token/",
    handler: RequestError.handler(tokenAuthRoute),
    preHandler: passport.authenticate("firebase"),
    schema: {
      tags: ["auth"],
      description: "This resource is to get authentication token.",
      response: {
        200: zodToJsonSchema(
          object({ token: string(), user: selectUserSchema })
        ),
      },
    },
  });
}
