"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useInvalidateLessonState,
  useLessonState,
} from "@/lib/hooks/use-lesson-state";
import { toggleBookmark } from "@/lib/notes";

/** Lesson-level bookmark toggle (anchorId = null), optimistic. */
export function BookmarkToggle({ slug }: { slug: string }) {
  const t = useTranslations("notes");
  const { data } = useLessonState(slug);
  const invalidate = useInvalidateLessonState(slug);
  // Stays null until the reader toggles; before that the server's answer wins.
  const [override, setOverride] = useState<boolean | null>(null);

  const known = override !== null || data !== undefined;
  const on = override ?? data?.bookmarked ?? false;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("bookmarkLesson")}
      // Omitted rather than false while unknown: aria-pressed="false" would
      // assert this lesson is not bookmarked, which nobody has established yet.
      aria-pressed={known ? on : undefined}
      aria-busy={!known}
      disabled={!known}
      className={known ? undefined : "opacity-40"}
      onClick={() => {
        const next = !on;
        setOverride(next);
        toggleBookmark({ lessonSlug: slug })
          .then((saved) => {
            setOverride(saved);
            void invalidate();
          })
          .catch(() => {
            setOverride(on);
            toast.error(t("saveError"));
          });
      }}
    >
      {on ? <IconBookmarkFilled /> : <IconBookmark />}
    </Button>
  );
}
