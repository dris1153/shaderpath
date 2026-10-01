import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TRACKS } from "@/content/curriculum";
import { pick, type Locale, type TrackId } from "@/content/types";
import { getModulesOfTrack, getTrack, trackHours } from "@/lib/curriculum";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModuleAccordion } from "@/components/roadmap/module-accordion";
import { TrackHeader } from "@/components/roadmap/track-header";

// One page per track per locale. The page is curriculum content; the reader's
// progress arrives afterwards through /api/progress-map, so nothing here reads
// the database at render time.
export function generateStaticParams() {
  return TRACKS.map((track) => ({ trackSlug: track.id }));
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string; trackSlug: string }>;
}) {
  const { locale: localeParam, trackSlug } = await params;
  const track = getTrack(trackSlug as TrackId);
  if (!track) notFound();

  setRequestLocale(localeParam);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("roadmap");
  const modules = getModulesOfTrack(track.id);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/roadmap">{t("title")}</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pick(track.title, locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TrackHeader
        trackId={track.id}
        title={pick(track.title, locale)}
        summary={pick(track.summary, locale)}
        hours={trackHours(track.id)}
      />
      <div className="mt-8">
        <ModuleAccordion modules={modules} locale={locale} />
      </div>
    </main>
  );
}
