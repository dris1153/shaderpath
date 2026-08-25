import { beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { adminDb, db, withUser } from "@/db/client";
import {
  bookmarks,
  lessonProgress,
  notes,
  playgroundSnippets,
} from "@/db/schema";
import { truncateAll } from "../setup/reset-tables";
import { createTestUser } from "../setup/test-users";

// The only mechanical proof that ownership is enforced. Everything else in this
// change — the policies, FORCE, withUser, the column defaults — is unverifiable
// by reading it: a misconfigured RLS setup raises no error and returns no
// warning, it just quietly shows everyone everyone else's rows.
//
// Runs against the Docker database, whose auth shim (scripts/test-db.ts)
// reproduces Supabase's auth.uid() and a non-superuser `authenticated` role.
// Without that shim the suite would connect as a superuser, bypass RLS, and
// pass while production leaked.

const PROTECTED_TABLES = [
  "lesson_progress",
  "exercise_attempts",
  "notes",
  "bookmarks",
  "study_sessions",
  "review_queue",
  "playground_snippets",
];

// Inlined rather than bound: drizzle expands an array parameter into a tuple,
// which ANY() rejects. These are compile-time constants, not input.
const TABLE_LIST = sql.raw(PROTECTED_TABLES.map((t) => `'${t}'`).join(", "));

let alice: string;
let bob: string;

beforeAll(async () => {
  await truncateAll();
  alice = await createTestUser("alice@test.local");
  bob = await createTestUser("bob@test.local");
});

describe("RLS configuration", () => {
  it("enables AND forces row level security on every owned table", async () => {
    const rows = (await adminDb().execute(
      sql`SELECT relname, relrowsecurity, relforcerowsecurity
          FROM pg_class
          WHERE relname IN (${TABLE_LIST}) AND relkind = 'r'`,
    )) as unknown as {
      relname: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }[];

    expect(rows.map((r) => r.relname).sort()).toEqual([...PROTECTED_TABLES].sort());
    for (const r of rows) {
      expect(r.relrowsecurity, `${r.relname}: RLS not enabled`).toBe(true);
      // FORCE is the load-bearing half: the app connects as the table owner,
      // and owners bypass policies without it.
      expect(r.relforcerowsecurity, `${r.relname}: RLS not FORCED`).toBe(true);
    }
  });

  it("gives every owned table exactly one owner policy", async () => {
    const rows = (await adminDb().execute(
      sql`SELECT tablename FROM pg_policies WHERE tablename IN (${TABLE_LIST})`,
    )) as unknown as { tablename: string }[];
    expect(rows.map((r) => r.tablename).sort()).toEqual([...PROTECTED_TABLES].sort());
  });
});

describe("db access outside a user context", () => {
  it("throws rather than silently using the owner connection", async () => {
    // The failure mode this guards against: a handler that forgets withUser
    // would otherwise read every account's rows and look correct in a
    // one-user database.
    expect(() => db.select().from(notes)).toThrow(/outside withUser/);
  });
});

describe("RLS isolation between accounts", () => {
  it("stamps the writer as owner without the caller naming user_id", async () => {
    await withUser(alice, async () => {
      await db.insert(lessonProgress).values({
        lessonSlug: "vector-basics",
        status: "completed",
      });
    });

    // adminDb, not db: `db` now throws outside withUser. This read is checking
    // what actually landed in the column, which requires the unscoped view.
    const raw = await adminDb().select().from(lessonProgress);
    expect(raw).toHaveLength(1);
    expect(raw[0]?.userId).toBe(alice);
  });

  it("hides one account's rows from another", async () => {
    await withUser(alice, async () => {
      await db.insert(notes).values({
        lessonSlug: "vector-basics",
        body: "alice's private note",
        createdAt: new Date(),
      });
      await db.insert(bookmarks).values({
        lessonSlug: "vector-basics",
        createdAt: new Date(),
      });
      await db.insert(playgroundSnippets).values({
        title: "alice's shader",
        fragmentShader: "void main() {}",
        createdAt: new Date(),
      });
    });

    const bobSees = await withUser(bob, async () => ({
      notes: await db.select().from(notes),
      bookmarks: await db.select().from(bookmarks),
      snippets: await db.select().from(playgroundSnippets),
      progress: await db.select().from(lessonProgress),
    }));

    expect(bobSees.notes).toEqual([]);
    expect(bobSees.bookmarks).toEqual([]);
    expect(bobSees.snippets).toEqual([]);
    expect(bobSees.progress).toEqual([]);

    // Alice still sees her own.
    const aliceSees = await withUser(alice, () => db.select().from(notes));
    expect(aliceSees).toHaveLength(1);
  });

  it("blocks the IDOR paths that take a raw row id from the client", async () => {
    const aliceNoteId = await withUser(alice, async () => {
      const rows = await db.select().from(notes);
      return rows[0]!.id;
    });

    // These mirror deleteNote(id) / updateNote(id): before RLS, a guessed
    // sequential id was enough to reach another account's row.
    await withUser(bob, async () => {
      await db.update(notes).set({ body: "hijacked" }).where(sql`id = ${aliceNoteId}`);
      await db.delete(notes).where(sql`id = ${aliceNoteId}`);
    });

    const survivor = await withUser(alice, async () => {
      const rows = await db.select().from(notes);
      return rows[0];
    });
    expect(survivor?.id).toBe(aliceNoteId);
    expect(survivor?.body).toBe("alice's private note");
  });

  it("refuses to write a row owned by someone else", async () => {
    await expect(
      withUser(bob, () =>
        db.insert(notes).values({
          userId: alice,
          lessonSlug: "vector-basics",
          body: "planted",
          createdAt: new Date(),
        }),
      ),
    ).rejects.toThrow();

    const aliceNotes = await withUser(alice, () => db.select().from(notes));
    expect(aliceNotes.every((n) => n.body !== "planted")).toBe(true);
  });

  it("scopes a delete-everything sweep to the caller (the import replace path)", async () => {
    await withUser(bob, async () => {
      await db.insert(notes).values({
        lessonSlug: "vector-basics",
        body: "bob's note",
        createdAt: new Date(),
      });
    });

    // lib/export-import-apply.ts deletes every row of every table in `replace`
    // mode. Unscoped, one import would have wiped the whole install.
    await withUser(bob, () => db.delete(notes));

    const aliceNotes = await withUser(alice, () => db.select().from(notes));
    expect(aliceNotes).toHaveLength(1);
    expect(aliceNotes[0]?.body).toBe("alice's private note");
  });
});
