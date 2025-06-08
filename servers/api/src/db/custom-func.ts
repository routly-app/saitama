import { sql } from "drizzle-orm";
import type { Column } from "drizzle-orm";

export const lower = <T extends Column>(column: T) => sql`LOWER(${column})`;
