import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale, TrackDef } from "@/content/types";
import type { ProgressMap } from "@/lib/curriculum";
import { getModulesOfTrack, trackCompletion } from "@/lib/curriculum";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ModuleAccordion } from "./module-accordion";

export async function TrackCard({
  track,
  locale,
  progress,
}: {
  track: TrackDef;
  locale: Locale;
  progress: ProgressMap;
}) {
  const t = await getTranslations("roadmap");
  const stats = trackCompletion(track.id, progress);
  const modules = getModulesOfTrack(track.id);

  return (
    <Card id={track.id}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="tabular-nums">
              {String(track.order).padStart(2, "0")}
            </Badge>
            <Link href={`/track/${track.id}`} className="hover:underline">
              {track.title[locale]}
            </Link>
          </CardTitle>
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {t("coreProgress", {
              completed: stats.coreCompleted,
              total: stats.coreTotal,
            })}
          </span>
        </div>
        <CardDescription>{track.summary[locale]}</CardDescription>
        <Progress value={stats.percent} />
      </CardHeader>
      <CardContent>
        <ModuleAccordion modules={modules} locale={locale} progress={progress} />
      </CardContent>
    </Card>
  );
}
