import path from "path";
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Load .env.local so Prisma CLI has access to DATABASE_URL
loadEnvConfig(path.resolve(__dirname));

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
