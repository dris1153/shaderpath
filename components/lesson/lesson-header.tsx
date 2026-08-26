import { getTranslations } from "next-intl/server";
import { pick, type LessonMeta, type Locale } from "@/content/types";
import { Badge } from "@/components/ui/badge";

export async function LessonHeader({
  lesson,
  locale,
}: {
  lesson: LessonMeta;
  locale: Locale;
}) {
  const t = await getTranslations("roadmap");

  return (
    <header>
      <div className="flex flex-wrap items-center gap-2">
        {lesson.kind === "checkpoint" && (
          <Badge variant="secondary">{t("checkpoint")}</Badge>
        )}
        {lesson.tier === "elective" && (
          <Badge variant="outline">{t("elective")}</Badge>
        )}
        <span className="text-muted-foreground text-xs tabular-nums">
          {t("difficulty", { level: lesson.difficulty })} ·{" "}
          {t("minutes", { minutes: lesson.estimatedMinutes })}
        </span>
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {pick(lesson.title, locale)}
      </h1>
      {/* Objectives moved into the mind map (its "objectives" branch). */}
      <p className="text-muted-foreground mt-2">{pick(lesson.summary, locale)}</p>
    </header>
  );
}
