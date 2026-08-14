import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

process.env.SHADERPATH_DB = path.join(
  os.tmpdir(),
  `shaderpath-ei-test-${process.pid}-${Date.now()}.db`,
);

const { runMigrations } = await import("@/db/migrate");
const { db } = await import("@/db/client");
const { lessonProgress, notes, settings } = await import("@/db/schema");
const { serialize, apply } = await import("@/lib/export-import");
const { validate, SCHEMA_VERSION, SchemaVersionError, ValidationError } = await import(
  "@/lib/export-import-schema"
);

runMigrations();

function seed() {
  db.insert(lessonProgress)
    .values({
      lessonSlug: "vector-basics",
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      timeSpentSeconds: 120,
      scrollPercent: 1,
      confidence: 4,
    })
    .run();
  db.insert(notes)
    .values({
      lessonSlug: "vector-basics",
      anchorId: "intro",
      selectedText: "hi",
      body: "note body",
      createdAt: new Date(),
    })
    .run();
  db.insert(settings).values({ key: "quality_tier", value: "high" }).run();
}

// Simulates the real GET → JSON.stringify → download → parse round trip:
// dates become ISO strings, matching what validate()/apply() must accept.
function roundTripThroughJson(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

describe("export-import round trip", () => {
  it("serializes, wipes, and restores identical data via apply(replace)", () => {
    seed();
    const exported = serialize();
    const payload = validate(roundTripThroughJson(exported));

    db.delete(lessonProgress).run();
    db.delete(notes).run();
    db.delete(settings).run();
    expect(db.select().from(lessonProgress).all()).toHaveLength(0);

    const counts = apply(payload, "replace");
    expect(counts.lessonProgress).toBe(1);
    expect(counts.notes).toBe(1);
    expect(counts.settings).toBe(1);

    const restored = db.select().from(lessonProgress).all();
    expect(restored).toHaveLength(1);
    expect(restored[0]?.lessonSlug).toBe("vector-basics");
    expect(restored[0]?.scrollPercent).toBe(1);
    expect(restored[0]?.confidence).toBe(4);
    expect(restored[0]?.startedAt).toBeInstanceOf(Date);

    const restoredNotes = db.select().from(notes).all();
    expect(restoredNotes[0]?.body).toBe("note body");

    const restoredSettings = db.select().from(settings).all();
    expect(restoredSettings.find((s) => s.key === "quality_tier")?.value).toBe("high");
  });

  it("merge upserts by natural key instead of wiping other rows", () => {
    db.delete(lessonProgress).run();
    db.insert(lessonProgress)
      .values({ lessonSlug: "keep-me", status: "in_progress", timeSpentSeconds: 5 })
      .run();

    const exported = serialize();
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
    apply(payload, "merge");

    const slugs = db
      .select()
      .from(lessonProgress)
      .all()
      .map((r) => r.lessonSlug);
    expect(slugs).toContain("keep-me");
    expect(slugs).toContain("merged-in");
  });

  it("rejects wrong schemaVersion", () => {
    const bad = { schemaVersion: SCHEMA_VERSION + 1, exportedAt: new Date().toISOString(), tables: {} };
    expect(() => validate(bad)).toThrow(SchemaVersionError);
  });

  it("rejects unknown table keys", () => {
    const json = roundTripThroughJson(serialize()) as {
      tables: Record<string, unknown>;
    };
    json.tables.notATable = [];
    expect(() => validate(json)).toThrow(ValidationError);
  });

  it("rejects oversized strings", () => {
    const json = roundTripThroughJson(serialize()) as {
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

  it("rejects wrong enum values", () => {
    const json = roundTripThroughJson(serialize()) as {
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
