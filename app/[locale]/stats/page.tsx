import { getLocale, getTranslations } from "next-intl/server";
import { TRACKS } from "@/content/curriculum";
import type { Locale } from "@/content/types";
import { getStats } from "@/lib/stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heatmap } from "@/components/stats/heatmap";
import { TrackDistribution } from "@/components/stats/track-distribution";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("stats");
  const now = new Date();
  const stats = getStats(now);

  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;

  const distribution = TRACKS.map((track) => ({
    track: track.title[locale],
    minutes: Math.round(stats.minutesByTrack[track.id] ?? 0),
  })).filter((d) => d.minutes > 0);

  const cards = [
    { label: t("currentStreak"), value: t("days", { n: stats.streaks.current }) },
    { label: t("longestStreak"), value: t("days", { n: stats.streaks.longest }) },
    { label: t("totalTime"), value: `${hours}h ${minutes}m` },
    { label: t("lessonsCompleted"), value: String(stats.lessonsCompleted) },
    { label: t("exercisesCompleted"), value: String(stats.exercisesCompleted) },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-1">
              <CardDescription>{c.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{c.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("heatmapTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap minutesByDay={stats.minutesByDay} now={now} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("distributionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {distribution.length > 0 ? (
            <TrackDistribution data={distribution} />
          ) : (
            <p className="text-muted-foreground text-sm">{t("noData")}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
