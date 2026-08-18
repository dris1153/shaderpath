import { getLocale, getTranslations } from "next-intl/server";
import { TRACKS } from "@/content/curriculum";
import type { Locale } from "@/content/types";
import { overallCompletion } from "@/lib/curriculum";
import { getProgressMap } from "@/lib/progress-read";
import { TrackCard } from "@/components/roadmap/track-card";

// Reads live progress from SQLite on every request
export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("roadmap");

  const progress = await getProgressMap();
  const stats = overallCompletion(progress);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">
        {t("subtitle", {
          completed: stats.coreCompleted,
          total: stats.coreTotal,
          electives: stats.electiveTotal,
        })}
      </p>
      <div className="mt-8 flex flex-col gap-6">
        {TRACKS.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            locale={locale}
            progress={progress}
          />
        ))}
      </div>
    </main>
  );
}
