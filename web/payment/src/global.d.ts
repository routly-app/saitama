type PageProps<
  T extends Record<string, string> | null = null,
  U extends Record<string, string> | null = null
> = {
  params?: Promise<T>;
  searchParams?: Promise<U>;
};
