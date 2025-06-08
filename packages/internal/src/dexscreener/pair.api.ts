import { ApiImpl } from "@saitamafun/shared";

import type { Pair } from "./model/pair.model";

export class PairApi extends ApiImpl {
  protected path: string = "latest/dex/pairs";

  getPair(chainId: string, pairId: string) {
    return this.xior.get<{ pairs: Pair[] }>(this.buildPath(chainId, pairId));
  }
}

export class TokenPairApi extends ApiImpl {
  protected path: string = "token-pairs/v1";

  getPairsByTokenAddress(chainId: string, tokenAddress: string) {
    return this.xior.get<{ pairs: Pair[] }>(
      this.buildPath(chainId, tokenAddress)
    );
  }
}
