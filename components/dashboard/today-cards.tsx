"use client";

import { useTranslations } from "next-intl";
import { IconCards, IconFlame } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EYEBROW = "chunky-label text-xs tracking-[0.08em]";
// ponytail: a flat 2 min per card; measure review time if this needs to be exact.
const MINUTES_PER_REVIEW = 2;

type ContinueProps = {
  lesson?: { slug: string; title: string; track: string; n: number; m: number };
  /** Read position 0–1 of an in-progress lesson. */
  scrollPercent?: number;
};

/** The one thing to do next: purple, first, and the biggest button on the page. */
export function ContinueCard({ lesson, scrollPercent }: ContinueProps) {
  const t = useTranslations("dashboard");
  const started = scrollPercent !== undefined;

  return (
    <section className="bg-primary text-primary-foreground border-primary-edge flex flex-col sm:col-span-2 md:col-span-1 gap-3 rounded-xl border-2 p-5 shadow-[0_5px_0_var(--primary-edge)] md:col-span-1">
      {lesson ? (
        <>
          <p className={EYEBROW}>{started ? t("continueEyebrow") : t("startEyebrow")}</p>
          <h2 className="text-2xl leading-tight">{lesson.title}</h2>
          <p className="text-sm font-semibold">
            {lesson.track} · {t("lessonOf", { n: lesson.n, m: lesson.m })}
          </p>
          <div className="h-3 overflow-hidden rounded-full bg-white/25" aria-hidden>
            <div className="bg-sun h-full rounded-full" style={{ width: `${Math.round((scrollPercent ?? 0) * 100)}%` }} />
          </div>
          <Link href={`/lesson/${lesson.slug}`} className={cn(buttonVariants({ variant: "sun" }), "mt-auto w-fit")}>
            {started ? t("continueCta") : t("startCta")}
          </Link>
        </>
      ) : (
        <>
          <h2 className="text-2xl leading-tight">{t("allDoneTitle")}</h2>
          <Link href="/roadmap" className={cn(buttonVariants({ variant: "sun" }), "mt-auto w-fit")}>
            {t("openRoadmap")}
          </Link>
        </>
      )}
    </section>
  );
}

/** Reviews due now, or when the next one comes round. */
export function ReviewTodayCard({ due, nextDays }: { due: number; nextDays?: number }) {
  const t = useTranslations("dashboard");

  return (
    <section className="edge-card bg-card flex flex-col gap-2 rounded-xl p-5">
      <p className={cn(EYEBROW, "text-muted-foreground flex items-center gap-1.5")}>
        <IconCards className="size-4" aria-hidden />
        {t("reviewEyebrow")}
      </p>
      {due > 0 ? (
        <>
          <p className="font-heading text-3xl leading-none font-extrabold">{t("reviewDue", { count: due })}</p>
          <p className="text-muted-foreground text-sm">{t("reviewMinutes", { minutes: due * MINUTES_PER_REVIEW })}</p>
          <Link href="/review" className={cn(buttonVariants({ variant: "coral" }), "mt-auto w-fit")}>
            {t("reviewStart")}
          </Link>
        </>
      ) : (
        <>
          <p className="font-heading text-3xl leading-none font-extrabold">{t("reviewNone")}</p>
          <p className="text-muted-foreground text-sm">
            {nextDays ? t("reviewNext", { days: nextDays }) : t("reviewEmpty")}
          </p>
        </>
      )}
    </section>
  );
}

/** Streak and this week's study days, Monday first. */
export function WeekCard({ streak, week }: { streak?: number; week?: boolean[] }) {
  const t = useTranslations("dashboard");
  const days = t("weekDays").split(",");

  return (
    <section className="edge-card bg-card flex flex-col gap-2 rounded-xl p-5">
      <p className={cn(EYEBROW, "text-muted-foreground flex items-center gap-1.5")}>
        <IconFlame className="text-coral size-4" aria-hidden />
        {t("weekEyebrow")}
      </p>
      {streak === undefined || !week ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <>
          <p className="font-heading text-3xl leading-none font-extrabold">{t("weekStreak", { days: streak })}</p>
          <ol className="flex gap-1.5" aria-label={t("weekEyebrow")}>
            {week.map((active, i) => (
              <li
                key={i}
                aria-label={t(active ? "weekDayStudied" : "weekDayOpen", { day: days[i] ?? "" })}
                className={cn(
                  "grid size-8 place-items-center rounded-full text-[11px] font-extrabold",
                  active ? "bg-coral text-ink shadow-[0_3px_0_var(--coral-edge)]" : "bg-secondary text-muted-foreground",
                )}
              >
                <span aria-hidden>{days[i]}</span>
              </li>
            ))}
          </ol>
          <p className="text-muted-foreground text-sm">{t("weekHint")}</p>
        </>
      )}
    </section>
  );
}
