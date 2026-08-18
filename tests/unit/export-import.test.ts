import { beforeAll, describe, expect, it } from "vitest";


import { db } from "@/db/client";
import { lessonProgress, notes, settings } from "@/db/schema";
import { serialize, apply } from "@/lib/export-import";

import { truncateAll } from "../setup/reset-tables";

beforeAll(truncateAll);
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
  await db.insert(settings).values({ key: "quality_tier", value: "high" });
}

// Simulates the real GET → JSON.stringify → download → parse round trip:
// dates become ISO strings, matching what validate()/await apply() must accept.
function roundTripThroughJson(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

describe("export-import round trip", () => {
  it("serializes, wipes, and restores identical data via await apply(replace)", async () => {
    await seed();
    const exported = await serialize();
    const payload = validate(roundTripThroughJson(exported));

    await db.delete(lessonProgress);
    await db.delete(notes);
    await db.delete(settings);
    expect(await db.select().from(lessonProgress)).toHaveLength(0);

    const counts = await apply(payload, "replace");
    expect(counts.lessonProgress).toBe(1);
    expect(counts.notes).toBe(1);
    expect(counts.settings).toBe(1);

    const restored = await db.select().from(lessonProgress);
    expect(restored).toHaveLength(1);
    expect(restored[0]?.lessonSlug).toBe("vector-basics");
    expect(restored[0]?.scrollPercent).toBe(1);
    expect(restored[0]?.confidence).toBe(4);
    expect(restored[0]?.startedAt).toBeInstanceOf(Date);

    const restoredNotes = await db.select().from(notes);
    expect(restoredNotes[0]?.body).toBe("note body");

    const restoredSettings = await db.select().from(settings);
    expect(restoredSettings.find((s) => s.key === "quality_tier")?.value).toBe("high");
  });

  it("merge upserts by natural key instead of wiping other rows", async () => {
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
        id: 999,
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

  it("rejects wrong schemaVersion", async () => {
    const bad = { schemaVersion: SCHEMA_VERSION + 1, exportedAt: new Date().toISOString(), tables: {} };
    expect(() => validate(bad)).toThrow(SchemaVersionError);
  });

  it("rejects unknown table keys", async () => {
    const json = roundTripThroughJson(await serialize()) as {
      tables: Record<string, unknown>;
    };
    json.tables.notATable = [];
    expect(() => validate(json)).toThrow(ValidationError);
  });

  it("rejects oversized strings", async () => {
    const json = roundTripThroughJson(await serialize()) as {
      tables: Record<string, unknown>;
    };
    json.tables.notes = [
      {
        id: 1,
        lessonSlug: "x",
        anchorId: null,
        selectedText: null,
        body: "y".repeat(10_001),
        createdAt: new Date().toISOString(),
      },
    ];
    expect(() => validate(json)).toThrow(ValidationError);
  });

  it("rejects wrong enum values", async () => {
    const json = roundTripThroughJson(await serialize()) as {
      tables: Record<string, unknown>;
    };
    json.tables.lessonProgress = [
      {
        id: 1,
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
