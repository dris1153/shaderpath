"use client";

import { useTranslations } from "next-intl";
import { pick, type Locale, type ModuleDef } from "@/content/types";
import {
  blockingPrerequisite,
  getLessonsOfModule,
  moduleCompletion,
  trackLessonStates,
} from "@/lib/curriculum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { LessonRow } from "./lesson-row";

// Module-first display (D9): learner sees modules with rings; lessons appear on expand.
// Every module passed in belongs to one track.
export function ModuleAccordion({
  modules,
  locale,
}: {
  modules: ModuleDef[];
  locale: Locale;
}) {
  const t = useTranslations("roadmap");
  const { data } = useProgressMap();
  const progress = data?.progress;
  const trackId = modules[0]?.trackId;
  const states = progress && trackId ? trackLessonStates(trackId, progress) : undefined;

  return (
    <Accordion>
      {modules.map((mod) => {
        // null while unknown: moduleCompletion over an empty map reports 0/N,
        // which reads as "you have done nothing" rather than "not loaded yet".
        const stats = progress ? moduleCompletion(mod.id, progress) : null;
        const lessons = getLessonsOfModule(mod.id);
        const label = stats
          ? t("coreProgress", { completed: stats.coreCompleted, total: stats.coreTotal })
          : "";
        return (
          <AccordionItem key={mod.id} value={mod.id}>
            <AccordionTrigger className="items-center">
              <div className="flex w-full items-center gap-3 pr-2">
                {stats ? (
                  <ProgressRing value={stats.percent} size={32} stroke={5} label={`${pick(mod.title, locale)}: ${label}`} />
                ) : (
                  <Skeleton className="size-8 rounded-full" />
                )}
                <span className="flex-1 font-bold">{pick(mod.title, locale)}</span>
                <span className="text-muted-foreground text-xs font-semibold tabular-nums">
                  {stats ? label : <Skeleton className="h-3 w-10" />}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-0.5">
                {lessons.map((lesson) => {
                  const state = states?.get(lesson.slug);
                  const after =
                    state === "soft_locked" && progress ? blockingPrerequisite(lesson.slug, progress) : undefined;
                  return (
                    <LessonRow
                      key={lesson.slug}
                      lesson={lesson}
                      locale={locale}
                      state={state}
                      after={after ? pick(after.title, locale) : undefined}
                    />
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
