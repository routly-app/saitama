import type { FastifyInstance } from "fastify";

import registerWebsocket from "./websocket";
import registerAppRoutes from "./apps/app.route";
import registerAuthRoutes from "./auth/auth.route";
import registerUserRoutes from "./users/users.route";
import registerCoinRoutes from "./coins/coins.route";
import registerWalletRoutes from "./wallets/wallet.route";
import registerApiKeyRoutes from "./api-keys/api-key.route";
import registerPaymentRoutes from "./payments/payment.route";
import registerWebhookRoutes from "./webhooks/webhook.route";
import registerNetworkRoutes from "./networks/networks.route";
import registerCustomerRoutes from "./customers/customers.route";
import registerPaymentLinkRoutes from "./payment-links/payment-links.route";

export default async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(registerWebsocket);
  await fastify.register(registerAppRoutes, { prefix: "/apps/" });
  await fastify.register(registerAuthRoutes, { prefix: "/auth/" });
  await fastify.register(registerUserRoutes, { prefix: "/users/" });
  await fastify.register(registerCoinRoutes, { prefix: "/coins/" });
  await fastify.register(registerApiKeyRoutes, { prefix: "/api-keys/" });
  await fastify.register(registerNetworkRoutes, { prefix: "/networks/" });
  await fastify.register(registerWalletRoutes, { prefix: "/wallets/" });
  await fastify.register(registerPaymentRoutes, { prefix: "/payments/" });
  await fastify.register(registerWebhookRoutes, { prefix: "/webhooks/" });
  await fastify.register(registerCustomerRoutes, { prefix: "/customers/" });
  await fastify.register(registerPaymentLinkRoutes, {
    prefix: "/payment-links/",
  });
}
