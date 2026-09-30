"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import type { Locale } from "@/content/types";
import {
  followPlayer,
  loadYouTubeApi,
  PLAYING,
  youtubePlayerVars,
  youtubeThumbnailUrl,
  type YouTubePlayer,
} from "@/lib/youtube-player";

type Strings = { play: string; title: string; audio: string; unavailable: string; languages: Record<Locale, string> };

// Click to load: nothing from YouTube (script, player, cookies) arrives before
// the reader presses play; until then it is a thumbnail served by the site's
// image optimizer. English plays from YouTube; a dub plays from our own
// <audio> in sync with the muted player.
export function LessonVideo({
  videoId,
  slug,
  locale,
  dubs,
  strings,
}: {
  videoId: string;
  slug: string;
  locale: Locale;
  dubs: Locale[];
  strings: Strings;
}) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [track, setTrack] = useState<Locale>(dubs.includes(locale) ? locale : "en");
  const trackRef = useRef(track);
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const audios = useRef(new Map<Locale, HTMLAudioElement>());

  // Called from player events, a timer and the track buttons; reads refs only.
  const sync = (hard: boolean) => {
    const player = playerRef.current;
    if (!player) return;
    for (const [lang, audio] of audios.current) if (lang !== trackRef.current && !audio.paused) audio.pause();
    const audio = audios.current.get(trackRef.current);
    if (!audio) return;
    if (!player.isMuted()) player.mute();
    audio.volume = player.getVolume() / 100;
    audio.playbackRate = player.getPlaybackRate();
    const step = followPlayer({
      playing: player.getPlayerState() === PLAYING,
      videoTime: player.getCurrentTime(),
      audioTime: audio.currentTime,
      audioPaused: audio.paused,
      hard,
    });
    if (step.pause) audio.pause();
    if (step.seek !== undefined) audio.currentTime = step.seek;
    if (step.play) audio.play().catch(() => {});
  };

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let timer = 0;
    loadYouTubeApi().then(
      (YT) => {
        if (cancelled || !hostRef.current) return;
        playerRef.current = new YT.Player(hostRef.current, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          playerVars: youtubePlayerVars(locale),
          events: {
            // The play button is gone; keep keyboard users on the player.
            onReady: (event) => event.target.getIframe().focus(),
            onStateChange: () => sync(true),
            onPlaybackRateChange: () => sync(true),
          },
        });
        timer = window.setInterval(() => sync(false), 250);
      },
      () => !cancelled && setFailed(true),
    );
    const dubAudios = audios.current;
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      playerRef.current?.destroy();
      playerRef.current = null;
      for (const audio of dubAudios.values()) audio.pause();
    };
    // sync reads refs only; the player is built once per start.
  }, [started, videoId, locale]);

  const start = () => {
    // Browsers let media start only from a user gesture: prime the dub now.
    const audio = audios.current.get(trackRef.current);
    audio?.play().then(() => audio.pause(), () => {});
    setStarted(true);
  };

  const choose = (next: Locale) => {
    trackRef.current = next;
    setTrack(next);
    if (next === "en") {
      for (const audio of audios.current.values()) audio.pause();
      playerRef.current?.unMute();
    } else {
      sync(true);
    }
  };

  return (
    <div className="my-6">
      <figure className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
        {failed ? (
          <a
            href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 grid place-items-center p-6 text-center text-sm underline underline-offset-4"
          >
            {strings.unavailable}
          </a>
        ) : started ? (
          <div className="absolute inset-0 [&>iframe]:size-full" title={strings.title}>
            <div ref={hostRef} />
          </div>
        ) : (
          <button
            type="button"
            onClick={start}
            aria-label={strings.play}
            className="group absolute inset-0 size-full outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <Image src={youtubeThumbnailUrl(videoId)} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/10 transition-colors group-hover:bg-black/20">
              <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110 group-focus-visible:scale-110">
                <IconPlayerPlayFilled className="size-8" />
              </span>
            </span>
          </button>
        )}
      </figure>
      {dubs.length > 0 && (
        <div role="group" aria-label={strings.audio} className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{strings.audio}</span>
          {(["en", ...dubs] as Locale[]).map((lang) => (
            <button
              key={lang}
              type="button"
              aria-pressed={track === lang}
              onClick={() => choose(lang)}
              className="rounded-full border px-3 py-1 transition-colors hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {strings.languages[lang]}
            </button>
          ))}
        </div>
      )}
      {dubs.map((lang) => (
        <audio
          key={lang}
          ref={(el) => {
            if (el) audios.current.set(lang, el);
            else audios.current.delete(lang);
          }}
          src={`/videos/${slug}/audio.${lang}.mp3`}
          preload="none"
        />
      ))}
    </div>
  );
}
