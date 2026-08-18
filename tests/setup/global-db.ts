import { resetTestDatabase, TEST_DATABASE_URL } from "../../scripts/test-db";

// Vitest global setup: one clean database for the whole run.
export default async function setup() {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  await resetTestDatabase();
}
