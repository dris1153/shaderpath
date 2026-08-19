"use client";

import { useLocale, useTranslations } from "next-intl";
import { IconBookmark, IconNote } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import type { LessonSlug } from "@/content/slugs";
import type { Locale } from "@/content/types";
import { getLesson } from "@/lib/curriculum";
import { useNotes } from "@/lib/hooks/use-notes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkItem, NoteItem } from "./note-item";

/**
 * Everything on the notes page below the heading, because everything below the
 * heading depends on the database — including the subtitle's two counts and the
 * "nothing here yet" line, which are why this waits rather than rendering zero.
 */
export function NotesList() {
  const locale = useLocale() as Locale;
  const t = useTranslations("notes");
  const tError = useTranslations("errors");
  const { data, isError } = useNotes();

  if (isError) {
    return <p className="text-muted-foreground mt-10">{tError("description")}</p>;
  }

  if (!data) {
    return (
      <>
        <Skeleton className="mt-2 h-5 w-64 max-w-full" />
        <div className="mt-8 space-y-6">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  const { notes, bookmarks } = data;

  // Group by lesson, keep curriculum order irrelevant — recency dominates
  const slugs = [...new Set([
    ...notes.map((n) => n.lessonSlug),
    ...bookmarks.map((b) => b.lessonSlug),
  ])] as LessonSlug[];

  return (
    <>
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
    </>
  );
}
