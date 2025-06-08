export type LimitOffsetPagination<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};
