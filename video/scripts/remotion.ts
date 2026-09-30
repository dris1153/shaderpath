import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, selectComposition, type ChromiumOptions } from "@remotion/renderer";

export const ROOT = path.resolve(import.meta.dirname, "..");

// remotion.config.ts only reaches Studio and the Remotion CLI. Settings the
// scripts need (e.g. gl: "angle" once scenes use WebGL) go here instead.
export const CHROMIUM: ChromiumOptions = {};

export function parseArgs(usage: string, required: number) {
  const args = process.argv.slice(2);
  if (args.length < required) {
    console.error(`usage: ${usage}`);
    process.exit(1);
  }
  return args;
}

export function outDir(slug: string, locale: string) {
  return path.join(ROOT, "out", slug, locale);
}

export function generatedDir(slug: string, locale: string) {
  return path.join(ROOT, "public", "generated", slug, locale);
}

// A lesson's script and strings live with the lesson in content/; pipeline
// fixtures (dummy, style) keep theirs next to their scene code.
export function lessonSource(slug: string) {
  const lessons = path.join(ROOT, "..", "content", "lessons");
  for (const track of fs.readdirSync(lessons)) {
    const dir = path.join(lessons, track, slug, "video");
    if (fs.existsSync(dir)) return dir;
  }
  const fixture = path.join(ROOT, "src", "lessons", slug);
  if (fs.existsSync(fixture)) return fixture;
  throw new Error(`no video sources for "${slug}" (content/lessons/*/${slug}/video/)`);
}

// Remotion ships its own ffmpeg, so a system install is not a prerequisite.
export function ffmpeg(args: string[]) {
  const cli = path.join(ROOT, "node_modules", "@remotion", "cli", "remotion-cli.js");
  execFileSync(process.execPath, [cli, "ffmpeg", ...args], { stdio: "inherit" });
}

// One bundle and one browser per command. The bundle is a temp copy of all of
// public/ (every voice track), so it is always removed afterwards.
export async function withComposition<T>(
  slug: string,
  locale: string,
  fn: (ctx: Awaited<ReturnType<typeof open>>) => Promise<T>,
  props: Record<string, unknown> = {},
): Promise<T> {
  const ctx = await open(slug, locale, props);
  try {
    return await fn(ctx);
  } finally {
    await ctx.browser.close({ silent: true });
    fs.rmSync(ctx.serveUrl, { recursive: true, force: true });
  }
}

async function open(slug: string, locale: string, props: Record<string, unknown>) {
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts") });
  const browser = await openBrowser("chrome", { chromiumOptions: CHROMIUM });
  const inputProps = { locale, ...props };
  try {
    const composition = await selectComposition({
      serveUrl,
      id: slug,
      inputProps,
      puppeteerInstance: browser,
      chromiumOptions: CHROMIUM,
    });
    return { serveUrl, browser, composition, inputProps };
  } catch (error) {
    await browser.close({ silent: true });
    fs.rmSync(serveUrl, { recursive: true, force: true });
    throw error;
  }
}
