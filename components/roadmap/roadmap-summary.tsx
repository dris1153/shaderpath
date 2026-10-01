"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { overallCompletion } from "@/lib/curriculum";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { Skeleton } from "@/components/ui/skeleton";

/** The one line on the roadmap that needs progress; the rest is content. */
export function RoadmapSummary() {
  const t = useTranslations("roadmap");
  const { data } = useProgressMap();

  // A skeleton rather than "0 of 162": overallCompletion is pure over the map,
  // so an unread map reports zero as confidently as a real one would.
  if (!data) return <Skeleton className="mt-2 h-5 w-80 max-w-full" />;

  // Signed out is a third state: the numbers would be honest but the sentence
  // would not — "0 of 162 done" implies an account that has done nothing.
  if (!data.authenticated) {
    return (
      <p className="text-muted-foreground mt-2">
        {t("signedOut")}{" "}
        <Link href="/login" className="text-link underline underline-offset-4">
          {t("signedOutCta")}
        </Link>
      </p>
    );
  }

  const stats = overallCompletion(data.progress);
  return (
    <p className="text-muted-foreground mt-2">
      {t("subtitle", {
        completed: stats.coreCompleted,
        total: stats.coreTotal,
        electives: stats.electiveTotal,
      })}
    </p>
  );
}
