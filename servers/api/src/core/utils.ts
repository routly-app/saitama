import { format } from "@saitamafun/shared";
import type { FastifyRequest } from "fastify";

export const getURLFromRequest = (request: FastifyRequest) =>
  new URL(
    format("%://%%", request.protocol, request.hostname, request.originalUrl)
  );

export const checkedConcatQueryString = (url: URL, query: URLSearchParams) => {
  const href = url.href;
  return format(
    "%%%",
    url,
    href.startsWith("?") ? null : "?",
    query.toString()
  );
};
