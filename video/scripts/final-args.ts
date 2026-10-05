// ISO 639-2 tags for the audio and subtitle streams; extend when a language is added.
const TAGS: Record<string, string> = { en: "eng", vi: "vie" };

export function languageTag(lang: string): string {
  const tag = TAGS[lang];
  if (!tag) throw new Error(`no language tag for "${lang}"; add it to TAGS in scripts/final-args.ts`);
  return tag;
}

// The English picture (copied), the language's voice as AAC (mp3 in an mp4 plays poorly), and its subtitles
// as a soft mov_text track. Only the voice is encoded, so it takes seconds.
export function finalArgs(picture: string, audio: string, subtitles: string, output: string, lang: string): string[] {
  const tag = languageTag(lang);
  return [
    "-y", "-loglevel", "error", "-i", picture, "-i", audio, "-i", subtitles,
    "-map", "0:v", "-map", "1:a", "-map", "2:0",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-c:s", "mov_text",
    "-metadata:s:a:0", `language=${tag}`, "-metadata:s:s:0", `language=${tag}`,
    "-disposition:s:0", "default", "-movflags", "+faststart", output,
  ];
}
