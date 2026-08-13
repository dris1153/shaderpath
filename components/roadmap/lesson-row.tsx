import { IconLock } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import type { LessonMeta, Locale } from "@/content/types";
import type { ProgressMap } from "@/lib/curriculum";
import { isUnlocked } from "@/lib/curriculum";
import { Badge } from "@/components/ui/badge";

export async function LessonRow({
  lesson,
  locale,
  progress,
}: {
  lesson: LessonMeta;
  locale: Locale;
  progress: ProgressMap;
}) {
  const t = await getTranslations("roadmap");
  const unlocked = isUnlocked(lesson.slug, progress);

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {!unlocked && (
          <IconLock
            className="text-muted-foreground size-4 shrink-0"
            aria-label={t("locked")}
          />
        )}
        <span className={unlocked ? "truncate" : "text-muted-foreground truncate"}>
          {lesson.title[locale]}
        </span>
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
    </div>
  );
}
