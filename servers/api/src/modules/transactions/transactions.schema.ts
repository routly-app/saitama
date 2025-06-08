import { array, boolean, number, object, string, enum as enum_ } from "zod";
import { selectCustomerSchema, selectWalletSchema1 } from "../../db/zod";

const commitment = enum_([
  "processed",
  "confirmed",
  "finalized",
  "recent",
  "single",
  "singleGossip",
  "root",
  "max",
]).optional();

export const transactionSchema = object({
  bytes: array(number()),
  network: selectWalletSchema1.shape.network,
  customer: selectCustomerSchema.shape.id,
  options: object({
    skipPreflight: boolean().optional(),
    commitment,
    preflightCommitment: commitment,
    maxRetries: number().optional(),
    minContextSlot: number().optional(),
  }).optional(),
  signers: array(string()).optional().default([]),
});
