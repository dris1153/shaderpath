import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  // Migrations are applied from the CLI (pnpm db:migrate), never at request
  // time: on Vercel that would fire on every cold start against the pooler.
  dbCredentials: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "" },
});
