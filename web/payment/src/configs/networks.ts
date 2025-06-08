import {
  IconComponent,
  NetworkEthereum,
  NetworkSolana,
  NetworkTron,
} from "@web3icons/react";

export type Network = {
  name: string;
  icon: IconComponent;
  data: string;
  chains?: Network[];
};

export const networks: Network[] = [
  {
    name: "Ethereum",
    icon: NetworkEthereum,
    data: "ethereum",
  },
  { name: "Solana", icon: NetworkSolana, data: "solana" },
  { name: "Tron", icon: NetworkTron, data: "tron" },
];

export const wrappedCoins = {
  tron: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
  solana: "So11111111111111111111111111111111111111112",
  ethereum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};
