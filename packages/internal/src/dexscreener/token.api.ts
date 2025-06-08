import { ApiImpl } from "@saitamafun/shared";

import type { Pair } from "./model/pair.model";

export class TokenApi extends ApiImpl {
  protected path: string = "tokens/v1";

  getPairsByTokenAddresses(chainId: string, ...tokenAddresses: string[]) {
    return this.xior.get<Pair[]>(
      this.buildPath(chainId, tokenAddresses.join(","))
    );
  }
}
