import { getTranslations } from "next-intl/server";
import {
  IconCircleCheck,
  IconHammer,
  IconLock,
  IconStar,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import type { LessonMeta, Locale, TrackId } from "@/content/types";
import type { ProgressMap } from "@/lib/curriculum";
import {
  getLessonsOfModule,
  getModulesOfTrack,
  getTrack,
  isUnlocked,
} from "@/lib/curriculum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function LessonLink({
  lesson,
  locale,
  active,
  progress,
}: {
  lesson: LessonMeta;
  locale: Locale;
  active: boolean;
  progress: ProgressMap;
}) {
  const completed = progress[lesson.slug] === "completed";
  const locked = !isUnlocked(lesson.slug, progress);

  return (
    <Link
      href={`/lesson/${lesson.slug}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        active
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground",
      )}
    >
      {completed ? (
        <IconCircleCheck className="text-primary size-4 shrink-0" />
      ) : locked ? (
        <IconLock className="size-4 shrink-0 opacity-60" />
      ) : lesson.kind === "checkpoint" ? (
        <IconHammer className="size-4 shrink-0 opacity-60" />
      ) : (
        <span className="size-4 shrink-0" />
      )}
      <span className="truncate">{lesson.title[locale]}</span>
      {lesson.tier === "elective" && (
        <IconStar className="size-3 shrink-0 opacity-50" />
      )}
    </Link>
  );
}

export async function LessonSidebar({
  trackId,
  currentSlug,
  currentModuleId,
  locale,
  progress,
}: {
  trackId: TrackId;
  currentSlug: string;
  currentModuleId: string;
  locale: Locale;
  progress: ProgressMap;
}) {
  const t = await getTranslations("lesson");
  const track = getTrack(trackId);
  if (!track) return null;
  const modules = getModulesOfTrack(trackId);

  return (
    <nav aria-label={t("openNav")}>
      <ScrollArea className="h-[calc(100vh-7rem)]">
        <div className="pr-3 pb-8">
          <Link
            href={`/track/${track.id}`}
            className="text-muted-foreground hover:text-foreground text-xs font-medium tracking-wide uppercase"
          >
            {t("backToTrack")} · {track.title[locale]}
          </Link>
          <Accordion defaultValue={[currentModuleId]} className="mt-2">
            {modules.map((mod) => (
              <AccordionItem key={mod.id} value={mod.id}>
                <AccordionTrigger className="text-sm">
                  {mod.title[locale]}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5">
                    {getLessonsOfModule(mod.id).map((lesson) => (
                      <LessonLink
                        key={lesson.slug}
                        lesson={lesson}
                        locale={locale}
                        active={lesson.slug === currentSlug}
                        progress={progress}
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
