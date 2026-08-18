import { resetTestDatabase } from "./test-db";

const url =
  process.env.E2E_DATABASE_URL ??
  "postgres://postgres:dev@localhost:55432/shaderpath_e2e";

void resetTestDatabase(url).then(
  () => console.log(`e2e database reset: ${url}`),
  (err: unknown) => {
    console.error(err);
    process.exit(1);
  },
);
