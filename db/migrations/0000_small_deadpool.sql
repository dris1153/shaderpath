CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_slug` text NOT NULL,
	`anchor_id` text,
	`label` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_bookmarks_lesson_slug` ON `bookmarks` (`lesson_slug`);--> statement-breakpoint
CREATE TABLE `exercise_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_slug` text NOT NULL,
	`exercise_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`hints_revealed` integer DEFAULT 0 NOT NULL,
	`solution_revealed` integer DEFAULT false NOT NULL,
	`user_code` text,
	`checklist_state` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_exercise_attempts_lesson_slug` ON `exercise_attempts` (`lesson_slug`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_slug` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`time_spent_seconds` integer DEFAULT 0 NOT NULL,
	`scroll_percent` real DEFAULT 0 NOT NULL,
	`confidence` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_progress_lesson_slug_unique` ON `lesson_progress` (`lesson_slug`);--> statement-breakpoint
CREATE INDEX `idx_lesson_progress_status` ON `lesson_progress` (`status`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_slug` text NOT NULL,
	`anchor_id` text,
	`selected_text` text,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notes_lesson_slug` ON `notes` (`lesson_slug`);--> statement-breakpoint
CREATE TABLE `playground_snippets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`vertex_shader` text,
	`fragment_shader` text NOT NULL,
	`uniforms_json` text,
	`forked_from_lesson` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_slug` text NOT NULL,
	`interval_days` integer DEFAULT 1 NOT NULL,
	`ease_factor` real DEFAULT 2.5 NOT NULL,
	`due_at` integer NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_queue_lesson_slug_unique` ON `review_queue` (`lesson_slug`);--> statement-breakpoint
CREATE INDEX `idx_review_queue_due_at` ON `review_queue` (`due_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_slug` text,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`duration_seconds` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_study_sessions_started_at` ON `study_sessions` (`started_at`);