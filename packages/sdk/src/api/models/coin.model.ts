import type { Network } from "./network.model";

export type Coin = {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  mint: string;
  isNative: boolean;
  decimals: number;
  creator?: string;
  createdAt: string;
  updatedAt: string;
  network: Network | string;
};
