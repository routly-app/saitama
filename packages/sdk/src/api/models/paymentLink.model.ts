import type { Network } from "./network.model";

export type PaymentLink = {
  id: string;
  name: string;
  app: string;
  description?: string;
  price: {
    amount: string;
    currency: "USD" | "EUR";
  };
  networks: (Network | string)[];
  createdAt: string;
  updatedAt: string;
};
