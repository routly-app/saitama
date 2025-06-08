import type { web3 } from "@coral-xyz/anchor";

import type { Wallet } from "./wallet.model";

export type Transaction = {
  signature: string;
};

export type SendTransaction = {
  bytes: number[];
  wallet: Wallet["id"];
  options?: {
    commitment?: web3.Commitment;
    skipPreflight?: web3.Commitment;
    maxRetries?: number;
    minContextSlot?: number;
  };
  signers?: string[];
};
