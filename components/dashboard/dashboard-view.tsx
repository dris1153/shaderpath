"use client";

import { useLocale, useTranslations } from "next-intl";
import { LESSONS, TRACKS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { getLesson, getTrack } from "@/lib/curriculum";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { isAuthError } from "@/lib/hooks/fetch-json";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { GuestHome } from "@/components/home/guest-home";
import { ActionQueue, type QueueItemVM } from "./action-queue";
import { TrackMap, type TrackStepVM } from "./track-map";

/**
 * The landing page below its header, which is all of it that needs progress.
 *
 * The failure branch is not an empty state: overallCompletion is pure over the
 * map, so an unread one renders a confident 0 % and "nothing due" — the same
 * page a learner who lost everything would see. It says so instead, and falls
 * back to the tracks, which come from content files and cannot fail.
 */
export function DashboardView() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard");
  const { data, isError, error } = useDashboard();

  // 401 is a guest: this is the landing page, not a degraded dashboard.
  if (isAuthError(error)) {
    return <GuestHome />;
  }

  if (isError) {
    return (
      <>
        <PageHeading />
        <Alert className="mt-6">
          <AlertTitle>{t("offlineTitle")}</AlertTitle>
          <AlertDescription>{t("offlineBody")}</AlertDescription>
        </Alert>

        <h2 className="mt-8 text-lg font-semibold">{t("offlineTracks")}</h2>
        <ul className="mt-3 space-y-3">
          {TRACKS.map((track) => (
            <li key={track.id}>
              <Link
                href={`/track/${track.id}`}
                className="font-medium hover:underline"
              >
                {pick(track.title, locale)}
              </Link>
              <p className="text-muted-foreground text-sm">
                {pick(track.summary, locale)}
              </p>
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeading />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </>
    );
  }

  const { stats, queue, focus, map, pace } = data;

  // The queue is the page: every row states why it is there and what to do.
  const items: QueueItemVM[] = queue.flatMap((item) => {
    const lesson = getLesson(item.lessonSlug);
    return lesson ? [{ ...item, slug: lesson.slug, title: pick(lesson.title, locale) }] : [];
  });

  const track = map ? getTrack(map.trackId) : undefined;
  const nextTrack = map?.nextTrackId ? getTrack(map.nextTrackId) : undefined;

  const steps: TrackStepVM[] = (map?.steps ?? []).flatMap((step) => {
    const lesson = getLesson(step.slug);
    return lesson
      ? [
          {
            ...step,
            title: pick(lesson.title, locale),
            scrollPercent: step.current
              ? queue.find((i) => i.kind === "continue")?.scrollPercent
              : undefined,
          },
        ]
      : [];
  });

  // What the in-progress lesson opens up, which the track map does not say.
  const focusIndex = focus ? LESSONS.findIndex((l) => l.slug === focus) : -1;
  const nextLesson = focusIndex >= 0 ? LESSONS[focusIndex + 1] : undefined;

  return (
    <>
      <PageHeading />
      {map && track && (
        <TrackMap
          heading={t("trackHeading", {
            position: map.position,
            title: pick(track.title, locale),
          })}
          meta={t("trackMeta", {
            done: map.done,
            total: map.total,
            remaining: stats.coreTotal - stats.coreCompleted,
            pace,
          })}
          overall={{
            label: t("overall", { percent: stats.percent }),
            percent: stats.percent,
          }}
          steps={steps}
          unlocksNext={
            nextTrack
              ? t("unlocksTrack", {
                  track: pick(nextTrack.title, locale),
                  count: map.nextTrackLessons,
                })
              : undefined
          }
        />
      )}

      <ActionQueue
        items={items}
        unlocksLesson={
          nextLesson
            ? t("unlocksLesson", { title: pick(nextLesson.title, locale) })
            : undefined
        }
      />
    </>
  );
}

function PageHeading() {
  const t = useTranslations("dashboard");
  const tApp = useTranslations("app");
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">{t("welcome")}</h1>
      <p className="text-muted-foreground mt-2">{tApp("tagline")}</p>
    </>
  );
}
