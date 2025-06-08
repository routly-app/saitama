import type { App } from "./app.model";
import type { Network } from "./network.model";

export type Wallet<T extends object = object> = {
  id: string;
  metadata?: T;
  address: string;
  generated: boolean;
  createdAt: string;
  updatedAt: string;
  app: App | string;
  network: Network | string;
};
