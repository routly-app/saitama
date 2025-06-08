import { useCallback, useMemo } from "react";
import { DexScreener } from "@saitamafun/internal";

import { DexScreenerContext } from "../contexts/DexScreenerContext";

export default function DexScreenerProvider({
  children,
}: React.PropsWithChildren) {
  const dexscreener = useMemo(() => new DexScreener(), []);

  const getMintPriceUSD = useCallback(
    async (network: string, mint: string) => {
      const pairs = await dexscreener.token
        .getPairsByTokenAddresses(network, mint)
        .then(({ data }) =>
          data.filter((pair) => pair.baseToken.address === mint)
        );
      const sum = pairs.reduce(
        (acc, curr) => acc + parseFloat(curr.priceUsd),
        0
      );
      const avg = sum / pairs.length;
      return avg;
    },
    [dexscreener]
  );

  return (
    <DexScreenerContext.Provider value={{ dexscreener, getMintPriceUSD }}>
      {children}
    </DexScreenerContext.Provider>
  );
}
