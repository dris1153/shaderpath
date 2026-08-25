-- Multi-user ownership + row level security.
--
-- Hand-written, not generated: it carries a data backfill and RLS/FORCE
-- statements drizzle-kit does not emit. drizzle-kit diffs schema.ts against its
-- own snapshots (never the live database), so everything added here that is
-- absent from schema.ts -- the auth.users foreign keys, the policies, FORCE --
-- is left alone by future generates.
--
-- BACKFILL: existing rows belong to nobody. They are assigned to the account
-- named by `app.backfill_user_id`, which db/migrate.ts sets from
-- BACKFILL_USER_ID. That account MUST already exist in auth.users: sign up
-- first, take the uuid from the Supabase dashboard, then migrate. On a database
-- with no rows the setting may be left unset.

--> statement-breakpoint
DO $backfill$
DECLARE
  target uuid := nullif(current_setting('app.backfill_user_id', true), '')::uuid;
  orphans bigint;
BEGIN
  -- 1. add the column, nullable for now
  ALTER TABLE "lesson_progress"     ADD COLUMN IF NOT EXISTS "user_id" uuid;
  ALTER TABLE "exercise_attempts"   ADD COLUMN IF NOT EXISTS "user_id" uuid;
  ALTER TABLE "notes"               ADD COLUMN IF NOT EXISTS "user_id" uuid;
  ALTER TABLE "bookmarks"           ADD COLUMN IF NOT EXISTS "user_id" uuid;
  ALTER TABLE "study_sessions"      ADD COLUMN IF NOT EXISTS "user_id" uuid;
  ALTER TABLE "review_queue"        ADD COLUMN IF NOT EXISTS "user_id" uuid;
  ALTER TABLE "playground_snippets" ADD COLUMN IF NOT EXISTS "user_id" uuid;

  -- 2. claim existing rows for the target account
  IF target IS NOT NULL THEN
    UPDATE "lesson_progress"     SET "user_id" = target WHERE "user_id" IS NULL;
    UPDATE "exercise_attempts"   SET "user_id" = target WHERE "user_id" IS NULL;
    UPDATE "notes"               SET "user_id" = target WHERE "user_id" IS NULL;
    UPDATE "bookmarks"           SET "user_id" = target WHERE "user_id" IS NULL;
    UPDATE "study_sessions"      SET "user_id" = target WHERE "user_id" IS NULL;
    UPDATE "review_queue"        SET "user_id" = target WHERE "user_id" IS NULL;
    UPDATE "playground_snippets" SET "user_id" = target WHERE "user_id" IS NULL;
  END IF;

  -- 3. refuse to continue if anything would violate NOT NULL: a silent data
  --    loss here is worse than a failed migration.
  SELECT
    (SELECT count(*) FROM "lesson_progress"     WHERE "user_id" IS NULL)
  + (SELECT count(*) FROM "exercise_attempts"   WHERE "user_id" IS NULL)
  + (SELECT count(*) FROM "notes"               WHERE "user_id" IS NULL)
  + (SELECT count(*) FROM "bookmarks"           WHERE "user_id" IS NULL)
  + (SELECT count(*) FROM "study_sessions"      WHERE "user_id" IS NULL)
  + (SELECT count(*) FROM "review_queue"        WHERE "user_id" IS NULL)
  + (SELECT count(*) FROM "playground_snippets" WHERE "user_id" IS NULL)
  INTO orphans;

  IF orphans > 0 THEN
    RAISE EXCEPTION
      'Cannot migrate: % rows have no owner. Set BACKFILL_USER_ID to an existing auth.users id and re-run.', orphans;
  END IF;
END
$backfill$;

--> statement-breakpoint
ALTER TABLE "lesson_progress"     ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "exercise_attempts"   ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notes"               ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookmarks"           ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions"      ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "review_queue"        ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "playground_snippets" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint

-- Cascade so deleting an account removes every row it owned, with no
-- application-side sweep to forget.
ALTER TABLE "lesson_progress"     ADD CONSTRAINT "fk_lesson_progress_user"     FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exercise_attempts"   ADD CONSTRAINT "fk_exercise_attempts_user"   FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notes"               ADD CONSTRAINT "fk_notes_user"               FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bookmarks"           ADD CONSTRAINT "fk_bookmarks_user"           FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_sessions"      ADD CONSTRAINT "fk_study_sessions_user"      FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "review_queue"        ADD CONSTRAINT "fk_review_queue_user"        FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "playground_snippets" ADD CONSTRAINT "fk_playground_snippets_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

-- Uniqueness was system-wide: one progress row per lesson for the WHOLE app.
-- Re-scope it per owner, or the second user cannot start the first lesson.
DROP INDEX IF EXISTS "idx_lesson_progress_status";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_exercise_attempts_lesson_slug";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_notes_lesson_slug";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_bookmarks_lesson_slug";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_study_sessions_started_at";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_review_queue_due_at";--> statement-breakpoint
DROP INDEX IF EXISTS "uq_exercise_attempts_lesson_exercise";--> statement-breakpoint
ALTER TABLE "lesson_progress" DROP CONSTRAINT IF EXISTS "lesson_progress_lesson_slug_unique";--> statement-breakpoint
ALTER TABLE "review_queue"    DROP CONSTRAINT IF EXISTS "review_queue_lesson_slug_unique";--> statement-breakpoint

CREATE INDEX "idx_lesson_progress_user_status" ON "lesson_progress" ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_lesson_progress_user_lesson" ON "lesson_progress" ("user_id","lesson_slug");--> statement-breakpoint
CREATE INDEX "idx_exercise_attempts_user_lesson" ON "exercise_attempts" ("user_id","lesson_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_exercise_attempts_user_lesson_exercise" ON "exercise_attempts" ("user_id","lesson_slug","exercise_id");--> statement-breakpoint
CREATE INDEX "idx_notes_user_lesson" ON "notes" ("user_id","lesson_slug");--> statement-breakpoint
CREATE INDEX "idx_bookmarks_user_lesson" ON "bookmarks" ("user_id","lesson_slug");--> statement-breakpoint
CREATE INDEX "idx_study_sessions_user_started_at" ON "study_sessions" ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_review_queue_user_due_at" ON "review_queue" ("user_id","due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_review_queue_user_lesson" ON "review_queue" ("user_id","lesson_slug");--> statement-breakpoint
CREATE INDEX "idx_playground_snippets_user" ON "playground_snippets" ("user_id");--> statement-breakpoint

-- Default the owner from the JWT so INSERTs stay literal: application code
-- never names user_id, which is what keeps all 72 existing query call sites
-- unchanged.
ALTER TABLE "lesson_progress"     ALTER COLUMN "user_id" SET DEFAULT auth.uid();--> statement-breakpoint
ALTER TABLE "exercise_attempts"   ALTER COLUMN "user_id" SET DEFAULT auth.uid();--> statement-breakpoint
ALTER TABLE "notes"               ALTER COLUMN "user_id" SET DEFAULT auth.uid();--> statement-breakpoint
ALTER TABLE "bookmarks"           ALTER COLUMN "user_id" SET DEFAULT auth.uid();--> statement-breakpoint
ALTER TABLE "study_sessions"      ALTER COLUMN "user_id" SET DEFAULT auth.uid();--> statement-breakpoint
ALTER TABLE "review_queue"        ALTER COLUMN "user_id" SET DEFAULT auth.uid();--> statement-breakpoint
ALTER TABLE "playground_snippets" ALTER COLUMN "user_id" SET DEFAULT auth.uid();--> statement-breakpoint

-- RLS. ENABLE alone is not enough: the app connects as the table owner, and
-- PostgreSQL lets owners bypass policies unless FORCE is set. Without FORCE
-- this whole migration would be decorative -- no error, no failing test, every
-- user reading everyone's rows.
DO $rls$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'lesson_progress','exercise_attempts','notes','bookmarks',
    'study_sessions','review_queue','playground_snippets'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_owner', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO public USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())',
      t || '_owner', t);
  END LOOP;
END
$rls$;

--> statement-breakpoint
-- withUser() does SET LOCAL ROLE authenticated, so that role needs table and
-- sequence rights. The local test shim grants these itself, which is precisely
-- why their absence here would only ever show up in production — as
-- "permission denied for sequence lesson_progress_id_seq" on the first write.
GRANT USAGE ON SCHEMA public TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;--> statement-breakpoint
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;--> statement-breakpoint

-- Its only key was quality_tier, a per-device rendering setting that had no
-- business being an account-shared row. It lives in localStorage now.
DROP TABLE IF EXISTS "settings";
