"use client";

import { useLocale, useTranslations } from "next-intl";
import { LESSONS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { getLesson, getTrack } from "@/lib/curriculum";
import { REVIEW_KINDS } from "@/lib/dashboard-queue";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useGamification } from "@/lib/hooks/use-gamification";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { DemoStrip } from "@/components/home/demo-strip";
import { GuestHome } from "@/components/home/guest-home";
import { TrackGrid } from "@/components/home/track-grid";
import { ErrorState } from "@/components/states/error-state";
import { ActionQueue, type QueueItemVM } from "./action-queue";
import { Greeting } from "./greeting";
import { ContinueCard, ReviewTodayCard, WeekCard } from "./today-cards";
import { TrackMap, type TrackStepVM } from "./track-map";

/**
 * The landing page. The static HTML is the skeleton: SSG cannot know who is
 * asking, so the session decides between the guest landing and the dashboard.
 */
export function DashboardView() {
  const { data: auth, isPending } = useAuth();
  if (isPending) return <DashboardSkeleton />;
  if (!auth?.user) return <GuestHome />;
  return <SignedInDashboard />;
}

/**
 * The failure branch is not an empty state: overallCompletion is pure over the
 * map, so an unread one renders a confident 0 % and "nothing due" — the same
 * page a learner who lost everything would see. It says so instead, and falls
 * back to the tracks, which come from content files and cannot fail.
 */
function SignedInDashboard() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard");
  const tHome = useTranslations("home");
  const { data, isError, refetch } = useDashboard();
  const { data: xp } = useGamification();
  const { data: progressMap } = useProgressMap();

  if (!data) {
    if (!isError) return <DashboardSkeleton />;
    return (
      <>
        <h1 className="text-4xl leading-tight">{t("welcome")}</h1>
        <ErrorState message={t("offlineBody")} onRetry={() => void refetch()} />
        <h2 className="mt-12 mb-5 text-3xl">{t("offlineTracks")}</h2>
        <TrackGrid />
      </>
    );
  }

  const { stats, queue, focus, map, pace } = data;

  // The queue is the page: every row states why it is there and what to do.
  const items: QueueItemVM[] = queue.flatMap((item) => {
    const lesson = getLesson(item.lessonSlug);
    return lesson ? [{ ...item, slug: lesson.slug, title: pick(lesson.title, locale) }] : [];
  });
  const continueItem = queue.find((i) => i.kind === "continue");
  const due = items.filter((i) => REVIEW_KINDS.has(i.kind)).length;

  const track = map ? getTrack(map.trackId) : undefined;
  const nextTrack = map?.nextTrackId ? getTrack(map.nextTrackId) : undefined;

  const steps: TrackStepVM[] = (map?.steps ?? []).flatMap((step) => {
    const lesson = getLesson(step.slug);
    return lesson
      ? [{ ...step, title: pick(lesson.title, locale), scrollPercent: step.current ? continueItem?.scrollPercent : undefined }]
      : [];
  });
  const currentIndex = steps.findIndex((s) => s.current);
  const current = steps[currentIndex];
  const continueLesson =
    current && track
      ? { slug: current.slug, title: current.title, track: pick(track.title, locale), n: currentIndex + 1, m: steps.length }
      : undefined;

  // What the in-progress lesson opens up, which the track map does not say.
  const focusIndex = focus ? LESSONS.findIndex((l) => l.slug === focus) : -1;
  const nextLesson = focusIndex >= 0 ? LESSONS[focusIndex + 1] : undefined;

  return (
    <>
      <Greeting streak={xp?.streak.current} nextTitle={continueLesson?.title} />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        <ContinueCard
          lesson={continueLesson}
          scrollPercent={continueItem ? (continueItem.scrollPercent ?? 0) : undefined}
        />
        <ReviewTodayCard due={due} nextDays={data.nextReviewDays} />
        <WeekCard streak={xp?.streak.current} week={xp?.streak.thisWeek} />
      </div>

      {map && track && (
        <TrackMap
          heading={t("trackHeading", { position: map.position, title: pick(track.title, locale) })}
          meta={t("trackMeta", {
            done: map.done,
            total: map.total,
            remaining: stats.coreTotal - stats.coreCompleted,
            pace,
          })}
          overall={{ label: t("overall", { percent: stats.percent }), percent: stats.percent }}
          steps={steps}
          unlocksNext={
            nextTrack
              ? t("unlocksTrack", { track: pick(nextTrack.title, locale), count: map.nextTrackLessons })
              : undefined
          }
        />
      )}

      <ActionQueue
        items={items}
        unlocksLesson={nextLesson ? t("unlocksLesson", { title: pick(nextLesson.title, locale) }) : undefined}
      />

      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-3xl">{t("tracksTitle")}</h2>
          <Link href="/roadmap" className="text-link font-bold underline-offset-4 hover:underline">
            {t("openRoadmap")}
          </Link>
        </div>
        <TrackGrid progress={progressMap?.progress} />
      </section>

      <section className="mt-12">
        <h2 className="text-3xl">{tHome("demosLabel")}</h2>
        <DemoStrip />
      </section>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-8">
      <Skeleton className="h-28 w-full max-w-xl rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
