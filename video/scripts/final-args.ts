// ISO 639-2 tags for the audio and subtitle streams; extend when a language is added.
const TAGS: Record<string, string> = { en: "eng", vi: "vie" };

export function languageTag(lang: string): string {
  const tag = TAGS[lang];
  if (!tag) throw new Error(`no language tag for "${lang}"; add it to TAGS in scripts/final-args.ts`);
  return tag;
}

// Picture + voice of the language's render, plus its subtitles as a soft mov_text track
// (stream copy: nothing is re-encoded, so it takes seconds).
export function finalArgs(render: string, subtitles: string, output: string, lang: string): string[] {
  const tag = languageTag(lang);
  return [
    "-y", "-loglevel", "error", "-i", render, "-i", subtitles,
    "-map", "0:v", "-map", "0:a", "-map", "1:0",
    "-c:v", "copy", "-c:a", "copy", "-c:s", "mov_text",
    "-metadata:s:a:0", `language=${tag}`, "-metadata:s:s:0", `language=${tag}`,
    "-disposition:s:0", "default", "-movflags", "+faststart", output,
  ];
}

// `pnpm final <slug>` without languages: English plus every voiced one, minus those with no render yet.
export function finalLanguages(voiced: string[], hasRender: (lang: string) => boolean): { langs: string[]; skipped: string[] } {
  const wanted = ["en", ...voiced.filter((l) => l !== "en")];
  return { langs: wanted.filter(hasRender), skipped: wanted.filter((l) => !hasRender(l)) };
}
