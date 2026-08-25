import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Spec §5 — progress only, lesson content never enters the DB.
//
// Postgres rather than SQLite: the app is deployed to Vercel, whose functions
// get a read-only filesystem and no durable local disk, so a file-backed
// database cannot hold progress there.
//
// Every table is owned by a user and protected by RLS (migration 0001):
// `USING (user_id = auth.uid())` plus FORCE ROW LEVEL SECURITY, because the app
// connects as the table owner and owners bypass policies by default. The
// foreign key to `auth.users` lives in the migration, not here — Drizzle does
// not manage Supabase's `auth` schema, and drizzle-kit diffs against its own
// snapshots rather than the live database, so the hand-written constraint
// survives future generates untouched.
//
// user_id defaults to auth.uid(): application code never names the column, so
// inserts stay literal and Drizzle types it as optional — that is what keeps
// all 72 existing query call sites unchanged.
//
// Indexes lead with user_id: RLS appends `user_id = auth.uid()` to every query,
// so a lesson_slug-only index would no longer be selective.

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().default(sql`auth.uid()`),
    lessonSlug: text("lesson_slug").notNull(),
    status: text("status", {
      enum: ["locked", "not_started", "in_progress", "completed"],
    })
      .notNull()
      .default("not_started"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
    scrollPercent: doublePrecision("scroll_percent").notNull().default(0),
    confidence: integer("confidence"),
  },
  (t) => [
    index("idx_lesson_progress_user_status").on(t.userId, t.status),
    uniqueIndex("uq_lesson_progress_user_lesson").on(t.userId, t.lessonSlug),
  ],
);

export const exerciseAttempts = pgTable(
  "exercise_attempts",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().default(sql`auth.uid()`),
    lessonSlug: text("lesson_slug").notNull(),
    exerciseId: text("exercise_id").notNull(),
    status: text("status", {
      enum: ["not_started", "attempted", "completed", "skipped"],
    })
      .notNull()
      .default("not_started"),
    hintsRevealed: integer("hints_revealed").notNull().default(0),
    solutionRevealed: boolean("solution_revealed").notNull().default(false),
    userCode: text("user_code"),
    checklistState: jsonb("checklist_state").$type<boolean[]>(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("idx_exercise_attempts_user_lesson").on(t.userId, t.lessonSlug),
    // One row per exercise per user — required by the upsert in lib/exercises.ts
    uniqueIndex("uq_exercise_attempts_user_lesson_exercise").on(
      t.userId,
      t.lessonSlug,
      t.exerciseId,
    ),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().default(sql`auth.uid()`),
    lessonSlug: text("lesson_slug").notNull(),
    anchorId: text("anchor_id"),
    selectedText: text("selected_text"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("idx_notes_user_lesson").on(t.userId, t.lessonSlug)],
);

// Spec left this table as a stub — full definition per decision D5.
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().default(sql`auth.uid()`),
    lessonSlug: text("lesson_slug").notNull(),
    anchorId: text("anchor_id"),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("idx_bookmarks_user_lesson").on(t.userId, t.lessonSlug)],
);

export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().default(sql`auth.uid()`),
    lessonSlug: text("lesson_slug"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds").notNull().default(0),
  },
  (t) => [index("idx_study_sessions_user_started_at").on(t.userId, t.startedAt)],
);

export const reviewQueue = pgTable(
  "review_queue",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().default(sql`auth.uid()`),
    lessonSlug: text("lesson_slug").notNull(),
    intervalDays: integer("interval_days").notNull().default(1),
    easeFactor: doublePrecision("ease_factor").notNull().default(2.5),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    reviewCount: integer("review_count").notNull().default(0),
  },
  (t) => [
    index("idx_review_queue_user_due_at").on(t.userId, t.dueAt),
    uniqueIndex("uq_review_queue_user_lesson").on(t.userId, t.lessonSlug),
  ],
);

export const playgroundSnippets = pgTable(
  "playground_snippets",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().default(sql`auth.uid()`),
    title: text("title").notNull(),
    vertexShader: text("vertex_shader"),
    fragmentShader: text("fragment_shader").notNull(),
    uniformsJson: jsonb("uniforms_json"),
    forkedFromLesson: text("forked_from_lesson"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("idx_playground_snippets_user").on(t.userId)],
);

// The `settings` table is gone (migration 0001). Its only key was quality_tier,
// which describes the *device* doing the rendering, not the account — it lives
// in localStorage now. Dropping it also removed the last database read from the
// root layout, which had to stay static.
