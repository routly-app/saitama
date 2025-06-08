import { format } from "@saitamafun/shared";
import type { FastifyReply, FastifyRequest } from "fastify";

import { RequestError } from "./error";

export const withUserGuard = <
  T extends FastifyRequest = FastifyRequest,
  U extends FastifyReply = FastifyReply,
  Fn extends (user: NonNullable<FastifyRequest["user"]>) => unknown = (
    user: NonNullable<FastifyRequest["user"]>
  ) => unknown
>(
  fn: Fn,
  skipAppCheck: boolean = false
) => {
  return (request: T, _reply: U): ReturnType<Fn> => {
    if (request.user && (skipAppCheck ? true : request.user.app))
      return fn(request.user) as ReturnType<Fn>;
    throw new RequestError(
      401,
      format("user % is undefined", skipAppCheck ? "" : "or app")
    );
  };
};
