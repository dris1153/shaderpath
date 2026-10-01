"use client";

import { useTranslations } from "next-intl";
import { IconStar } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { pick, type LessonMeta, type Locale, type TrackId } from "@/content/types";
import {
  getLessonsOfModule,
  getModulesOfTrack,
  getTrack,
  trackLessonStates,
  type LessonRowState,
} from "@/lib/curriculum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StateMark } from "@/components/roadmap/lesson-row";
import { useLessonState } from "@/lib/hooks/use-lesson-state";
import { cn } from "@/lib/utils";

function LessonLink({
  lesson,
  locale,
  active,
  state,
}: {
  lesson: LessonMeta;
  locale: Locale;
  active: boolean;
  /** undefined until the read resolves — never treat that as "not done". */
  state: LessonRowState | undefined;
}) {
  return (
    <Link
      href={`/lesson/${lesson.slug}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "hover:bg-secondary flex min-h-9 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm no-underline!",
        active ? "bg-secondary text-link ring-primary/30 font-bold ring-2 ring-inset" : "text-foreground",
      )}
    >
      <StateMark state={state} size="sm" />
      <span className={cn("truncate", state === "done" && !active && "text-muted-foreground")}>
        {pick(lesson.title, locale)}
      </span>
      {lesson.tier === "elective" && <IconStar className="size-3 shrink-0 opacity-50" aria-hidden />}
    </Link>
  );
}

export function LessonSidebar({
  trackId,
  currentSlug,
  currentModuleId,
  locale,
}: {
  trackId: TrackId;
  currentSlug: string;
  currentModuleId: string;
  locale: Locale;
}) {
  const t = useTranslations("lesson");
  // Structure comes from content and renders immediately; only the status
  // decorations wait, and every icon slot is size-4 so nothing shifts.
  const { data } = useLessonState(currentSlug);
  const track = getTrack(trackId);
  if (!track) return null;
  const modules = getModulesOfTrack(trackId);
  const states = data ? trackLessonStates(trackId, data.progress) : undefined;

  return (
    <nav aria-label={t("openNav")}>
      <ScrollArea className="h-[calc(100vh-7rem)]">
        <div className="pr-3 pb-8">
          <Link
            href={`/track/${track.id}`}
            className="text-muted-foreground hover:text-foreground chunky-label text-xs"
          >
            {t("backToTrack")} · {pick(track.title, locale)}
          </Link>
          <Accordion defaultValue={[currentModuleId]} className="mt-2">
            {modules.map((mod) => (
              <AccordionItem key={mod.id} value={mod.id}>
                <AccordionTrigger className="text-sm">
                  {pick(mod.title, locale)}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5">
                    {getLessonsOfModule(mod.id).map((lesson) => (
                      <LessonLink
                        key={lesson.slug}
                        lesson={lesson}
                        locale={locale}
                        active={lesson.slug === currentSlug}
                        state={states?.get(lesson.slug)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </nav>
  );
}
