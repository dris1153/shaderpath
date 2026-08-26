"use client";

import { useLocale, useTranslations } from "next-intl";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { Link } from "@/i18n/navigation";

const LESSON_COUNTS = LESSONS.reduce<Record<string, number>>((acc, lesson) => {
  acc[lesson.trackId] = (acc[lesson.trackId] ?? 0) + 1;
  return acc;
}, {});

const TOTAL_HOURS = Math.round(
  LESSONS.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0) / 60,
);

// Position in the track order is real information — difficulty rises with it —
// so the rail is tinted along the shader's own cold-to-hot scale.
const tint = (index: number) =>
  `color-mix(in oklch, var(--track-hot) ${(index / (TRACKS.length - 1)) * 100}%, var(--track-cold))`;

export function TrackLadder() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("ladderTitle")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("ladderMeta", {
            tracks: TRACKS.length,
            modules: MODULES.length,
            hours: TOTAL_HOURS,
          })}
        </p>
      </div>

      <ol className="mt-5 grid gap-2 md:grid-cols-2">
        {TRACKS.map((track, index) => (
          <li key={track.id}>
            <Link
              href={`/track/${track.id}`}
              className="group hover:bg-muted/60 flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors"
            >
              <span
                aria-hidden
                className="h-8 w-1 shrink-0 rounded-full"
                style={{ background: tint(index) }}
              />
              <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 font-medium group-hover:underline">
                {pick(track.title, locale)}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {t("trackLessons", { count: LESSON_COUNTS[track.id] ?? 0 })}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div
        aria-hidden
        className="mt-5 h-1.5 rounded-full"
        style={{
          background:
            "linear-gradient(to right, var(--track-cold), var(--track-hot))",
        }}
      />
      <div
        aria-hidden
        className="text-muted-foreground mt-2 flex justify-between text-xs"
      >
        <span>{t("legendFoundation")}</span>
        <span>{t("legendIntermediate")}</span>
        <span>{t("legendAdvanced")}</span>
        <span>{t("legendCapstone")}</span>
      </div>
    </section>
  );
}
