import { getLocale, getTranslations } from "next-intl/server";
import { IconBookmark, IconNote } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import type { LessonSlug } from "@/content/slugs";
import type { Locale } from "@/content/types";
import { getLesson } from "@/lib/curriculum";
import { getAllBookmarks, getAllNotes } from "@/lib/notes-read";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookmarkItem, NoteItem } from "@/components/notes/note-item";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("notes");

  const notes = getAllNotes();
  const bookmarks = getAllBookmarks();

  // Group by lesson, keep curriculum order irrelevant — recency dominates
  const slugs = [...new Set([
    ...notes.map((n) => n.lessonSlug),
    ...bookmarks.map((b) => b.lessonSlug),
  ])] as LessonSlug[];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">
        {t("subtitle", { notes: notes.length, bookmarks: bookmarks.length })}
      </p>

      {slugs.length === 0 && (
        <p className="text-muted-foreground mt-10">{t("empty")}</p>
      )}

      <div className="mt-8 space-y-6">
        {slugs.map((slug) => {
          const lesson = getLesson(slug);
          if (!lesson) return null;
          const lessonNotes = notes.filter((n) => n.lessonSlug === slug);
          const lessonBookmarks = bookmarks.filter(
            (b) => b.lessonSlug === slug,
          );
          return (
            <Card key={slug}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/lesson/${slug}`} className="hover:underline">
                    {lesson.title[locale]}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lessonBookmarks.length > 0 && (
                  <div className="mb-3">
                    <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium uppercase">
                      <IconBookmark className="size-3.5" /> {t("bookmarks")}
                    </p>
                    {lessonBookmarks.map((b) => (
                      <BookmarkItem
                        key={b.id}
                        id={b.id}
                        label={b.label ?? lesson.title[locale]}
                        href={`/${locale}/lesson/${slug}${b.anchorId ? `#${b.anchorId}` : ""}`}
                      />
                    ))}
                  </div>
                )}
                {lessonNotes.length > 0 && (
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium uppercase">
                      <IconNote className="size-3.5" /> {t("notesHeading")}
                    </p>
                    {lessonNotes.map((n, i) => (
                      <div key={n.id}>
                        {i > 0 && <Separator />}
                        <div className="group">
                          {n.anchorId ? (
                            <a
                              href={`/${locale}/lesson/${slug}#${n.anchorId}`}
                              className="text-muted-foreground text-xs hover:underline"
                            >
                              #{n.anchorId}
                            </a>
                          ) : null}
                          <NoteItem
                            id={n.id}
                            body={n.body}
                            selectedText={n.selectedText}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
