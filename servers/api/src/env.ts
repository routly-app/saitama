import "dotenv/config";

import { format } from "@saitamafun/shared";

type Env =
  | "PORT"
  | "HOST"
  | "EXPIRED_AT"
  | "REDIS_URL"
  | "TRON_RPC_URL"
  | "SOLANA_RPC_URL"
  | "ETHEREUM_RPC_URL"
  | "DATABASE_URL"
  | "SECRET_KEY"
  | "MNEMONIC"
  | "SERVICE_ACCOUNT";

export const getEnv = <T extends object | number | string | null = string>(
  name: Env,
  refine?: <K extends unknown>(value: K) => T
) => {
  const value = process.env["APP_" + name] || process.env[name];
  if (value)
    try {
      const parsed = JSON.parse(value) as T;
      return refine ? (refine(parsed) as T) : parsed;
    } catch {
      return (refine ? refine(value) : value) as T;
    }
  throw new Error(format("% not found in env file", name));
};
