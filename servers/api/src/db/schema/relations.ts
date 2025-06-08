import { relations } from "drizzle-orm";

import { apps } from "./apps";
import { users } from "./users";
import { apiKeys } from "./apiKeys";
import { payments } from "./payments";
import { wallets } from "./wallets";
import { webhooks } from "./webhooks";
import { customers } from "./customers";
import { paymentLinks } from "./paymentLinks";
import { coins } from "./coins";
import { networks } from "./networks";

export const usersRelations = relations(users, ({ many }) => ({
  apps: many(apps),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  user: one(users, { fields: [apps.user], references: [users.id] }),
  wallets: many(wallets),
  webhooks: many(webhooks),
  apiKey: one(apiKeys, { fields: [apps.id], references: [apiKeys.app] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  app: one(apps, {
    fields: [apiKeys.app],
    references: [apps.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  app: one(apps, {
    fields: [webhooks.app],
    references: [apps.id],
  }),
}));

export const networkRelations = relations(networks, ({ one, many }) => ({
  parent: one(networks, {
    fields: [networks.parent],
    references: [networks.id],
  }),
  subchains: many(networks, { relationName: "parent" }),
  coins: many(coins),
}));

export const coinRelations = relations(coins, ({ one }) => ({
  network: one(networks, {
    fields: [coins.network],
    references: [networks.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  app: one(apps, {
    fields: [wallets.app],
    references: [apps.id],
  }),
  network: one(networks, {
    fields: [wallets.network],
    references: [networks.id],
  }),
}));

export const paymentLinksRelations = relations(paymentLinks, ({ one }) => ({
  app: one(apps, {
    fields: [paymentLinks.app],
    references: [apps.id],
  }),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  paymentLink: one(paymentLinks, {
    fields: [payments.paymentLink],
    references: [paymentLinks.id],
  }),
  customer: one(customers, {
    fields: [payments.customer],
    references: [customers.id],
  }),
  coin: one(coins, { fields: [payments.coin], references: [coins.id] }),
  wallet: one(wallets, {
    fields: [payments.wallet],
    references: [wallets.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  payments: many(payments),
}));
