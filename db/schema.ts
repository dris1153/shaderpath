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
} from "drizzle-orm/pg-core";

// Spec §5 — progress only, lesson content never enters the DB.
//
// Postgres rather than SQLite: the app is deployed to Vercel, whose functions
// get a read-only filesystem and no durable local disk, so a file-backed
// database cannot hold progress there.

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    lessonSlug: text("lesson_slug").notNull().unique(),
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
  (t) => [index("idx_lesson_progress_status").on(t.status)],
);

export const exerciseAttempts = pgTable(
  "exercise_attempts",
  {
    id: serial("id").primaryKey(),
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
    index("idx_exercise_attempts_lesson_slug").on(t.lessonSlug),
    // One row per exercise — required by the upsert in lib/exercises.ts
    uniqueIndex("uq_exercise_attempts_lesson_exercise").on(
      t.lessonSlug,
      t.exerciseId,
    ),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    lessonSlug: text("lesson_slug").notNull(),
    anchorId: text("anchor_id"),
    selectedText: text("selected_text"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("idx_notes_lesson_slug").on(t.lessonSlug)],
);

// Spec left this table as a stub — full definition per decision D5.
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    lessonSlug: text("lesson_slug").notNull(),
    anchorId: text("anchor_id"),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("idx_bookmarks_lesson_slug").on(t.lessonSlug)],
);

export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    lessonSlug: text("lesson_slug"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds").notNull().default(0),
  },
  (t) => [index("idx_study_sessions_started_at").on(t.startedAt)],
);

export const reviewQueue = pgTable(
  "review_queue",
  {
    id: serial("id").primaryKey(),
    lessonSlug: text("lesson_slug").notNull().unique(),
    intervalDays: integer("interval_days").notNull().default(1),
    easeFactor: doublePrecision("ease_factor").notNull().default(2.5),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    reviewCount: integer("review_count").notNull().default(0),
  },
  (t) => [index("idx_review_queue_due_at").on(t.dueAt)],
);

export const playgroundSnippets = pgTable("playground_snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  vertexShader: text("vertex_shader"),
  fragmentShader: text("fragment_shader").notNull(),
  uniformsJson: jsonb("uniforms_json"),
  forkedFromLesson: text("forked_from_lesson"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
