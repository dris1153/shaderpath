// Pure so the pooling decision can be pinned by a test: it cannot be exercised
// locally — being wrong shows up only on Supabase, as exhausted connections or
// prepared-statement errors under the transaction pooler.

export interface PoolOptions {
  max: number;
  prepare: boolean;
}

/**
 * Supabase's transaction pooler listens on 6543 and multiplexes connections,
 * which rules out prepared statements and makes a per-instance pool pointless.
 * Anything else (a direct connection, local Postgres) pools normally.
 */
export function poolOptionsFor(url: string): PoolOptions {
  const pooled = url.includes(":6543");
  return { max: pooled ? 1 : 10, prepare: !pooled };
}
