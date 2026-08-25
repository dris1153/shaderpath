import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { TRACKS } from "@/content/curriculum";
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
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <RoadmapSummary />
      <RoadmapViewToggle
        locale={locale}
        strings={{
          list: t("viewList"),
          map: t("viewMap"),
          legendCompleted: t("mapLegendCompleted"),
          legendUnlocked: t("mapLegendUnlocked"),
          legendLocked: t("mapLegendLocked"),
          a11y: t("mapA11y"),
          checkpoint: t("checkpoint"),
        }}
        listView={
          <div className="mt-4 flex flex-col gap-6">
            {TRACKS.map((track) => (
              <TrackCard key={track.id} track={track} locale={locale} />
            ))}
          </div>
        }
      />
    </main>
  );
}
