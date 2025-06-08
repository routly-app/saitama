export const getObjectKeyOrThrow = <
  T extends object | string,
  U extends keyof T
>(
  value: T,
  key: U
): Exclude<T[U], string> => {
  if (value) {
    if (typeof value === "object" && key in value)
      return value[key] as Exclude<T[U], string>;
  } else return null;
  
  throw new Error("expected object got string");
};
