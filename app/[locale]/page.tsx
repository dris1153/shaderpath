import { getLocale, getTranslations } from "next-intl/server";
import { LESSONS } from "@/content/curriculum";

import type { Locale } from "@/content/types";
import { getLesson, getTrack, overallCompletion } from "@/lib/curriculum";
import {
  buildQueue,
  getTrackMap,
  getWeeklyPace,
} from "@/lib/dashboard-read";
import { getProgressMap } from "@/lib/progress-read";
import {
  ActionQueue,
  type QueueItemVM,
} from "@/components/dashboard/action-queue";
import { TrackMap, type TrackStepVM } from "@/components/dashboard/track-map";

// Reads live progress from SQLite on every request
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tApp = await getTranslations("app");
  const locale = (await getLocale()) as Locale;

  const now = new Date();
  const progress = await getProgressMap();
  const stats = overallCompletion(progress);

  // The queue is the page: every row states why it is there and what to do.
  const queue = await buildQueue(now, progress);
  const items: QueueItemVM[] = queue.flatMap((item) => {
    const lesson = getLesson(item.lessonSlug);
    return lesson ? [{ ...item, slug: lesson.slug, title: lesson.title[locale] }] : [];
  });

  const focus = queue.find((i) => i.kind === "continue")?.lessonSlug;
  const map = await getTrackMap(progress, focus);
  const track = map ? getTrack(map.trackId) : undefined;
  const nextTrack = map?.nextTrackId ? getTrack(map.nextTrackId) : undefined;

  const steps: TrackStepVM[] = (map?.steps ?? []).flatMap((step) => {
    const lesson = getLesson(step.slug);
    return lesson
      ? [
          {
            ...step,
            title: lesson.title[locale],
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
    <main
      id="main-content"
      tabIndex={-1}
      className="container mx-auto w-full flex-1 px-4 py-10"
    >
      <h1 className="text-3xl font-semibold tracking-tight">{t("welcome")}</h1>
      <p className="text-muted-foreground mt-2">{tApp("tagline")}</p>

      {map && track && (
        <TrackMap
          heading={t("trackHeading", {
            position: map.position,
            title: track.title[locale],
          })}
          meta={t("trackMeta", {
            done: map.done,
            total: map.total,
            remaining: stats.coreTotal - stats.coreCompleted,
            pace: await getWeeklyPace(now),
          })}
          overall={{
            label: t("overall", { percent: stats.percent }),
            percent: stats.percent,
          }}
          steps={steps}
          unlocksNext={
            nextTrack
              ? t("unlocksTrack", {
                  track: nextTrack.title[locale],
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
            ? t("unlocksLesson", { title: nextLesson.title[locale] })
            : undefined
        }
      />
    </main>
  );
}
