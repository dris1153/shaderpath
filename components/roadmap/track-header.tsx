"use client";

import { useTranslations } from "next-intl";
import { IconArrowRight } from "@tabler/icons-react";
import type { TrackId } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { trackCompletion, trackLessonStates } from "@/lib/curriculum";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { buttonVariants } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { trackId: TrackId; title: string; summary: string; hours: number };

/** Track page header: what the track is, how far along, and the one button to continue. */
export function TrackHeader({ trackId, title, summary, hours }: Props) {
  const t = useTranslations("roadmap");
  const { data } = useProgressMap();
  const stats = data ? trackCompletion(trackId, data.progress) : null;
  const states = data ? trackLessonStates(trackId, data.progress) : undefined;
  const next = states ? [...states].find(([, state]) => state === "next")?.[0] : undefined;
  const started = stats ? stats.coreCompleted > 0 : false;

  return (
    <section className="edge-card bg-card mt-4 flex flex-col gap-5 rounded-xl p-6 sm:flex-row sm:items-center">
      {stats ? (
        <ProgressRing value={stats.percent} size={88} stroke={9}>
          <span className="text-lg tabular-nums">{stats.percent}%</span>
        </ProgressRing>
      ) : (
        <Skeleton className="size-[88px] shrink-0 rounded-full" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h1 className="text-4xl leading-tight">{title}</h1>
        <p className="text-muted-foreground max-w-prose">{summary}</p>
        <p className="text-muted-foreground text-sm font-semibold tabular-nums">
          {stats ? t("coreProgress", { completed: stats.coreCompleted, total: stats.coreTotal }) : "…"}
          {" · "}
          {t("mapHours", { hours })}
        </p>
      </div>
      {next ? (
        <Link href={`/lesson/${next}`} className={buttonVariants({ size: "lg" })}>
          {started ? t("continueTrack") : t("startTrack")}
          <IconArrowRight data-icon="inline-end" />
        </Link>
      ) : null}
    </section>
  );
}
