import moment from "moment";
import crypto from "crypto";
import {
  bigint,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { coins } from "./coins";
import { wallets } from "./wallets";
import { customers } from "./customers";
import { paymentLinks } from "./paymentLinks";

const generatePaymentId = () => "PAY-" + crypto.randomBytes(8).toString("hex");

export const payments = pgTable("payments", {
  id: text().$defaultFn(generatePaymentId).primaryKey(),
  amount: bigint({ mode: "bigint" }).notNull(),
  coin: uuid()
    .references(() => coins.id, { onDelete: "cascade" })
    .notNull(),
  signature: text(),
  paymentLink: uuid()
    .references(() => paymentLinks.id, { onDelete: "cascade" })
    .notNull(),
  customer: uuid()
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),
  wallet: uuid()
    .references(() => wallets.id, { onDelete: "cascade" })
    .notNull(),
  status: text({ enum: ["pending", "success", "failed"] })
    .default("pending")
    .notNull(),
  metadata: json().$type<Record<string, string> | null>().default(null),
  createdAt: timestamp()
    .$defaultFn(() => moment().utc().toDate())
    .notNull(),
  updatedAt: timestamp()
    .$defaultFn(() => moment().utc().toDate())
    .notNull(),
});
