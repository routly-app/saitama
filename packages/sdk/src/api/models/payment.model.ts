import type { Coin } from "./coin.model";
import type { Wallet } from "./wallet.model";
import type { Customer } from "./customer.model";
import type { PaymentLink } from "./paymentLink.model";

export type Payment<T extends object = { transaction: { from: string } }> = {
  id: string;
  amount: string;
  metadata?: T;
  coin: Coin | string;
  wallet: Wallet | string;
  customer: Customer | string;
  createdAt: string;
  updatedAt: string;
  signature?: string;
  paymentLink: PaymentLink | string;
  status: "pending" | "success" | "failed";
};

export type PurePayment<T extends object = { transaction: { from: string } }> =
  {
    id: string;
    amount: string;
    metadata?: T;
    coin: Coin;
    wallet: Wallet;
    customer: Customer;
    createdAt: string;
    updatedAt: string;
    signature?: string;
    paymentLink: PaymentLink;
    status: "pending" | "success" | "failed";
  };
