import { describe, expect, it } from "vitest";
import { DRIFT_SEC, followPlayer, youtubePlayerVars, youtubeThumbnailUrl } from "@/lib/youtube-player";

const base = { playing: true, videoTime: 10, audioTime: 10, audioPaused: false, hard: false };

describe("followPlayer", () => {
  it("leaves an in-sync dub alone", () => {
    expect(followPlayer({ ...base, audioTime: 10 + DRIFT_SEC / 2 })).toEqual({});
  });

  it("realigns a dub that drifted", () => {
    expect(followPlayer({ ...base, audioTime: 10 + DRIFT_SEC * 2 })).toEqual({ seek: 10 });
  });

  it("realigns and starts after a play or seek", () => {
    expect(followPlayer({ ...base, audioPaused: true, hard: true })).toEqual({ seek: 10, play: true });
  });

  it("pauses when the video stops, and stays paused", () => {
    expect(followPlayer({ ...base, playing: false })).toEqual({ pause: true });
    expect(followPlayer({ ...base, playing: false, audioPaused: true })).toEqual({});
  });
});

describe("youtube helpers", () => {
  it("uses the page language for the player UI and captions", () => {
    expect(youtubePlayerVars("vi")).toMatchObject({ hl: "vi", cc_lang_pref: "vi", playsinline: 1 });
  });

  it("escapes the thumbnail id", () => {
    expect(youtubeThumbnailUrl("a/b")).toBe("https://i.ytimg.com/vi/a%2Fb/hqdefault.jpg");
  });
});
