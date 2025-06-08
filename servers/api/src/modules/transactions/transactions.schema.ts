import { array, boolean, number, object, string, enum as enum_ } from "zod";
import { selectWalletSchema1 } from "../../db/zod";

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
  wallet: selectWalletSchema1.shape.id,
  options: object({
    skipPreflight: boolean().optional(),
    commitment,
    preflightCommitment: commitment,
    maxRetries: number().optional(),
    minContextSlot: number().optional(),
  }).optional(),
  signers: array(string()).optional().default([]),
});
