"use client";

import { useState } from "react";
import Image from "next/image";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import type { Locale } from "@/content/types";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube-embed";

// Click to load: the YouTube player, its scripts and cookies arrive only when
// the reader presses play. Until then it is a thumbnail (served through the
// site's image optimizer, so no request reaches Google) and one button.
export function LessonVideo({
  videoId,
  locale,
  captions,
  label,
  title,
}: {
  videoId: string;
  locale: Locale;
  captions: boolean;
  label: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="relative my-6 aspect-video overflow-hidden rounded-xl border bg-muted">
      {playing ? (
        <iframe
          // The button that had focus is gone; keep keyboard users on the player.
          ref={(el) => el?.focus()}
          src={youtubeEmbedUrl(videoId, locale, captions)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          className="group absolute inset-0 size-full outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <Image
            src={youtubeThumbnailUrl(videoId)}
            alt=""
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 grid place-items-center bg-black/10 transition-colors group-hover:bg-black/20">
            <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110 group-focus-visible:scale-110">
              <IconPlayerPlayFilled className="size-8" />
            </span>
          </span>
        </button>
      )}
    </figure>
  );
}
