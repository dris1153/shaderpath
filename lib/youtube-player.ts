import type { Locale } from "@/content/types";

// The slice of the YouTube IFrame Player API the lesson video uses.
export type YouTubePlayer = {
  getCurrentTime(): number;
  getPlayerState(): number;
  getPlaybackRate(): number;
  getVolume(): number;
  isMuted(): boolean;
  mute(): void;
  unMute(): void;
  destroy(): void;
  getIframe(): HTMLIFrameElement;
};

type PlayerOptions = {
  host: string;
  videoId: string;
  playerVars: Record<string, string | number>;
  events: {
    onReady?: (event: { target: YouTubePlayer }) => void;
    onStateChange?: () => void;
    onPlaybackRateChange?: () => void;
  };
};

type YouTubeApi = { Player: new (element: HTMLElement, options: PlayerOptions) => YouTubePlayer };

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const PLAYING = 1; // YT.PlayerState.PLAYING

let api: Promise<YouTubeApi> | undefined;

// Loads the IFrame API once, on the first play; a failed load can be retried.
export function loadYouTubeApi(): Promise<YouTubeApi> {
  api ??= new Promise<YouTubeApi>((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      api = undefined;
      reject(new Error("the YouTube player failed to load"));
    };
    document.head.appendChild(script);
  });
  return api;
}

// `hl` is the player UI language and `cc_lang_pref` the caption track, both the page's.
export function youtubePlayerVars(locale: Locale): Record<string, string | number> {
  return { autoplay: 1, rel: 0, playsinline: 1, hl: locale, cc_lang_pref: locale };
}

export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
}

// A dub (another language's voice) plays in our own <audio> next to the muted
// YouTube player. It is fitted to the video's timeline, so following the
// player is enough: same state, same time within DRIFT_SEC.
export const DRIFT_SEC = 0.25;

export function followPlayer(p: {
  playing: boolean;
  videoTime: number;
  audioTime: number;
  audioPaused: boolean;
  // Right after a state or rate change (play, seek, resume): always realign.
  hard: boolean;
}): { seek?: number; play?: true; pause?: true } {
  if (!p.playing) return p.audioPaused ? {} : { pause: true };
  return {
    ...(p.hard || Math.abs(p.audioTime - p.videoTime) > DRIFT_SEC ? { seek: p.videoTime } : {}),
    ...(p.audioPaused ? { play: true as const } : {}),
  };
}
