import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { IconList, IconMenu2 } from "@tabler/icons-react";
import {
  LESSON_REGISTRY,
  MIND_MAP_OVERRIDES,
  PITFALLS_REGISTRY,
  REFERENCES_REGISTRY,
  TOC_REGISTRY,
} from "@/content/lesson-registry.generated";
import { LESSON_SLUGS, type LessonSlug } from "@/content/slugs";
import type { LessonMeta, Locale } from "@/content/types";
import { getDependents, getLesson } from "@/lib/curriculum";
import { buildLessonMindMap } from "@/lib/mind-map";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
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
import { LessonVideo } from "@/components/lesson/lesson-video";
import { LESSON_VIDEOS } from "@/content/lesson-videos";
import { LessonMindMap } from "@/components/lesson/lesson-mind-map";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LearnAnywayNotice } from "@/components/lesson/learn-anyway-notice";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { LessonToc } from "@/components/lesson/lesson-toc";
import { LessonFooterNav } from "@/components/lesson/lesson-footer-nav";
import { MarkComplete } from "@/components/lesson/mark-complete";
import { ProgressTracker } from "@/components/lesson/progress-tracker";
import { References } from "@/components/lesson/references";
import { DEFAULT_LOCALE, pick } from "@/content/types";

// 162 lessons per locale. The page reads no user data, so every one of them is
// the same for every reader and can be built once instead of per request.
export function generateStaticParams() {
  return LESSON_SLUGS.map((lessonSlug) => ({ lessonSlug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; lessonSlug: string }>;
}) {
  const { locale: localeParam, lessonSlug } = await params;
  const lesson = getLesson(lessonSlug as LessonSlug);
  if (!lesson) notFound();

  setRequestLocale(localeParam);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("lesson");
  const video = LESSON_VIDEOS[lesson.slug];
  const tl = await getTranslations("localeSwitcher");

  const entry = LESSON_REGISTRY[lesson.slug];
  const availableLocales = entry
    ? (Object.keys(entry) as Locale[])
    : ([] as Locale[]);
  const usedLocale = entry?.[locale]
    ? locale
    : (availableLocales.find((l) => l === DEFAULT_LOCALE) ?? availableLocales[0]);
  const theoryLoader = usedLocale ? entry?.[usedLocale] : undefined;
  const Theory = theoryLoader ? (await theoryLoader()).default : null;
  const toc = usedLocale ? (TOC_REGISTRY[lesson.slug]?.[usedLocale] ?? []) : [];

  const referencesLoader = REFERENCES_REGISTRY[lesson.slug];
  const references = referencesLoader
    ? (await referencesLoader()).references
    : [];

  const tm = await getTranslations("mindMap");
  const overrideLoader = MIND_MAP_OVERRIDES[lesson.slug];
  const overrideBranches =
    overrideLoader && usedLocale
      ? (await overrideLoader()).mindMap[usedLocale]
      : undefined;
  const mindMap = buildLessonMindMap({
    overrideBranches,
    meta: lesson,
    locale,
    toc,
    pitfalls: usedLocale
      ? (PITFALLS_REGISTRY[lesson.slug]?.[usedLocale] ?? [])
      : [],
    prerequisites: lesson.prerequisites
      .map((p) => getLesson(p))
      .filter((p): p is LessonMeta => p !== undefined),
    dependents: getDependents(lesson.slug),
    strings: {
      objectives: tm("objectives"),
      content: tm("content"),
      pitfalls: tm("pitfalls"),
      links: tm("links"),
      prerequisiteNote: tm("prerequisiteNote"),
      dependentNote: tm("dependentNote"),
    },
  });

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
          {/* buttonVariants instead of render={<Button/>}: Button is a shared
              component, so RSC flattens it inside this client prop and its
              data-slot diverges between SSR and hydration. */}
          <Sheet>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <IconMenu2 /> {t("openNav")}
            </SheetTrigger>
            <SheetContent side="left" className="p-4">
              <SheetTitle className="sr-only">{t("openNav")}</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
          {toc.length > 0 && (
            <Sheet>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "xl:hidden"
                )}
              >
                <IconList /> {t("openToc")}
              </SheetTrigger>
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

        {/* key: App Router reuses this component across lesson navigations;
            without a remount, a stale expandedId from the previous lesson's
            branches would leave every branch collapsed. */}
        <LessonMindMap
          key={lesson.slug}
          tree={mindMap}
          strings={{
            title: tm("title"),
            open: tm("open"),
            close: tm("close"),
            zoomIn: tm("zoomIn"),
            zoomOut: tm("zoomOut"),
            reset: tm("reset"),
          }}
        />

        <LearnAnywayNotice slug={lesson.slug} />

        {usedLocale && usedLocale !== locale && (
          <Alert className="mt-6">
            <AlertDescription>{t("translationFallback")}</AlertDescription>
          </Alert>
        )}

        {video && (
          <LessonVideo
            videoId={video.youtube}
            slug={lesson.slug}
            locale={locale}
            dubs={video.dubs ?? []}
            strings={{
              play: t("playVideo"),
              title: t("videoTitle", { title: pick(lesson.title, locale) }),
              audio: t("videoAudio"),
              unavailable: t("videoUnavailable"),
              languages: { en: tl("en"), vi: tl("vi") },
            }}
          />
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
