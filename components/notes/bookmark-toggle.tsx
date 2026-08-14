"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/lib/notes";

/** Lesson-level bookmark toggle (anchorId = null), optimistic. */
export function BookmarkToggle({
  slug,
  initialBookmarked,
}: {
  slug: string;
  initialBookmarked: boolean;
}) {
  const t = useTranslations("notes");
  const [on, setOn] = useState(initialBookmarked);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("bookmarkLesson")}
      aria-pressed={on}
      onClick={() => {
        setOn(!on);
        toggleBookmark({ lessonSlug: slug })
          .then(setOn)
          .catch(() => {
            setOn(on);
            toast.error(t("saveError"));
          });
      }}
    >
      {on ? <IconBookmarkFilled /> : <IconBookmark />}
    </Button>
  );
}
