import type { Network } from "./network.model";

export type Coin = {
  id: string;
  mint?: string;
  name: string;
  ticker: string;
  logo: string;
  decimals: number;
  creator?: string;
  createdAt: string;
  updatedAt: string;
  network: Network | string;
};
