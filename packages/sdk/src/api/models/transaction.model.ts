import type { web3 } from "@coral-xyz/anchor";
import type { Customer } from "./customer.model";
import type { Network } from "./network.model";

export type Transaction = {
  signature: string;
};

export type SendTransaction = {
  bytes: number[];
  network: Network["id"];
  customer: Customer["id"];
  options?: {
    commitment?: web3.Commitment;
    skipPreflight?: web3.Commitment;
    maxRetries?: number;
    minContextSlot?: number;
  };
  signers?: string[];
};
