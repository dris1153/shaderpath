import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TRACKS } from "@/content/curriculum";
import type { Locale, TrackId } from "@/content/types";
import type { ProgressMap } from "@/lib/curriculum";
import { getModulesOfTrack, getTrack, trackCompletion } from "@/lib/curriculum";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { ModuleAccordion } from "@/components/roadmap/module-accordion";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ trackSlug: t.id }));
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ trackSlug: string }>;
}) {
  const { trackSlug } = await params;
  const track = getTrack(trackSlug as TrackId);
  if (!track) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("roadmap");
  const progress: ProgressMap = {};
  const stats = trackCompletion(track.id, progress);
  const modules = getModulesOfTrack(track.id);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/roadmap">{t("title")}</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{track.title[locale]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {track.title[locale]}
      </h1>
      <p className="text-muted-foreground mt-2">{track.summary[locale]}</p>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={stats.percent} className="w-48" />
        <span className="text-muted-foreground text-xs tabular-nums">
          {t("coreProgress", {
            completed: stats.coreCompleted,
            total: stats.coreTotal,
          })}
        </span>
      </div>
      <div className="mt-8">
        <ModuleAccordion modules={modules} locale={locale} progress={progress} />
      </div>
    </main>
  );
}
