import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Spec §5 — progress only, lesson content never enters the DB.

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonSlug: text("lesson_slug").notNull().unique(),
    status: text("status", {
      enum: ["locked", "not_started", "in_progress", "completed"],
    })
      .notNull()
      .default("not_started"),
    startedAt: integer("started_at", { mode: "timestamp" }),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
    scrollPercent: real("scroll_percent").notNull().default(0),
    confidence: integer("confidence"),
  },
  (t) => [index("idx_lesson_progress_status").on(t.status)],
);

export const exerciseAttempts = sqliteTable(
  "exercise_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonSlug: text("lesson_slug").notNull(),
    exerciseId: text("exercise_id").notNull(),
    status: text("status", {
      enum: ["not_started", "attempted", "completed", "skipped"],
    })
      .notNull()
      .default("not_started"),
    hintsRevealed: integer("hints_revealed").notNull().default(0),
    solutionRevealed: integer("solution_revealed", { mode: "boolean" })
      .notNull()
      .default(false),
    userCode: text("user_code"),
    checklistState: text("checklist_state", { mode: "json" }).$type<boolean[]>(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
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

export const notes = sqliteTable(
  "notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonSlug: text("lesson_slug").notNull(),
    anchorId: text("anchor_id"),
    selectedText: text("selected_text"),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("idx_notes_lesson_slug").on(t.lessonSlug)],
);

// Spec left this table as a stub — full definition per decision D5.
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonSlug: text("lesson_slug").notNull(),
    anchorId: text("anchor_id"),
    label: text("label"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("idx_bookmarks_lesson_slug").on(t.lessonSlug)],
);

export const studySessions = sqliteTable(
  "study_sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonSlug: text("lesson_slug"),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    endedAt: integer("ended_at", { mode: "timestamp" }),
    durationSeconds: integer("duration_seconds").notNull().default(0),
  },
  (t) => [index("idx_study_sessions_started_at").on(t.startedAt)],
);

export const reviewQueue = sqliteTable(
  "review_queue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonSlug: text("lesson_slug").notNull().unique(),
    intervalDays: integer("interval_days").notNull().default(1),
    easeFactor: real("ease_factor").notNull().default(2.5),
    dueAt: integer("due_at", { mode: "timestamp" }).notNull(),
    reviewCount: integer("review_count").notNull().default(0),
  },
  (t) => [index("idx_review_queue_due_at").on(t.dueAt)],
);

export const playgroundSnippets = sqliteTable("playground_snippets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  vertexShader: text("vertex_shader"),
  fragmentShader: text("fragment_shader").notNull(),
  uniformsJson: text("uniforms_json", { mode: "json" }),
  forkedFromLesson: text("forked_from_lesson"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
