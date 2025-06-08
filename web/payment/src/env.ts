import "dotenv/config";

import { format } from "@saitamafun/shared";

type Env = "EXPIRED_AT" | "API_BASE_URL" | "APP_ID" | "API_KEY";

export const getEnv = <T extends object | number | string | null = string>(
  name: Env,
  refine?: <K extends unknown>(value: K) => T
) => {
  const value =
    process.env["NEXT_PUBLIC_" + name] ||
    process.env["NEXT_" + name] ||
    process.env[name];

  if (value)
    try {
      const parsed = JSON.parse(value) as T;
      return refine ? (refine(parsed) as T) : parsed;
    } catch {
      return (refine ? refine(value) : value) as T;
    }

  throw new Error(format("% not found in env file", name));
};
