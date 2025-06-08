import { Crud } from "@saitamafun/shared";

import type { Wallet } from "./models/wallet.model";

export class WalletApi extends Crud<Wallet> {
  path = "wallets";
}
