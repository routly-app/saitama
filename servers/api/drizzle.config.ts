import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { getEnv } from "./src/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  dbCredentials: {
    url: getEnv("DATABASE_URL")!,
    ssl: "DEBUG" in process.env,
  },
  verbose: true,
  strict: true,
  out: "./drizzle",
});
