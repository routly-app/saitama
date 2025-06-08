import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/api/index.ts ", "src/networks/index.ts"],
  format: ["esm", "cjs"],
  bundle: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: [],
});
