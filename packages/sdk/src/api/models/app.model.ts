import { type Wallet } from "./wallet.model";

export type App = {
  id: string;
  name: string;
  logo?: string;
  created: string;
  wallets: Wallet[];
};
