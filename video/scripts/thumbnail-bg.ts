import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs, parseEnv } from "node:util";
import { finalsDir, mirrorThumbnails, nextThumbnailNumber } from "./lesson-assets";
import { ffmpeg, lessonSource, ROOT } from "./remotion";
import { readYoutubeSource, type YoutubeSource } from "./youtube-meta";

// pnpm thumbnail-bg <slug> [--variants 2]
// Generates thumbnail backgrounds with gpt-image-2: the lesson's
// video/youtube.json `thumbnail.background` motif inside the house style, cropped
// to 1280×720 as public/generated/<slug>/thumbnail-bg-<n>.png (a gitignored cache),
// mirrored into the lesson's content/.../youtube/thumbnail-src/.
// New variants are numbered after the existing ones, so a chosen background is
// never overwritten. Then run pnpm thumbnail <slug>.
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { variants: { type: "string", default: "2" } },
});
const [slug] = positionals;
const variants = Number(values.variants);
if (!slug || !Number.isInteger(variants) || variants < 1 || variants > 4) {
  console.error("usage: pnpm thumbnail-bg <slug> [--variants 1-4]");
  process.exit(1);
}

const sourceFile = path.join(lessonSource(slug), "youtube.json");
const motif = fs.existsSync(sourceFile)
  ? (readYoutubeSource(sourceFile) as Partial<YoutubeSource>).thumbnail?.background
  : undefined;
if (!motif) throw new Error(`set thumbnail.background (the decoration motif) in ${sourceFile}`);

// Only OPENAI_API_KEY is taken: from the environment, the repo's .env.local, or
// (user-approved fallback) ~/.claude/.env. Nothing else from those files enters
// this process, and the key never appears in output.
const keyFrom = (file: string) => (fs.existsSync(file) ? parseEnv(fs.readFileSync(file, "utf8")).OPENAI_API_KEY : undefined);
const key =
  process.env.OPENAI_API_KEY || keyFrom(path.join(ROOT, "..", ".env.local")) || keyFrom(path.join(os.homedir(), ".claude", ".env"));
// A key with spaces or control characters would make fetch throw with the header (and key) in the message.
if (!key || !/^[\x21-\x7e]+$/.test(key)) throw new Error("OPENAI_API_KEY is missing or malformed (repo .env.local or ~/.claude/.env)");
const redact = (text: string) => text.split(key).join("[key]").replace(/sk-[\w*-]{4,}/g, "sk-…");

// The house style matches the video kit (kit/palette.ts PAPER) and leaves room
// for the title (left) and Inko (right).
const prompt = [
  "Flat vector illustration used as the background of an educational YouTube thumbnail about computer graphics.",
  "Warm cream paper background (#FBF5E9) with a subtle, even dot grid.",
  `Decorations only near the edges and corners: ${motif}; small four-point sparkles and soft confetti dots.`,
  "Palette: coral #FF6B57, sunny yellow #FFC23D, sky blue #4DA3FF, mint #3CCFB4, dark navy #26213A outlines.",
  "Bold clean dark-navy outlines, cheerful modern cartoon style, lots of breathing room.",
  "Keep the whole left half and the right-center area as calm, mostly empty cream space: a title and a mascot will be placed there later.",
  "Absolutely no text, letters, numbers, logos, characters, mascots, animals or people.",
].join(" ");

const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gpt-image-2", prompt, size: "1536x1024", quality: "high", n: variants, output_format: "png" }),
  signal: AbortSignal.timeout(300_000),
});
const body = await res.text();
let json: { data?: { b64_json: string }[]; error?: { message?: string } } = {};
try {
  json = JSON.parse(body);
} catch {
  // A gateway error page is not JSON; the status and a slice of it are enough.
}
if (!res.ok || !json.data) {
  throw new Error(`gpt-image-2: HTTP ${res.status} ${redact(json.error?.message ?? body.slice(0, 200))}`);
}

const dir = path.join(ROOT, "public", "generated", slug);
fs.mkdirSync(dir, { recursive: true });
const finals = finalsDir(slug);
const first = nextThumbnailNumber(dir, finals && path.join(finals, "thumbnail-src"));
json.data.forEach((image, i) => {
  const n = first + i;
  const raw = path.join(dir, `thumbnail-bg-raw-${n}.png`);
  const out = path.join(dir, `thumbnail-bg-${n}.png`);
  fs.writeFileSync(raw, Buffer.from(image.b64_json, "base64"));
  // 3:2 → 16:9: keep the full width, trim the top and bottom bands evenly.
  ffmpeg(["-y", "-loglevel", "error", "-i", raw, "-vf", "crop=1536:864:0:80,scale=1280:720:flags=lanczos", out]);
  console.log(path.relative(process.cwd(), out));
});
// The backgrounds are paid for: keep them in the repo next to the lesson, not only in the gitignored cache.
if (finals) mirrorThumbnails(dir, path.join(finals, "thumbnail-src"));
