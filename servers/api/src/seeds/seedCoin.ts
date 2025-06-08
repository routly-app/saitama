import { svgs } from "@web3icons/core";
import { format } from "@saitamafun/shared";
import { getTableColumns, inArray } from "drizzle-orm";

import type { Database } from "../db";
import type { chains } from "../config";
import { coins, networks } from "../db/schema";

export type Coin = {
  name: string;
  ticker: string;
  logo: { default: string };
  chains: { name: (typeof chains)[number]; mint?: string; decimals: number }[];
};

export const defaultCoins: Coin[] = [
  {
    name: "Ethereum",
    ticker: "ETH",
    logo: svgs.tokens.branded.ETH,
    chains: [{ name: "ethereum", decimals: 18 }],
  },
  {
    name: "USDC",
    ticker: "USDC",
    logo: svgs.tokens.branded.USDC,
    chains: [
      {
        name: "ethereum",
        decimals: 6,
        mint: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      {
        name: "solana",
        decimals: 6,
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      },
      { name: "tron", decimals: 6, mint: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8" },
    ],
  },
  {
    name: "USDT",
    ticker: "USDT",
    logo: svgs.tokens.branded.USDT,
    chains: [
      {
        name: "ethereum",
        decimals: 6,
        mint: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
      {
        name: "solana",
        decimals: 6,
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      },
      { name: "tron", decimals: 6, mint: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" },
    ],
  },
  {
    name: "Dai StableCoin",
    ticker: "DAI",
    logo: svgs.tokens.branded.DIA,
    chains: [
      {
        name: "ethereum",
        decimals: 6,
        mint: "0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419",
      },
    ],
  },
  {
    name: "Solana",
    ticker: "SOL",
    logo: svgs.tokens.branded.SOL,
    chains: [{ name: "solana", decimals: 6 }],
  },
  {
    name: "Tron",
    ticker: "TRX",
    logo: svgs.tokens.branded.TRX,
    chains: [{ name: "tron", decimals: 6 }],
  },
];

export const seedCoin = async (db: Omit<Database, "$client">) => {
  return (
    await Promise.all(
      defaultCoins.map(async (coin) => {
        const _networks = await db.query.networks
          .findMany({
            where: inArray(
              networks.name,
              coin.chains.map((chain) => chain.name)
            ),
            columns: {
              id: true,
              name: true,
            },
          })
          .execute();

        const values = coin.chains.map((chain) => {
          const network = _networks.find(
            (network) =>
              network.name.toLowerCase() === chain.name.toLocaleLowerCase()
          );
          if (network)
            return {
              mint: chain.mint,
              name: coin.name,
              ticker: coin.ticker,
              logo: coin.logo.default,
              decimals: chain.decimals,
              chain: chain.name,
              network: network.id,
            };

          throw Error(format("network with name=% not found", chain.name));
        });

        return db
          .insert(coins)
          .values(values)
          .returning({ id: coins.id })
          .onConflictDoUpdate({
            target: [coins.mint, coins.network, coins.name],
            set: {
              ...getTableColumns(coins),
              updatedAt: new Date(),
            },
          })
          .execute();
      })
    )
  ).flat();
};