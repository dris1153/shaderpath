"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { DemoStrip } from "./demo-strip";
import { TrackLadder } from "./track-ladder";

// Client-only and lazy: the canvas is decoration that arrives after hydration,
// and keeping it out of the eager chunk keeps a render loop off a route that
// may never need one. The copy around it is plain markup either way.
const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

const firstSlug = MODULES.filter((m) => m.trackId === TRACKS[0]?.id).sort(
  (a, b) => a.order - b.order,
)[0]?.lessonSlugs[0];
const START_HREF = firstSlug ? `/lesson/${firstSlug}` : "/roadmap";

/**
 * The landing page a signed-out visitor sees in place of the dashboard.
 *
 * Reads nothing and fires no action. Note this is not what `/vi` prerenders:
 * SSG cannot know who is asking, so the static HTML is the dashboard skeleton
 * and this appears once /api/dashboard answers 401. The hero block owns its
 * size and an opaque background, so the canvas arrives without moving anything.
 */
export function GuestHome() {
  const t = useTranslations("home");

  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,#070b16_0%,#111a2e_55%,#1b1626_100%)]">
        <HeroCanvas />
        {/* Scrim: the shader is unpredictable, the headline still has to be legible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-black/60 sm:via-black/60 sm:to-black/25"
        />
        <div className="relative flex min-h-[22rem] flex-col justify-center px-6 py-14 sm:px-10 sm:py-20">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span aria-hidden className="size-1.5 rounded-full bg-white/40" />
            {t("heroBadge")}
          </span>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            {t("headline")}
          </h1>
          <p className="mt-5 max-w-xl text-sm text-white/70 sm:text-base">
            {t("lede", { lessons: LESSONS.length })}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={START_HREF}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-neutral-900 hover:bg-white/90",
              )}
            >
              {t("ctaStart")}
            </Link>
            <Link
              href="/playground"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/45 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {t("ctaPlayground")}
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/70">{t("readFreely")}</p>
        </div>
      </section>

      <DemoStrip />

      <TrackLadder />
    </div>
  );
}
