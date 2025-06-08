export type Pair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    [key: string]: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    [key: string]: number;
  };
  priceChange: {
    [key: string]: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: {
    imageUrl: string;
    header: string;
    openGraph: string;
    websites: { label: string; url: string }[];
    socials: { type: string; url: string }[];
  };
};
