import fs from "node:fs";
import type { Timing } from "../src/scene/timing";

// One committed source per lesson (content/lessons/<track>/<slug>/video/youtube.json)
// → the text of a YouTube upload. Times come from the English timing, so a
// re-voice moves every chapter and quiz with it.
export const SITE = "https://shaderpath.drisdev.io";
const LOCALES = ["en", "vi"] as const;
export type Loc = (typeof LOCALES)[number];
type L10n = Record<Loc, string>;

export type Quiz = { at: string; question: string; answers: string[]; correct: number; explanation?: string };
export type YoutubeSource = {
  title: L10n;
  summary: L10n;
  bullets: Record<Loc, string[]>;
  lessonLink: L10n;
  series: L10n;
  tags: string[];
  hashtags: string[];
  chapters: Record<string, L10n>;
  quizzes: Quiz[];
  thumbnail: { lines: string[]; code?: string; background?: string };
};

const LANGUAGE: L10n = { en: "English", vi: "Tiếng Việt" };

// Fixed copy around each lesson's own text.
const COPY = {
  en: {
    inVideo: "In this video:",
    promo: "Shaderpath teaches WebGL, three.js and GLSL from the math up, in 162 lessons in English and Vietnamese:",
    chapters: "Chapters",
    subtitles: "Subtitles",
    dub: "",
    narration: "Narration: AI voice (ElevenLabs)",
  },
  vi: {
    inVideo: "Trong video:",
    promo: "Shaderpath: học WebGL, three.js và GLSL từ nền tảng toán, 162 bài bằng tiếng Việt và tiếng Anh:",
    chapters: "Chương",
    subtitles: "Phụ đề",
    dub: "Bản lồng tiếng Việt: xem ngay trên trang bài học ở trên.",
    narration: "Lời dẫn: giọng AI (ElevenLabs)",
  },
} satisfies Record<Loc, Record<string, string>>;

// Reads a lesson's youtube.json; a syntax error names the file.
export function readYoutubeSource(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${file}: ${(error as Error).message}`);
  }
}

const pad = (n: number) => String(n).padStart(2, "0");
// Description chapters: m:ss.
export const chapterTime = (sec: number) => `${Math.floor(sec / 60)}:${pad(Math.floor(sec) % 60)}`;
// Studio's quiz field reads minutes:seconds:frames; whole seconds are right whatever the last field means.
export const studioTime = (sec: number) => `${chapterTime(sec)}:00`;

// "<scene>:end" is the last whole second before the cut; "<scene>.<cue>" is the cue's second.
export function resolveAnchor(timing: Timing, at: string): number {
  const end = /^([a-z0-9-]+):end$/.exec(at);
  if (end) {
    const scene = timing.scenes.find((s) => s.id === end[1]);
    if (!scene) throw new Error(`unknown scene "${end[1]}"`);
    return Math.floor((scene.from + scene.durationInFrames) / timing.fps) - 1;
  }
  if (typeof at !== "string" || !Object.hasOwn(timing.cues, at)) {
    throw new Error(`unknown anchor "${at}" (use "<scene>:end" or "<scene>.<cue>")`);
  }
  return Math.floor(timing.cues[at]! / timing.fps);
}

// YouTube counts a comma per separator and wraps multi-word tags in quotes.
export const tagsLength = (tags: string[]) =>
  tags.reduce((n, t) => n + t.length + (t.includes(" ") ? 2 : 0), 0) + Math.max(0, tags.length - 1);

const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isL10n = (v: unknown): v is L10n =>
  typeof v === "object" && v !== null && LOCALES.every((l) => isText((v as Record<string, unknown>)[l]));

// Checks the source against the timing; every problem is reported at once.
export function validateYoutube(raw: unknown, timing: Timing): YoutubeSource {
  const errors: string[] = [];
  const src = raw as YoutubeSource;
  for (const key of ["title", "summary", "lessonLink", "series"] as const) {
    if (!isL10n(src?.[key])) errors.push(`${key}: needs en and vi text`);
  }
  for (const l of LOCALES) {
    if ((src?.title?.[l]?.length ?? 0) > 100) errors.push(`title.${l}: over YouTube's 100 characters`);
    if (!Array.isArray(src?.bullets?.[l]) || !src.bullets[l].every(isText)) errors.push(`bullets.${l}: needs a list of text`);
  }
  if (!Array.isArray(src?.tags) || !src.tags.every(isText) || !Array.isArray(src?.hashtags) || !src.hashtags.every(isText)) {
    errors.push("tags and hashtags: need lists of text");
  } else if (tagsLength(src.tags) > 500) errors.push("tags: over YouTube's 500 characters");
  if (timing.scenes.length < 3) errors.push("chapters: YouTube needs at least 3");
  for (const scene of timing.scenes) {
    if (!isL10n(src?.chapters?.[scene.id])) errors.push(`chapters.${scene.id}: needs en and vi titles`);
    if (scene.durationInFrames < 10 * timing.fps) errors.push(`chapters.${scene.id}: under YouTube's 10 s minimum`);
  }
  for (const id of Object.keys(src?.chapters ?? {})) {
    if (!timing.scenes.some((s) => s.id === id)) errors.push(`chapters.${id}: no such scene`);
  }
  if (!Array.isArray(src?.quizzes)) errors.push("quizzes: needs a list (it may be empty)");
  else {
    src.quizzes.forEach((q, i) => {
      const where = `quizzes[${i}]`;
      if (typeof q !== "object" || q === null) return void errors.push(`${where}: needs an object`);
      try {
        resolveAnchor(timing, q.at);
      } catch (error) {
        errors.push(`${where}: ${(error as Error).message}`);
      }
      if (!isText(q.question) || q.question.length > 100) errors.push(`${where}: question must be 1–100 characters`);
      if (!Array.isArray(q.answers) || q.answers.length < 2 || q.answers.length > 4 || !q.answers.every(isText)) {
        errors.push(`${where}: needs 2–4 text answers`);
      } else if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.answers.length) {
        errors.push(`${where}: correct is not an answer index`);
      }
      if (q.explanation !== undefined && typeof q.explanation !== "string") errors.push(`${where}: explanation must be text`);
    });
  }
  // Studio rejects "<" and ">" in titles, descriptions and tags.
  const texts: [string, unknown][] = [
    ...(["title", "summary", "lessonLink", "series"] as const).flatMap((k) => LOCALES.map((l) => [`${k}.${l}`, src?.[k]?.[l]] as [string, unknown])),
    ...LOCALES.flatMap((l) => (src?.bullets?.[l] ?? []).map((b, i) => [`bullets.${l}[${i}]`, b] as [string, unknown])),
    ...Object.entries(src?.chapters ?? {}).flatMap(([id, c]) => LOCALES.map((l) => [`chapters.${id}.${l}`, c?.[l]] as [string, unknown])),
    ...(src?.tags ?? []).map((t, i) => [`tags[${i}]`, t] as [string, unknown]),
    ...(src?.hashtags ?? []).map((t, i) => [`hashtags[${i}]`, t] as [string, unknown]),
  ];
  for (const [where, text] of texts) if (typeof text === "string" && /[<>]/.test(text)) errors.push(`${where}: YouTube rejects < and >`);
  if (!Array.isArray(src?.thumbnail?.lines) || src.thumbnail.lines.length === 0) errors.push("thumbnail.lines: needs at least one line");
  if (errors.length) throw new Error(`youtube.json:\n  ${errors.join("\n  ")}`);
  return src;
}

function description(src: YoutubeSource, timing: Timing, slug: string, l: Loc, dubs: Loc[]): string {
  const c = COPY[l];
  const chapters = timing.scenes.map((s) => `${chapterTime(s.from / timing.fps)} ${src.chapters[s.id]![l]}`);
  // Subtitles exist for English and for every dubbed language.
  const subtitled = (["en", ...dubs.filter((d) => d !== "en")] as Loc[]).map((x) => LANGUAGE[x]).join(", ");
  const text = [
    src.summary[l],
    "",
    c.inVideo,
    ...src.bullets[l].map((b) => `- ${b}`),
    "",
    src.lessonLink[l],
    `${SITE}/${l}/lesson/${slug}`,
    "",
    c.promo,
    `${SITE}/${l}`,
    "",
    c.chapters,
    ...chapters,
    "",
    `${c.subtitles}: ${subtitled}`,
    ...(dubs.includes(l) && c.dub ? [c.dub] : []),
    "",
    src.series[l],
    c.narration,
    "",
    src.hashtags.map((h) => `#${h}`).join(" "),
  ].join("\n");
  if (text.length > 5000) throw new Error(`description.${l}: over YouTube's 5000 characters`);
  return text;
}

// Throws before anything is written when a description is too long.
export function renderMetadata(src: YoutubeSource, timing: Timing, slug: string, dubs: Loc[]): string {
  const block = (s: string) => ["```", s, "```"].join("\n");
  // One block per quiz, each line ready to paste into its Studio field.
  const quizzes = src.quizzes.flatMap((q, i) => [
    `### Quiz ${i + 1} · ${studioTime(resolveAnchor(timing, q.at))}`,
    block(
      [
        `Question: ${q.question}`,
        ...q.answers.map((a, k) => `${k === q.correct ? "✓" : " "} Answer ${k + 1}: ${a}`),
        ...(q.explanation ? [`Explanation: ${q.explanation}`] : []),
      ].join("\n"),
    ),
  ]);
  return [
    `# YouTube metadata: ${slug}`,
    "",
    "Generated by `pnpm youtube` from the lesson's `video/youtube.json` and the English timing. Edit the json, not this file.",
    "",
    "## English (original language)",
    "",
    "### Title",
    block(src.title.en),
    "### Description",
    block(description(src, timing, slug, "en", dubs)),
    "### Tags",
    block(src.tags.join(", ")),
    "",
    "## Tiếng Việt (Languages → Vietnamese → Title & description)",
    "",
    "### Title",
    block(src.title.vi),
    "### Description",
    block(description(src, timing, slug, "vi", dubs)),
    "",
    "## Quizzes (Studio → Đố vui / Quizzes)",
    "",
    "The time after each quiz number goes in Studio's time field (minutes:seconds:frames); ✓ marks the correct answer.",
    "",
    ...quizzes,
    "",
  ].join("\n");
}
