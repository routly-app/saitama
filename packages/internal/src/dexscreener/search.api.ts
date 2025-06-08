import { ApiImpl } from "@saitamafun/shared";

import type { Search } from "./model/search.model";

export class SearchApi extends ApiImpl {
  protected path: string = "latest/dex/search";

  searchPairs(q: string) {
    return this.xior.get<Search>(
      this.buildQueryPath(this.path, { q })
    );
  }
}
