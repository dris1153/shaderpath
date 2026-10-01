"use client";

import { useLocale, useTranslations } from "next-intl";
import { IconFlame, IconLock, IconRoute } from "@tabler/icons-react";
import { TRACKS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { currentTrackId, overallCompletion } from "@/lib/curriculum";
import { useGamification } from "@/lib/hooks/use-gamification";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { Skeleton } from "@/components/ui/skeleton";

const CHIP = "edge-card bg-card flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold";

/** The one row on the roadmap that needs progress; the rest is content. */
export function RoadmapSummary() {
  const t = useTranslations("roadmap");
  const locale = useLocale() as Locale;
  const { data } = useProgressMap();
  const { data: xp } = useGamification();

  // A skeleton rather than "0 of 162": overallCompletion is pure over the map,
  // so an unread map reports zero as confidently as a real one would.
  if (!data) return <Skeleton className="mt-3 h-9 w-80 max-w-full" />;

  // Signed out is a third state: the numbers would be honest but the sentence
  // would not — "0 of 162 done" implies an account that has done nothing.
  if (!data.authenticated) {
    return (
      <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-2 text-sm">
        <IconLock className="size-4" aria-hidden />
        {t("signedOut")}
        <Link href="/login" className="text-link font-bold underline-offset-4 hover:underline">
          {t("signedOutCta")}
        </Link>
      </p>
    );
  }

  const stats = overallCompletion(data.progress);
  const current = TRACKS.find((tr) => tr.id === currentTrackId(data.progress));
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <p className={CHIP}>
        {t("subtitle", { completed: stats.coreCompleted, total: stats.coreTotal, electives: stats.electiveTotal })}
      </p>
      {current ? (
        <Link href={`#${current.id}`} className={`${CHIP} text-link`}>
          <IconRoute className="size-4" aria-hidden />
          {t("currentTrack", { title: pick(current.title, locale) })}
        </Link>
      ) : null}
      {xp ? (
        <p className={CHIP}>
          <IconFlame className="text-coral size-4" aria-hidden />
          {t("streakDays", { days: xp.streak.current })}
        </p>
      ) : null}
    </div>
  );
}
