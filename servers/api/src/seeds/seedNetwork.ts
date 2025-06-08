import { svgs } from "@web3icons/core";
import { getTableColumns } from "drizzle-orm";

import type { Database } from "../db";
import { networks } from "../db/schema";

export type Network = {
  name: string;
  logo: { default: string };
  subchains?: { name: string; logo: { default: string } }[];
};

export const defaultNetworks: Network[] = [
  {
    name: "Ethereum",
    logo: svgs.networks.branded.ethereum,
  },
  {
    name: "Solana",
    logo: svgs.networks.branded.solana,
  },
  {
    name: "Tron",
    logo: svgs.networks.branded.tron,
  },
];

export const seedNetwork = async (db: Omit<Database, "$client">) => {
  return (
    await Promise.all(
      defaultNetworks.map(async (network) => {
        const value = {
          name: network.name.toLowerCase(),
          logo: network.logo.default,
        };
        const [parent] = await db
          .insert(networks)
          .values(value)
          .onConflictDoUpdate({
            target: [networks.name],
            set: {
              ...getTableColumns(networks),
              updatedAt: new Date(),
            },
          })
          .returning()
          .execute();

        const values = network.subchains?.map((network) => ({
          parent: parent.id,
          name: network.name.toLowerCase(),
          logo: network.logo.default,
        }));
        if (values && values.length > 0)
          return db
            .insert(networks)
            .values(values)
            .returning({ id: networks.id })
            .onConflictDoUpdate({
              target: [networks.name],
              set: {
                ...getTableColumns(networks),
                updatedAt: new Date(),
              },
            })
            .execute();
      })
    )
  ).flat();
};
