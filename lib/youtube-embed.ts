import type { Locale } from "@/content/types";

// youtube-nocookie sets no tracking cookies until playback. `hl` is the player
// UI language and `cc_lang_pref` the caption track. `captions` turns them on:
// for a reader of the shared upload, whose audio follows their YouTube settings.
export function youtubeEmbedUrl(id: string, locale: Locale, captions: boolean): string {
  const params = new URLSearchParams({ autoplay: "1", rel: "0", hl: locale, cc_lang_pref: locale });
  if (captions) params.set("cc_load_policy", "1");
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}`;
}

export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
}
