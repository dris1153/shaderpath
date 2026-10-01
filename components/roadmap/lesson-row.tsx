"use client";

import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick, type LessonMeta, type Locale } from "@/content/types";
import type { LessonRowState } from "@/lib/curriculum";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

function StateMark({ state }: { state: LessonRowState | undefined }) {
  if (state === "done") {
    return (
      <span className="bg-mint text-ink grid size-6 shrink-0 place-items-center rounded-full">
        <IconCheck className="size-4" stroke={3} aria-hidden />
      </span>
    );
  }
  if (state === "in_progress") return <ProgressRing value={50} size={24} stroke={4} />;
  return (
    <span
      aria-hidden
      className={cn(
        "size-6 shrink-0 rounded-full border-2",
        state === "next" && "border-primary motion-safe:animate-pulse-once border-[3px]",
        state === "soft_locked" && "border-muted-foreground/60 border-dashed",
        (state === "not_started" || state === undefined) && "border-border",
      )}
    />
  );
}

/**
 * One lesson on a track or roadmap card. Every row is a link, soft-locked ones
 * included: a recommendation, never a gate. `state` is undefined until progress
 * loads, which renders as a plain not-started row rather than a guess.
 */
export function LessonRow({
  lesson,
  locale,
  state,
  after,
}: {
  lesson: LessonMeta;
  locale: Locale;
  state?: LessonRowState;
  /** Title of the open prerequisite, for soft-locked rows. */
  after?: string;
}) {
  const t = useTranslations("roadmap");

  return (
    <Link
      href={`/lesson/${lesson.slug}`}
      className={cn(
        "hover:bg-secondary flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-2 no-underline!",
        state === "next" && "bg-secondary ring-primary/30 ring-2 ring-inset",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <StateMark state={state} />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("truncate font-semibold", state === "done" && "text-muted-foreground")}>
              {pick(lesson.title, locale)}
            </span>
            {state === "done" && <span className="sr-only">{t("stateDone")}</span>}
            {state === "in_progress" && <span className="sr-only">{t("stateInProgress")}</span>}
            {state === "next" && <Badge>{t("stateNext")}</Badge>}
            {lesson.kind === "checkpoint" && <Badge variant="sun">{t("checkpoint")}</Badge>}
            {lesson.tier === "elective" && <Badge variant="outline">{t("elective")}</Badge>}
          </div>
          {state === "soft_locked" && after ? (
            <p className="text-muted-foreground text-xs">{t("recommendedAfter", { title: after })}</p>
          ) : null}
        </div>
      </div>
      <div className="text-muted-foreground hidden shrink-0 items-center gap-3 text-xs tabular-nums sm:flex">
        <span>{t("difficulty", { level: lesson.difficulty })}</span>
        <span>{t("minutes", { minutes: lesson.estimatedMinutes })}</span>
      </div>
    </Link>
  );
}
