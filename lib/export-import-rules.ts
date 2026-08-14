// Hand-rolled field-level validators (no new deps) — one rule map per table,
// checked against every row before an import is trusted.

import type { ImportTables } from "./export-import-types";

// Field caps (§ Security Considerations): generic free-text fields are capped
// at ~10k; code/shader fields keep the larger caps already enforced at
// write-time by lib/exercises.ts and lib/playground.ts so legitimate content
// round-trips.
const MAX_STR = 10_000;
const MAX_CODE_STR = 128 * 1024;
const MAX_SHADER_STR = 64 * 1024;
const MAX_CHECKLIST = 50;
const MAX_ROWS = 20_000;

type Rule = (v: unknown) => boolean;

const strMax =
  (max: number): Rule =>
  (v) =>
    typeof v === "string" && v.length <= max;
const strMaxOrNull =
  (max: number): Rule =>
  (v) =>
    v === null || strMax(max)(v);
const num: Rule = (v) => typeof v === "number" && Number.isFinite(v);
const numOrNull: Rule = (v) => v === null || num(v);
const int: Rule = (v) => Number.isInteger(v);
const bool: Rule = (v) => typeof v === "boolean";
const isoDate: Rule = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));
const isoDateOrNull: Rule = (v) => v === null || isoDate(v);
const enumOf =
  (values: readonly string[]): Rule =>
  (v) =>
    typeof v === "string" && values.includes(v);
const boolArrayMaxOrNull =
  (max: number): Rule =>
  (v) =>
    v === null ||
    (Array.isArray(v) && v.length <= max && v.every((x) => typeof x === "boolean"));
const jsonMaxOrNull =
  (maxBytes: number): Rule =>
  (v) => {
    if (v === null || v === undefined) return true;
    try {
      return JSON.stringify(v).length <= maxBytes;
    } catch {
      return false;
    }
  };

const RULES: Record<keyof ImportTables, Record<string, Rule>> = {
  lessonProgress: {
    id: int,
    lessonSlug: strMax(MAX_STR),
    status: enumOf(["locked", "not_started", "in_progress", "completed"]),
    startedAt: isoDateOrNull,
    completedAt: isoDateOrNull,
    timeSpentSeconds: int,
    scrollPercent: num,
    confidence: numOrNull,
  },
  exerciseAttempts: {
    id: int,
    lessonSlug: strMax(MAX_STR),
    exerciseId: strMax(MAX_STR),
    status: enumOf(["not_started", "attempted", "completed", "skipped"]),
    hintsRevealed: int,
    solutionRevealed: bool,
    userCode: strMaxOrNull(MAX_CODE_STR),
    checklistState: boolArrayMaxOrNull(MAX_CHECKLIST),
    updatedAt: isoDate,
  },
  notes: {
    id: int,
    lessonSlug: strMax(MAX_STR),
    anchorId: strMaxOrNull(MAX_STR),
    selectedText: strMaxOrNull(MAX_STR),
    body: strMax(MAX_STR),
    createdAt: isoDate,
  },
  bookmarks: {
    id: int,
    lessonSlug: strMax(MAX_STR),
    anchorId: strMaxOrNull(MAX_STR),
    label: strMaxOrNull(MAX_STR),
    createdAt: isoDate,
  },
  studySessions: {
    id: int,
    lessonSlug: strMaxOrNull(MAX_STR),
    startedAt: isoDate,
    endedAt: isoDateOrNull,
    durationSeconds: int,
  },
  reviewQueue: {
    id: int,
    lessonSlug: strMax(MAX_STR),
    intervalDays: int,
    easeFactor: num,
    dueAt: isoDate,
    reviewCount: int,
  },
  playgroundSnippets: {
    id: int,
    title: strMax(MAX_STR),
    vertexShader: strMaxOrNull(MAX_SHADER_STR),
    fragmentShader: strMax(MAX_SHADER_STR),
    uniformsJson: jsonMaxOrNull(MAX_STR),
    forkedFromLesson: strMaxOrNull(MAX_STR),
    createdAt: isoDate,
  },
  settings: {
    key: strMax(MAX_STR),
    value: strMax(MAX_STR),
  },
};

export const TABLE_NAMES = Object.keys(RULES) as (keyof ImportTables)[];

function validateRows(tableName: keyof ImportTables, raw: unknown, issues: string[]): void {
  if (!Array.isArray(raw)) {
    issues.push(`${tableName}: expected an array`);
    return;
  }
  if (raw.length > MAX_ROWS) {
    issues.push(`${tableName}: too many rows (max ${MAX_ROWS})`);
    return;
  }
  const rules = RULES[tableName];
  raw.forEach((row, i) => {
    if (typeof row !== "object" || row === null) {
      issues.push(`${tableName}[${i}]: expected an object`);
      return;
    }
    const obj = row as Record<string, unknown>;
    for (const [col, rule] of Object.entries(rules)) {
      if (!rule(obj[col])) issues.push(`${tableName}[${i}].${col}: invalid value`);
    }
  });
}

/** Validates the `tables` object shape; appends to `issues`, returns null on any problem. */
export function validateTables(raw: unknown, issues: string[]): ImportTables | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    issues.push("tables: expected an object");
    return null;
  }
  const obj = raw as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!TABLE_NAMES.includes(key as keyof ImportTables)) {
      issues.push(`tables: unknown table "${key}"`);
    }
  }
  const before = issues.length;
  for (const name of TABLE_NAMES) {
    validateRows(name, obj[name], issues);
  }
  if (issues.length > before) return null;
  // Field-by-field validation above confirms this matches ImportTables.
  return obj as unknown as ImportTables;
}
