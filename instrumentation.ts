export async function register() {
  // Auto-migrate on boot (spec §8.8) — node runtime only, never edge/client.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("./db/migrate");
    runMigrations();
  }
}
