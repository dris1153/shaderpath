export function register() {
  // Migrations used to run here (spec §8.8). They now run as a deploy step
  // (pnpm db:migrate) instead: on Vercel this hook fires on every cold start,
  // and DDL does not belong on the request path or through the pooler.
}
