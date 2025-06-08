import { discriminatedUnion, literal, object, string } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import {
  apiKeys,
  apps,
  coins,
  customers,
  networks,
  paymentLinks,
  payments,
  users,
  wallets,
  webhooks,
} from "./schema";
import { bigInt } from "./zod-custom-type";

export const insertUserSchema = createInsertSchema(users, {
  email: (column) => column.email(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(users, {
  email: (column) => column.email(),
});

export const insertAppSchema = createInsertSchema(apps, {
  logo: (column) => column.url(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAppSchema = createSelectSchema(apps, {
  logo: (column) => column.url(),
});

export const selectApiKeySchema = createSelectSchema(apiKeys);
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  publicKey: true,
  secretKey: true,
  createdAt: true,
});

export const selectWalletSchema1 = createSelectSchema(wallets);
export const selectWalletSchema = discriminatedUnion("generated", [
  createSelectSchema(wallets)
    .omit({ metadata: true })
    .extend({ generated: literal(true) }),
  createSelectSchema(wallets)
    .omit({ address: true })
    .extend({ generated: literal(false) }),
]);
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertWebhookSchema = createInsertSchema(webhooks, {
  url: (column) => column.url(),
}).omit({ id: true, createdAt: true });
export const selectWebhookSchema = createSelectSchema(webhooks, {
  url: (column) => column.url(),
});

export const selectPaymentSchema = createSelectSchema(payments, {
  amount: bigInt(),
});
export const insertPaymentSchema = createInsertSchema(payments, {
  amount: bigInt(),
  metadata: object({}).optional().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const priceSchema = object({
  amount: string(),
  currency: string(),
});
export const selectPaymentLinkSchema = createSelectSchema(paymentLinks, {
  price: priceSchema,
});
export const insertPaymentLinkSchema = createInsertSchema(paymentLinks, {
  price: priceSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectCustomerSchema = createSelectSchema(customers, {
  email: (column) => column.email(),
});
export const insertCustomerSchema = createInsertSchema(customers, {
  email: (column) => column.email(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectCoinSchema = createSelectSchema(coins, {
  logo: (column) => column.url(),
});
export const insertCoinSchema = createInsertSchema(coins, {
  logo: (column) => column.url(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectNetworkSchema = createSelectSchema(networks, {
  logo: (column) => column.url(),
});
export const insertNetworkSchema = createInsertSchema(networks, {
  logo: (column) => column.url(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
