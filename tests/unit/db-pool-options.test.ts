import { describe, expect, it } from "vitest";
import { poolOptionsFor } from "@/lib/db-pool-options";

// Cannot be checked locally: the behaviour only differs against Supabase's
// transaction pooler, so the intent is pinned here instead.
describe("connection pooling", () => {
  it("collapses to one connection without prepared statements on the pooler", () => {
    const opts = poolOptionsFor(
      "postgresql://postgres.ref:pw@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    );
    expect(opts).toEqual({ max: 1, prepare: false });
  });

  it("pools normally on a direct connection", () => {
    const opts = poolOptionsFor(
      "postgresql://postgres.ref:pw@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
    );
    expect(opts).toEqual({ max: 10, prepare: true });
  });

  it("pools normally against local Postgres", () => {
    expect(poolOptionsFor("postgres://postgres:dev@localhost:55432/x")).toEqual({
      max: 10,
      prepare: true,
    });
  });
});
