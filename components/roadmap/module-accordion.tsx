import { getTranslations } from "next-intl/server";
import type { Locale, ModuleDef } from "@/content/types";
import type { ProgressMap } from "@/lib/curriculum";
import { getLessonsOfModule, moduleCompletion } from "@/lib/curriculum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LessonRow } from "./lesson-row";

// Module-first display (D9): learner sees modules with rings; lessons appear on expand.
export async function ModuleAccordion({
  modules,
  locale,
  progress,
}: {
  modules: ModuleDef[];
  locale: Locale;
  progress: ProgressMap;
}) {
  const t = await getTranslations("roadmap");

  return (
    <Accordion>
      {modules.map((mod) => {
        const stats = moduleCompletion(mod.id, progress);
        const lessons = getLessonsOfModule(mod.id);
        return (
          <AccordionItem key={mod.id} value={mod.id}>
            <AccordionTrigger>
              <div className="flex w-full items-center justify-between gap-4 pr-2">
                <span className="font-medium">{mod.title[locale]}</span>
                <span className="text-muted-foreground flex items-center gap-3 text-xs tabular-nums">
                  <span>
                    {t("coreProgress", {
                      completed: stats.coreCompleted,
                      total: stats.coreTotal,
                    })}
                  </span>
                  <Progress value={stats.percent} className="w-24" />
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col">
                {lessons.map((lesson, i) => (
                  <div key={lesson.slug}>
                    {i > 0 && <Separator />}
                    <LessonRow
                      lesson={lesson}
                      locale={locale}
                      progress={progress}
                    />
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
