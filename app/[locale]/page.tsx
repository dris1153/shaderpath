import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LESSONS } from "@/content/curriculum";
import type { Locale } from "@/content/types";
import { getLesson, isUnlocked, overallCompletion } from "@/lib/curriculum";
import { getProgressMap, getTotalTimeSeconds } from "@/lib/progress-read";
import { getDueReviews } from "@/lib/review-read";
import { DueToday } from "@/components/dashboard/due-today";
import type { LessonSlug } from "@/content/slugs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Reads live progress from SQLite on every request
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tApp = await getTranslations("app");
  const locale = (await getLocale()) as Locale;

  const progress = getProgressMap();
  const stats = overallCompletion(progress);
  const hours = Math.round(getTotalTimeSeconds() / 360) / 10;

  const due: { slug: string; title: string }[] = [];
  for (const r of getDueReviews(new Date())) {
    const lesson = getLesson(r.lessonSlug as LessonSlug);
    if (lesson) due.push({ slug: lesson.slug, title: lesson.title[locale] });
  }

  // Continue where the learner left off: first in_progress, else first unlocked core not done
  const continueLesson =
    LESSONS.find((l) => progress[l.slug] === "in_progress") ??
    LESSONS.find(
      (l) =>
        l.tier === "core" &&
        progress[l.slug] !== "completed" &&
        isUnlocked(l.slug, progress),
    );

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("welcome")}</h1>
      <p className="text-muted-foreground mt-2">{tApp("tagline")}</p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("progressTitle")}</CardTitle>
          <CardDescription>
            {stats.coreCompleted === 0 && !continueLesson
              ? t("empty")
              : t("stats", {
                  completed: stats.coreCompleted,
                  total: stats.coreTotal,
                  hours,
                })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Progress
            value={stats.percent}
            aria-label={t("progressTitle")}
            className="w-64"
          />
          {continueLesson && (
            <Button
              nativeButton={false}
              render={<Link href={`/lesson/${continueLesson.slug}`} />}
            >
              {t("continue")}: {continueLesson.title[locale]}
            </Button>
          )}
        </CardContent>
      </Card>

      <DueToday due={due} />
    </main>
  );
}
