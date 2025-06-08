import { type z } from "zod";
import { format } from "@saitamafun/shared";
import type { FastifyInstance } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { selectPaymentSchema } from "../../db/zod";
import { getPaymentById } from "../payments/payment.controller";

export default async function registerWebsocket(fastify: FastifyInstance) {
  fastify.io.on("connection", (socket) => {
    console.log("socket.user=", socket.id);

    socket.on(
      "payments",
      async (id: z.infer<typeof selectPaymentSchema>["id"], next) => {
        return selectPaymentSchema
          .pick({ id: true })
          .safeParseAsync({ id })
          .then(async ({ data, error }) => {
            if (data) {
              const payment = await getPaymentById(db, data.id);
              if (payment) return next(await socket.join(payment.id));
              return next(
                new RequestError(404, format("payment with id=% not found", id))
              );
            }
            if (next) return next(error);
          });
      }
    );
  });
}
