import { getTranslations } from "next-intl/server";
import { pick, type LessonMeta, type Locale } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { getTrack } from "@/lib/curriculum";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/** Breadcrumb, title and one meta line; everything else waits below the chips. */
export async function LessonHeader({
  lesson,
  locale,
  exerciseCount,
}: {
  lesson: LessonMeta;
  locale: Locale;
  exerciseCount: number;
}) {
  const t = await getTranslations("roadmap");
  const tLesson = await getTranslations("lesson");
  const track = getTrack(lesson.trackId);

  return (
    <header>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/roadmap">{t("title")}</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {track ? (
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/track/${track.id}`}>{pick(track.title, locale)}</Link>} />
            </BreadcrumbItem>
          ) : null}
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbPage className="max-w-56 truncate">{pick(lesson.title, locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{pick(lesson.title, locale)}</h1>
      <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold tabular-nums">
        {lesson.kind === "checkpoint" && <Badge variant="sun">{t("checkpoint")}</Badge>}
        {lesson.tier === "elective" && <Badge variant="outline">{t("elective")}</Badge>}
        <span>{t("minutes", { minutes: lesson.estimatedMinutes })}</span>
        <span aria-hidden>·</span>
        <span>{t("difficulty", { level: lesson.difficulty })}</span>
        {exerciseCount > 0 ? (
          <>
            <span aria-hidden>·</span>
            <span>{tLesson("exerciseCount", { count: exerciseCount })}</span>
          </>
        ) : null}
      </div>
      {/* Objectives live in the mind map (its "objectives" branch). */}
      <p className="text-muted-foreground mt-3 max-w-[70ch] text-lg">{pick(lesson.summary, locale)}</p>
    </header>
  );
}
