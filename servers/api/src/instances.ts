import Fastify from "fastify";
import { mainnet } from "viem/chains";
import { createClient } from "redis";
import { web3 } from "@coral-xyz/anchor";
import { DexScreener } from "@saitamafun/internal";
import { createPublicClient, webSocket } from "viem";

import { getEnv } from "./env";
import { createDB } from "./db";

const { TronWeb } = require("tronweb") as typeof import("tronweb");

export const dexscreener = new DexScreener();
export const db = createDB(getEnv("DATABASE_URL")!);
export const secretKey = Buffer.from(getEnv("SECRET_KEY")!, "hex")
  .subarray(0, 16)
  .toString("hex");

export const solana = new web3.Connection(getEnv<string>("SOLANA_RPC_URL")!);

export const viem = createPublicClient({
  chain: mainnet,
  transport: webSocket(getEnv<string>("ETHEREUM_RPC_URL")),
});

export const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
});

export const redis = createClient({
  url: getEnv<string>("REDIS_URL"),
});

export const fastify = Fastify({
  logger: true,
  ignoreDuplicateSlashes: true,
  ignoreTrailingSlash: true,
  ajv: {
    customOptions: {
      strict: true,
      allowUnionTypes: true,
    },
  },
});
