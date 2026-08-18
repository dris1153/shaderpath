CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_slug" text NOT NULL,
	"anchor_id" text,
	"label" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_slug" text NOT NULL,
	"exercise_id" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"hints_revealed" integer DEFAULT 0 NOT NULL,
	"solution_revealed" boolean DEFAULT false NOT NULL,
	"user_code" text,
	"checklist_state" jsonb,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_slug" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"scroll_percent" double precision DEFAULT 0 NOT NULL,
	"confidence" integer,
	CONSTRAINT "lesson_progress_lesson_slug_unique" UNIQUE("lesson_slug")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_slug" text NOT NULL,
	"anchor_id" text,
	"selected_text" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playground_snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"vertex_shader" text,
	"fragment_shader" text NOT NULL,
	"uniforms_json" jsonb,
	"forked_from_lesson" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_slug" text NOT NULL,
	"interval_days" integer DEFAULT 1 NOT NULL,
	"ease_factor" double precision DEFAULT 2.5 NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "review_queue_lesson_slug_unique" UNIQUE("lesson_slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_slug" text,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_bookmarks_lesson_slug" ON "bookmarks" USING btree ("lesson_slug");--> statement-breakpoint
CREATE INDEX "idx_exercise_attempts_lesson_slug" ON "exercise_attempts" USING btree ("lesson_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_exercise_attempts_lesson_exercise" ON "exercise_attempts" USING btree ("lesson_slug","exercise_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_status" ON "lesson_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notes_lesson_slug" ON "notes" USING btree ("lesson_slug");--> statement-breakpoint
CREATE INDEX "idx_review_queue_due_at" ON "review_queue" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "idx_study_sessions_started_at" ON "study_sessions" USING btree ("started_at");