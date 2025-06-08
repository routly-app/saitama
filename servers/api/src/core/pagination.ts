import { z } from "zod";
import { checkedConcatQueryString } from "./utils";

export const limitOffsetPaginationSchema = z.object({
  limit: z.any().optional(),
  offset: z.any().optional(),
});

export class LimitOffsetPagination {
  static LIMIT = 16;
  static OFFSET = 0;

  constructor(
    private readonly url: URL,
    readonly limit: number = LimitOffsetPagination.LIMIT,
    readonly offset: number = LimitOffsetPagination.OFFSET
  ) {}

  readonly nextURL = () => {
    const searchParams = new URLSearchParams();
    searchParams.append("limit", this.limit.toString());
    searchParams.append("offset", (this.getOffset() + this.limit).toString());

    return checkedConcatQueryString(this.url, searchParams);
  };

  readonly previousURL = () => {
    const searchParams = new URLSearchParams();
    searchParams.append("limit", this.limit.toString());
    searchParams.append("offset", this.getOffset().toString());
    return checkedConcatQueryString(this.url, searchParams);
  };

  readonly getResponse = <T>(results: T[]) => {
    return {
      next: results.length > this.limit ? this.nextURL() : null,
      previous: this.offset > 0 ? this.previousURL() : null,
      results,
    };
  };

  readonly getOffset = () => {
    return this.offset % this.limit > 0
      ? this.offset - (this.offset % this.limit)
      : this.offset;
  };
}
