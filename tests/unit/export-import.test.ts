import { beforeAll, describe, expect, it } from "vitest";


import { db, withUser } from "@/db/client";
import { lessonProgress, notes } from "@/db/schema";
import { serialize, apply } from "@/lib/export-import";

import { truncateAll } from "../setup/reset-tables";
import { createTestUser } from "../setup/test-users";

let ownerId: string;
let otherId: string;

beforeAll(async () => {
  await truncateAll();
  ownerId = await createTestUser();
  otherId = await createTestUser();
});

// Every DB test runs inside withUser: RLS filters anything outside it, and the
// user_id default needs the JWT claim withUser sets.
const asOwner = <T>(fn: () => Promise<T>) => withUser(ownerId, fn);
const { validate, SCHEMA_VERSION, SchemaVersionError, ValidationError } = await import(
  "@/lib/export-import-schema"
);


async function seed() {
  await db.insert(lessonProgress)
    .values({
      lessonSlug: "vector-basics",
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      timeSpentSeconds: 120,
      scrollPercent: 1,
      confidence: 4,
    });
  await db.insert(notes)
    .values({
      lessonSlug: "vector-basics",
      anchorId: "intro",
      selectedText: "hi",
      body: "note body",
      createdAt: new Date(),
    });
}

// Simulates the real GET → JSON.stringify → download → parse round trip:
// dates become ISO strings, matching what validate()/await apply() must accept.
function roundTripThroughJson(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

describe("export-import round trip", () => {
  it("serializes, wipes, and restores identical data via await apply(replace)", async () => {
    await asOwner(async () => {
      await seed();
      const exported = await serialize();
      const payload = validate(roundTripThroughJson(exported));

      await db.delete(lessonProgress);
      await db.delete(notes);
      expect(await db.select().from(lessonProgress)).toHaveLength(0);

      const counts = await apply(payload, "replace");
      expect(counts.lessonProgress).toBe(1);
      expect(counts.notes).toBe(1);

      const restored = await db.select().from(lessonProgress);
      expect(restored).toHaveLength(1);
      expect(restored[0]?.lessonSlug).toBe("vector-basics");
      expect(restored[0]?.scrollPercent).toBe(1);
      expect(restored[0]?.confidence).toBe(4);
      expect(restored[0]?.startedAt).toBeInstanceOf(Date);

      const restoredNotes = await db.select().from(notes);
      expect(restoredNotes[0]?.body).toBe("note body");
    });
  });

  it("merge upserts by natural key instead of wiping other rows", async () => {
    await asOwner(async () => {
      await db.delete(lessonProgress);
      await db.insert(lessonProgress)
        .values({ lessonSlug: "keep-me", status: "in_progress", timeSpentSeconds: 5 });

      const exported = await serialize();
      const json = roundTripThroughJson(exported) as {
        schemaVersion: number;
        exportedAt: string;
        tables: { lessonProgress: unknown[] };
      };
      json.tables.lessonProgress = [
        {
          lessonSlug: "merged-in",
          status: "completed",
          startedAt: null,
          completedAt: null,
          timeSpentSeconds: 10,
          scrollPercent: 0.5,
          confidence: null,
        },
      ];
      const payload = validate(json);
      await apply(payload, "merge");

      const slugs = (await db.select().from(lessonProgress)).map(
        (r) => r.lessonSlug,
      );
      expect(slugs).toContain("keep-me");
      expect(slugs).toContain("merged-in");
    });
  });

  it("rejects wrong schemaVersion", async () => {
    await asOwner(async () => {
      const bad = { schemaVersion: SCHEMA_VERSION + 1, exportedAt: new Date().toISOString(), tables: {} };
      expect(() => validate(bad)).toThrow(SchemaVersionError);
    });
  });

  it("rejects unknown table keys", async () => {
    await asOwner(async () => {
      const json = roundTripThroughJson(await serialize()) as {
        tables: Record<string, unknown>;
      };
      json.tables.notATable = [];
      expect(() => validate(json)).toThrow(ValidationError);
    });
  });

  it("rejects oversized strings", async () => {
    await asOwner(async () => {
      const json = roundTripThroughJson(await serialize()) as {
        tables: Record<string, unknown>;
      };
      json.tables.notes = [
        {
          lessonSlug: "x",
          anchorId: null,
          selectedText: null,
          body: "y".repeat(10_001),
          createdAt: new Date().toISOString(),
        },
      ];
      expect(() => validate(json)).toThrow(ValidationError);
    });
  });

  it("rejects wrong enum values", async () => {
    await asOwner(async () => {
      const json = roundTripThroughJson(await serialize()) as {
        tables: Record<string, unknown>;
      };
      json.tables.lessonProgress = [
        {
          lessonSlug: "x",
          status: "bogus",
          startedAt: null,
          completedAt: null,
          timeSpentSeconds: 0,
          scrollPercent: 0,
          confidence: null,
        },
      ];
      expect(() => validate(json)).toThrow(ValidationError);
    });
  });

  it("restores one account's file into another without colliding on row ids", async () => {
    // The real use for export/import: move a backup to a new account. Row ids
    // are per-database serials, so a file that carried them would land on
    // whichever rows happen to hold those numbers in the destination.
    await asOwner(async () => {
      await db.delete(lessonProgress);
      await db.delete(notes);
      await db.insert(lessonProgress).values({
        lessonSlug: "vector-basics",
        status: "completed",
        timeSpentSeconds: 60,
      });
      await db.insert(notes).values({
        lessonSlug: "vector-basics",
        body: "owner note",
        createdAt: new Date(),
      });
    });

    // The other account already holds rows, so the ids in the file (if any
    // survived) would point at these.
    await withUser(otherId, async () => {
      await db.insert(lessonProgress).values({
        lessonSlug: "dot-and-cross-products",
        status: "in_progress",
        timeSpentSeconds: 5,
      });
    });

    const file = validate(roundTripThroughJson(await asOwner(() => serialize())));
    await withUser(otherId, () => apply(file, "merge"));

    const theirs = await withUser(otherId, () => db.select().from(lessonProgress));
    expect(theirs.map((r) => r.lessonSlug).sort()).toEqual([
      "dot-and-cross-products",
      "vector-basics",
    ]);
    // Their own row survived untouched.
    expect(theirs.find((r) => r.lessonSlug === "dot-and-cross-products")?.timeSpentSeconds).toBe(5);

    // And the owner's rows are exactly as they were.
    const mine = await asOwner(() => db.select().from(lessonProgress));
    expect(mine).toHaveLength(1);
    expect(mine[0]?.timeSpentSeconds).toBe(60);
  });
});
