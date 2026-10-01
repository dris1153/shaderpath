"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { Inko } from "@/components/mascot/inko";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DemoStrip } from "./demo-strip";
import { TrackGrid } from "./track-grid";

// Client-only and lazy: the canvas is decoration that arrives after hydration,
// and keeping it out of the eager chunk keeps a render loop off a route that
// may never need one. The copy around it is plain markup either way.
const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

const firstSlug = MODULES.filter((m) => m.trackId === TRACKS[0]?.id).sort(
  (a, b) => a.order - b.order,
)[0]?.lessonSlugs[0];
const START_HREF = firstSlug ? `/lesson/${firstSlug}` : "/roadmap";
const DEMOS = LESSONS.filter((l) => l.hasDemo).length;
const HOURS = Math.round(LESSONS.reduce((sum, l) => sum + l.estimatedMinutes, 0) / 60);

/**
 * The landing page a signed-out visitor sees in place of the dashboard.
 *
 * Reads nothing and fires no action. The hero block owns its size and an
 * opaque background, so the canvas arrives without moving anything.
 */
export function GuestHome() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col gap-12">
      <div className="relative lg:mt-14">
        {/* Inko leans over the hero's top edge into its empty right third. */}
        <Inko pose="wave" size={210} className="absolute -top-24 right-10 z-10 hidden lg:block" />
        <section className="edge-card relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(140deg,#070b16_0%,#111a2e_55%,#1b1626_100%)]">
          <HeroCanvas />
          {/* Scrim: the shader is unpredictable, the headline still has to be legible. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-black/60 sm:via-black/60 sm:to-black/25"
          />
          <div className="relative flex min-h-[22rem] flex-col justify-center px-6 py-12 sm:px-10 sm:py-16">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span aria-hidden className="size-1.5 rounded-full bg-white/40" />
              {t("heroBadge")}
            </span>
            <h1 className="max-w-3xl text-4xl leading-[1.05] tracking-tight text-balance text-white sm:text-6xl">
              {t("headline")}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              {t("lede", { lessons: LESSONS.length })}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={START_HREF} className={buttonVariants({ size: "lg" })}>
                {t("ctaStart")}
              </Link>
              <Link href="/roadmap" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                {t("ctaTracks", { tracks: TRACKS.length })}
              </Link>
            </div>
            <p className="mt-6 text-sm font-semibold text-white/80">
              {t("proof", { lessons: LESSONS.length, tracks: TRACKS.length, demos: DEMOS })}
            </p>
            <p className="mt-1 text-xs text-white/70">{t("readFreely")}</p>
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-3xl">{t("demosLabel")}</h2>
        <DemoStrip />
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-3xl">{t("ladderTitle")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("ladderMeta", { tracks: TRACKS.length, modules: MODULES.length, hours: HOURS })}
          </p>
        </div>
        <div className="mt-5">
          <TrackGrid />
        </div>
      </section>
    </div>
  );
}
