import { getLocale, getTranslations } from "next-intl/server";
import { LESSONS, TRACKS } from "@/content/curriculum";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "@/i18n/navigation";

// Reads live progress from the database on every request
export const dynamic = "force-dynamic";

// A slow dashboard must not become a 504. The page already degrades when these
// reads throw; this makes it degrade when they merely hang, which is what a
// cold connection to a distant pooler actually does. Vercel kills the function
// at 10s, so failing at 3s leaves room to render the fallback.
//
// It does not cancel the query — the transaction pooler ignores a client-side
// statement_timeout, measured — but each Vercel invocation ends with its own
// connection, so nothing is left holding it.
function withDeadline<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`dashboard read exceeded ${ms}ms`)), ms),
    ),
  ]);
}

// Everything below the header needs the database, and four calls reach for it
// independently — getProgressMap, buildQueue's own reviewQueue select,
// getTrackMap and getWeeklyPace. Gathering them in one place gives a failure a
// single branch instead of scattering guards across all four.
async function loadProgressView(now: Date) {
  const progress = await getProgressMap();
  const queue = await buildQueue(now, progress);
  const focus = queue.find((i) => i.kind === "continue")?.lessonSlug;
  return {
    stats: overallCompletion(progress),
    queue,
    focus,
    map: await getTrackMap(progress, focus),
    pace: await getWeeklyPace(now),
  };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tApp = await getTranslations("app");
  const locale = (await getLocale()) as Locale;

  const now = new Date();
  let view: Awaited<ReturnType<typeof loadProgressView>> | null = null;
  try {
    view = await withDeadline(loadProgressView(now), 3000);
  } catch (err) {
    // Deliberately not an empty state: overallCompletion is pure over progress,
    // so an empty map renders a confident 0% and "nothing due" — indistinguishable
    // from wiped progress. Better to say the numbers cannot be read.
    console.warn("dashboard progress unavailable:", err);
  }

  const header = (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">{t("welcome")}</h1>
      <p className="text-muted-foreground mt-2">{tApp("tagline")}</p>
    </>
  );

  // The curriculum comes from content files, so navigation survives an outage
  // even when every progress-derived number is unavailable.
  if (!view) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto w-full flex-1 px-4 py-10"
      >
        {header}

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
                {track.title[locale]}
              </Link>
              <p className="text-muted-foreground text-sm">
                {track.summary[locale]}
              </p>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  const { stats, queue, focus, map, pace } = view;

  // The queue is the page: every row states why it is there and what to do.
  const items: QueueItemVM[] = queue.flatMap((item) => {
    const lesson = getLesson(item.lessonSlug);
    return lesson ? [{ ...item, slug: lesson.slug, title: lesson.title[locale] }] : [];
  });

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
      {header}

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
