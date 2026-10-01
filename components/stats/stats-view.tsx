"use client";

import { useLocale, useTranslations } from "next-intl";
import { TRACKS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { useAuth } from "@/lib/hooks/use-auth";
import { useStats } from "@/lib/hooks/use-stats";
import { useGamification } from "@/lib/hooks/use-gamification";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Inko } from "@/components/mascot/inko";
import { ErrorState } from "@/components/states/error-state";
import { SignedOutState } from "@/components/states/signed-out-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heatmap } from "./heatmap";
import { TrackDistribution } from "./track-distribution";

/**
 * Every figure on the stats page. The card labels are content and render at
 * once; only the values wait, because "0h 0m" and "no data yet" are answers
 * this page has no right to give until it has read something.
 */
export function StatsView() {
  const locale = useLocale() as Locale;
  const t = useTranslations("stats");
  const tError = useTranslations("errors");
  const { data: auth, isPending: authPending } = useAuth();
  const user = auth?.user;
  const { data, isError, refetch } = useStats(Boolean(user));
  const { data: xp } = useGamification();

  const labels = [
    t("currentStreak"),
    t("longestStreak"),
    t("totalTime"),
    t("lessonsCompleted"),
    t("exercisesCompleted"),
    t("xpLevel"),
  ];

  const stats = data?.stats;
  const values = stats
    ? [
        t("days", { n: stats.streaks.current }),
        t("days", { n: stats.streaks.longest }),
        `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`,
        String(stats.lessonsCompleted),
        String(stats.exercisesCompleted),
        xp ? t("xpValue", { xp: xp.xp, level: xp.level }) : "…",
      ]
    : null;
  // A new account has nothing to chart yet; say how day 1 starts instead.
  const fresh = stats ? stats.totalMinutes === 0 && stats.lessonsCompleted === 0 : false;

  const distribution = stats
    ? TRACKS.map((track) => ({
        track: pick(track.title, locale),
        minutes: Math.round(stats.minutesByTrack[track.id] ?? 0),
      })).filter((d) => d.minutes > 0)
    : [];

  const tiles = (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {labels.map((label, i) => (
        <Card key={label}>
          <CardHeader className="pb-1">
            <CardDescription>{label}</CardDescription>
            {values ? (
              <CardTitle className="text-2xl tabular-nums">
                {values[i]}
              </CardTitle>
            ) : (
              <Skeleton className="h-8 w-20" />
            )}
            {i === 0 ? <p className="text-muted-foreground text-xs">{t("graceNote")}</p> : null}
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  // Guests never request /api/stats: the page explains instead of failing.
  if (!authPending && !user) {
    return (
      <SignedOutState
        title={t("signedOutTitle")}
        description={t("signedOutBody")}
        preview={tiles}
      />
    );
  }

  if (isError && !data) {
    return <ErrorState message={tError("description")} onRetry={() => void refetch()} />;
  }

  return (
    <>
      {fresh ? (
        <section className="edge-card bg-card mt-8 flex flex-wrap items-center gap-4 rounded-xl p-5">
          <Inko pose="wave" size={96} />
          <div className="flex min-w-48 flex-1 flex-col gap-1">
            <p className="font-heading text-2xl font-extrabold">{t("freshTitle")}</p>
            <p className="text-muted-foreground">{t("freshBody")}</p>
          </div>
          <Link href="/roadmap" className={buttonVariants()}>
            {t("freshCta")}
          </Link>
        </section>
      ) : null}
      {tiles}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("heatmapTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-muted-foreground text-sm">
              {tError("description")}
            </p>
          ) : data ? (
            <Heatmap
              minutesByDay={data.stats.minutesByDay}
              now={new Date(data.now)}
            />
          ) : (
            <Skeleton className="h-[102px] w-full" />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("distributionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-muted-foreground text-sm">
              {tError("description")}
            </p>
          ) : !data ? (
            <Skeleton className="h-40 w-full" />
          ) : distribution.length > 0 ? (
            <TrackDistribution data={distribution} />
          ) : (
            <p className="text-muted-foreground text-sm">{t("noData")}</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
