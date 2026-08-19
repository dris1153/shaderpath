"use client";

import { IconLock } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LessonMeta, Locale } from "@/content/types";
import { isUnlocked } from "@/lib/curriculum";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { Badge } from "@/components/ui/badge";

export function LessonRow({
  lesson,
  locale,
}: {
  lesson: LessonMeta;
  locale: Locale;
}) {
  const t = useTranslations("roadmap");
  const { data } = useProgressMap();
  const progress = data?.progress;
  // Unknown must never render as locked — that tells the reader they may not go
  // somewhere, which is the worst thing this row can get wrong. Same rule the
  // lesson sidebar follows.
  const unlocked = progress ? isUnlocked(lesson.slug, progress) : true;
  const completed = progress ? progress[lesson.slug] === "completed" : false;

  return (
    <Link
      href={`/lesson/${lesson.slug}`}
      className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-md px-2 py-2 no-underline! hover:underline!"
    >
      <div className="flex min-w-0 items-center gap-2">
        {!unlocked && (
          <IconLock
            className="text-muted-foreground size-4 shrink-0"
            aria-label={t("locked")}
          />
        )}
        <span
          className={
            completed
              ? "truncate"
              : unlocked
                ? "truncate"
                : "text-muted-foreground truncate"
          }
        >
          {lesson.title[locale]}
        </span>
        {completed && <Badge>✓</Badge>}
        {lesson.kind === "checkpoint" && (
          <Badge variant="secondary">{t("checkpoint")}</Badge>
        )}
        {lesson.tier === "elective" && (
          <Badge variant="outline">{t("elective")}</Badge>
        )}
      </div>
      <div className="text-muted-foreground flex shrink-0 items-center gap-3 text-xs tabular-nums">
        <span>{t("difficulty", { level: lesson.difficulty })}</span>
        <span>{t("minutes", { minutes: lesson.estimatedMinutes })}</span>
      </div>
    </Link>
  );
}
