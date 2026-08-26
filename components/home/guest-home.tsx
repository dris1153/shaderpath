"use client";

import { useTranslations } from "next-intl";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { TrackLadder } from "./track-ladder";

const firstSlug = MODULES.filter((m) => m.trackId === TRACKS[0]?.id).sort(
  (a, b) => a.order - b.order,
)[0]?.lessonSlugs[0];
const START_HREF = firstSlug ? `/lesson/${firstSlug}` : "/roadmap";

/**
 * The landing page a signed-out visitor sees in place of the dashboard.
 *
 * Holds no state and reads nothing, so it renders entirely into the static
 * HTML. The hero block already carries its final size and opaque background;
 * phase 2 mounts a canvas behind this copy without shifting anything.
 */
export function GuestHome() {
  const t = useTranslations("home");

  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,#070b16_0%,#111a2e_55%,#1b1626_100%)]">
        <div className="relative flex min-h-[22rem] flex-col justify-center px-6 py-14 sm:px-10 sm:py-20">
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
                "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {t("ctaPlayground")}
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/50">{t("readFreely")}</p>
        </div>
      </section>

      <TrackLadder />
    </div>
  );
}
