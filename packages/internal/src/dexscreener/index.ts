import xior, { type XiorInstance } from "xior";

import { SearchApi } from "./search.api";
import { TokenApi } from "./token.api";
import { PairApi, TokenPairApi } from "./pair.api";

export class DexScreener {
  private readonly xior: XiorInstance;

  readonly pair: PairApi;
  readonly token: TokenApi;
  readonly search: SearchApi;
  readonly tokenPair: TokenPairApi;

  constructor(baseURL: string = "https://api.dexscreener.com") {
    this.xior = xior.create({
      baseURL,
    });

    this.pair = new PairApi(this.xior);
    this.token = new TokenApi(this.xior);
    this.search = new SearchApi(this.xior);
    this.tokenPair = new TokenPairApi(this.xior);
  }
}

