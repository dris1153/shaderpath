import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { IconList, IconMenu2 } from "@tabler/icons-react";
import {
  LESSON_REGISTRY,
  REFERENCES_REGISTRY,
  TOC_REGISTRY,
} from "@/content/lesson-registry.generated";
import type { LessonSlug } from "@/content/slugs";
import type { Locale } from "@/content/types";
import { getLesson } from "@/lib/curriculum";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExerciseSection } from "@/components/exercise/exercise-section";
import { BookmarkToggle } from "@/components/notes/bookmark-toggle";
import { LessonNotesLayer } from "@/components/notes/lesson-notes-layer";
import { LessonDemoHost } from "@/components/lesson/lesson-demo-host";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LearnAnywayNotice } from "@/components/lesson/learn-anyway-notice";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { LessonToc } from "@/components/lesson/lesson-toc";
import { LessonFooterNav } from "@/components/lesson/lesson-footer-nav";
import { MarkComplete } from "@/components/lesson/mark-complete";
import { ProgressTracker } from "@/components/lesson/progress-tracker";
import { References } from "@/components/lesson/references";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const lesson = getLesson(lessonSlug as LessonSlug);
  if (!lesson) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("lesson");

  const entry = LESSON_REGISTRY[lesson.slug];
  const availableLocales = entry
    ? (Object.keys(entry) as Locale[])
    : ([] as Locale[]);
  const usedLocale = entry?.[locale] ? locale : availableLocales[0];
  const theoryLoader = usedLocale ? entry?.[usedLocale] : undefined;
  const Theory = theoryLoader ? (await theoryLoader()).default : null;
  const toc = usedLocale ? (TOC_REGISTRY[lesson.slug]?.[usedLocale] ?? []) : [];

  const referencesLoader = REFERENCES_REGISTRY[lesson.slug];
  const references = referencesLoader
    ? (await referencesLoader()).references
    : [];

  const sidebar = (
    <LessonSidebar
      trackId={lesson.trackId}
      currentSlug={lesson.slug}
      currentModuleId={lesson.moduleId}
      locale={locale}
    />
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto grid w-full container flex-1 gap-8 px-4 py-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_220px]"
    >
      <aside aria-label={t("openNav")} className="hidden lg:block">
        <div className="sticky top-20">{sidebar}</div>
      </aside>

      <article className="min-w-0">
        {/* Mobile toolbar: sidebar + TOC in Sheets (spec §7 responsive) */}
        <div className="mb-4 flex items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="sm">
                  <IconMenu2 /> {t("openNav")}
                </Button>
              }
            />
            <SheetContent side="left" className="p-4">
              <SheetTitle className="sr-only">{t("openNav")}</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
          {toc.length > 0 && (
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="xl:hidden">
                    <IconList /> {t("openToc")}
                  </Button>
                }
              />
              <SheetContent side="right" className="p-4">
                <SheetTitle className="sr-only">{t("openToc")}</SheetTitle>
                <LessonToc toc={toc} />
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="relative">
          <div className="absolute top-0 right-0">
            <BookmarkToggle slug={lesson.slug} />
          </div>
          <LessonHeader lesson={lesson} locale={locale} />
        </div>

        <LearnAnywayNotice slug={lesson.slug} />

        {usedLocale && usedLocale !== locale && (
          <Alert className="mt-6">
            <AlertDescription>{t("translationFallback")}</AlertDescription>
          </Alert>
        )}

        {Theory ? (
          <LessonNotesLayer slug={lesson.slug}>
            <div className="mt-2">
              <Theory />
            </div>
          </LessonNotesLayer>
        ) : (
          <Alert className="mt-8">
            <AlertTitle>{t("contentComingSoonTitle")}</AlertTitle>
            <AlertDescription>{t("contentComingSoon")}</AlertDescription>
          </Alert>
        )}

        {lesson.hasDemo && <LessonDemoHost slug={lesson.slug} />}

        <ExerciseSection slug={lesson.slug} locale={locale} />

        <References references={references} locale={locale} />

        <MarkComplete slug={lesson.slug} />

        <LessonFooterNav slug={lesson.slug} locale={locale} />
      </article>

      <aside aria-label={t("onThisPage")} className="hidden xl:block">
        <div className="sticky top-20">
          <LessonToc toc={toc} />
        </div>
      </aside>

      <ProgressTracker slug={lesson.slug} />
    </main>
  );
}
