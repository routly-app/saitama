import type { Coin } from "./coin.model";
import type { User } from "./user.model";

export type Network = {
  id: string;
  name: string;
  logo: string;
  creator?: User | string;
  createdAt: string;
  updatedAt: string;
  coins: Coin[];
  subchains?: Network[];
};
