import { custom } from "zod";

export const isBigInt = (...value: Parameters<typeof BigInt>) => {
  try {
    BigInt(...value);
    return true;
  } catch {
    return false;
  }
};

export const bigInt = () =>
  custom<string>()
    .refine((value) => isBigInt(value), {
      message: "must be a valid bigint string",
    })
    .transform((value) => BigInt(value));

export const string = () =>
  custom<bigint>()
    .refine((value) => isBigInt(value), {
      message: "must be a valid bigint string",
    })
    .transform((value) => value.toString());
