// ISO 639-2 tags for the audio and subtitle streams; extend when a language is added.
const TAGS: Record<string, string> = { en: "eng", vi: "vie" };

export function languageTag(lang: string): string {
  const tag = TAGS[lang];
  if (!tag) throw new Error(`no language tag for "${lang}"; add it to TAGS in scripts/final-args.ts`);
  return tag;
}

// The picture is copied and the voice is encoded to AAC (mp3 in an mp4 plays poorly), so a mux takes seconds.
const COPY_AAC = ["-c:v", "copy", "-c:a", "aac", "-b:a", "128k"];

// The English picture, the language's voice and its subtitles as a soft mov_text track.
export function finalArgs(picture: string, audio: string, subtitles: string, output: string, lang: string): string[] {
  const tag = languageTag(lang);
  return [
    "-y", "-loglevel", "error", "-i", picture, "-i", audio, "-i", subtitles,
    "-map", "0:v", "-map", "1:a", "-map", "2:0",
    ...COPY_AAC, "-c:s", "mov_text",
    "-metadata:s:a:0", `language=${tag}`, "-metadata:s:s:0", `language=${tag}`,
    "-disposition:s:0", "default", "-movflags", "+faststart", output,
  ];
}

// The file to upload to YouTube: the same mux without subtitles, which Studio takes from subtitles.vtt.
export function uploadArgs(picture: string, audio: string, output: string): string[] {
  return ["-y", "-loglevel", "error", "-i", picture, "-i", audio, "-map", "0:v", "-map", "1:a", ...COPY_AAC, "-movflags", "+faststart", output];
}
