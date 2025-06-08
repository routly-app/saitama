import postgres from "postgres";
import { sql, type Column } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

export const createDB = (url: string) => {
  const client = postgres(url);
  return drizzle(client, { schema });
};

export const as = <T extends Column | string, U extends string>(
  column: T,
  name: U
) => sql`${column}`.as(name);

export type Database = ReturnType<typeof createDB>;
