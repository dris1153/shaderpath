"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import type { LessonSlug } from "@/content/slugs";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { MarkComplete } from "./mark-complete";

type Neighbor = { slug: string; title: string };

type Props = {
  slug: string;
  prev?: Neighbor;
  next?: Neighbor;
  moduleSlugs: LessonSlug[];
  labels: { prev: string; next: string };
};

function NeighborLink({ to, label, side }: { to: Neighbor; label: string; side: "prev" | "next" }) {
  const Arrow = side === "prev" ? IconArrowLeft : IconArrowRight;
  return (
    <Link
      href={`/lesson/${to.slug}`}
      aria-label={`${label}: ${to.title}`}
      className={cn(
        "hover:bg-secondary flex min-h-11 min-w-11 flex-1 items-center gap-2 rounded-xl px-3 py-1.5",
        side === "next" && "flex-row-reverse text-right",
      )}
    >
      <Arrow className="size-5 shrink-0" aria-hidden />
      <span className="hidden min-w-0 sm:block">
        <span className="text-muted-foreground block text-xs">{label}</span>
        <span className="block truncate text-sm font-bold">{to.title}</span>
      </span>
    </Link>
  );
}

/**
 * Sticks to the bottom of the viewport while the lesson is read and comes to
 * rest at its end. On phones it replaces the tab bar, which hides on lessons.
 */
export function LessonDock({ slug, prev, next, moduleSlugs, labels }: Props) {
  return (
    <div className="sticky bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 mt-12">
      <div className="edge-card bg-card relative flex items-center gap-2 rounded-2xl p-2">
        {prev ? <NeighborLink to={prev} label={labels.prev} side="prev" /> : <span className="flex-1" />}
        <div className="flex shrink-0 justify-center">
          <MarkComplete slug={slug} next={next} moduleSlugs={moduleSlugs} />
        </div>
        {next ? <NeighborLink to={next} label={labels.next} side="next" /> : <span className="flex-1" />}
      </div>
    </div>
  );
}
