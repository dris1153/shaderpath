"use client";

import { useTranslations } from "next-intl";
import type { Locale, ModuleDef } from "@/content/types";
import { getLessonsOfModule, moduleCompletion } from "@/lib/curriculum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { Separator } from "@/components/ui/separator";
import { LessonRow } from "./lesson-row";

// Module-first display (D9): learner sees modules with rings; lessons appear on expand.
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

  return (
    <Accordion>
      {modules.map((mod) => {
        // null while unknown: moduleCompletion over an empty map reports 0/N,
        // which reads as "you have done nothing" rather than "not loaded yet".
        const stats = progress ? moduleCompletion(mod.id, progress) : null;
        const lessons = getLessonsOfModule(mod.id);
        return (
          <AccordionItem key={mod.id} value={mod.id}>
            <AccordionTrigger>
              <div className="flex w-full items-center justify-between gap-4 pr-2">
                <span className="font-medium">{mod.title[locale]}</span>
                <span className="text-muted-foreground flex items-center gap-3 text-xs tabular-nums">
                  {stats ? (
                    <>
                      <span>
                        {t("coreProgress", {
                          completed: stats.coreCompleted,
                          total: stats.coreTotal,
                        })}
                      </span>
                      <Progress
                        value={stats.percent}
                        aria-label={`${mod.title[locale]}: ${t("coreProgress", {
                          completed: stats.coreCompleted,
                          total: stats.coreTotal,
                        })}`}
                        className="w-24"
                      />
                    </>
                  ) : (
                    <>
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-2 w-24" />
                    </>
                  )}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col">
                {lessons.map((lesson, i) => (
                  <div key={lesson.slug}>
                    {i > 0 && <Separator />}
                    <LessonRow lesson={lesson} locale={locale} />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
