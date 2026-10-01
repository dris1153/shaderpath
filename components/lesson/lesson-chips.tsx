"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { IconChevronDown, IconHierarchy2, IconPlayerPlay } from "@tabler/icons-react";
import type { Locale, MindMapNode } from "@/content/types";
import { BookmarkToggle } from "@/components/notes/bookmark-toggle";
import { cn } from "@/lib/utils";
import { LessonVideo } from "./lesson-video";
import type { MindMapUiStrings } from "./lesson-mind-map";

const Fullscreen = dynamic(() => import("./lesson-mind-map-fullscreen"), { ssr: false });

const CHIP =
  "edge-card bg-card hover:bg-secondary flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-bold transition-colors";

type VideoProps = React.ComponentProps<typeof LessonVideo>;

type Props = {
  slug: string;
  video?: Omit<VideoProps, "slug" | "locale">;
  locale: Locale;
  mindMap: MindMapNode;
  mindMapStrings: MindMapUiStrings;
  labels: { video: string; mindMap: string };
};

/**
 * The extras a lesson has, folded into one row so the first paragraph stays
 * above the fold. The video expands in place and still loads nothing from
 * YouTube until its own play button is pressed.
 */
export function LessonChips({ slug, video, locale, mindMap, mindMapStrings, labels }: Props) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2.5">
        {video ? (
          <button type="button" aria-expanded={videoOpen} onClick={() => setVideoOpen((o) => !o)} className={CHIP}>
            <IconPlayerPlay className="text-coral size-4" aria-hidden />
            {labels.video}
            <IconChevronDown className={cn("size-4 transition-transform", videoOpen && "rotate-180")} aria-hidden />
          </button>
        ) : null}
        {mindMap.children?.length ? (
          <button type="button" onClick={() => setMapOpen(true)} className={CHIP}>
            <IconHierarchy2 className="text-link size-4" aria-hidden />
            {labels.mindMap}
          </button>
        ) : null}
        <BookmarkToggle slug={slug} className="size-10 rounded-xl" />
      </div>
      {video && videoOpen ? <LessonVideo {...video} slug={slug} locale={locale} /> : null}
      {mapOpen ? <Fullscreen tree={mindMap} strings={mindMapStrings} onClose={() => setMapOpen(false)} /> : null}
    </div>
  );
}
