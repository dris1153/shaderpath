import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { TRACKS } from "@/content/curriculum";
import { trackHours } from "@/lib/curriculum";
import type { Locale } from "@/content/types";
import { RoadmapSummary } from "@/components/roadmap/roadmap-summary";
import { RoadmapViewToggle } from "@/components/roadmap/roadmap-view-toggle";
import { TrackCard } from "@/components/roadmap/track-card";

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("roadmap");

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <h1 className="text-4xl">{t("title")}</h1>
      <RoadmapSummary />
      <RoadmapViewToggle
        locale={locale}
        strings={{
          list: t("viewList"),
          map: t("viewMap"),
          legendCompleted: t("mapLegendCompleted"),
          legendUnlocked: t("mapLegendUnlocked"),
          legendLocked: t("mapLegendLocked"),
          regionLabel: t("mapRegion"),
        }}
        listView={
          <div className="mt-4 flex flex-col gap-6">
            {TRACKS.map((track) => (
              <TrackCard key={track.id} track={track} locale={locale} hours={trackHours(track.id)} />
            ))}
          </div>
        }
      />
    </main>
  );
}
