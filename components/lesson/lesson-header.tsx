import { getTranslations } from "next-intl/server";
import type { LessonMeta, Locale } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function LessonHeader({
  lesson,
  locale,
}: {
  lesson: LessonMeta;
  locale: Locale;
}) {
  const t = await getTranslations("roadmap");
  const tl = await getTranslations("lesson");

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
        {lesson.title[locale]}
      </h1>
      <p className="text-muted-foreground mt-2">{lesson.summary[locale]}</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{tl("objectives")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="ml-5 list-disc space-y-1 text-sm">
            {lesson.objectives[locale].map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </header>
  );
}
