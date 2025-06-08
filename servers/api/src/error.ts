import postgres from "postgres";
import { ZodError } from "zod";
import { DrizzleError } from "drizzle-orm";
import type { HttpCodes } from "fastify/types/utils";
import type { FastifyReply, FastifyRequest } from "fastify";

export class RequestError extends Error {
  constructor(readonly statusCode: HttpCodes, readonly message: string) {
    super(message);
  }

  static handler<T extends FastifyRequest, U extends FastifyReply>(
    fn: (request: T, reply: U) => unknown
  ) {
    return async (request: T, reply: U) => {
      try {
        let result = await fn(request, reply);
        if (result instanceof Function)
          result = await (result as typeof fn)(request, reply);
        return result;
      } catch (error) {
        if (error instanceof ZodError)
          return reply.status(400).send(error.format());
        else if (error instanceof DrizzleError)
          return reply.status(500).send(error);
        else if (error instanceof postgres.PostgresError)
          return reply.status(500).send(error);
        return Promise.reject(error);
      }
    };
  }
}
