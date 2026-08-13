import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { LESSONS } from "../content/curriculum";
import type { Citation, Exercise } from "../content/types";

// A3: mechanical gate for the content rules (spec §3.2/§10/§11, amended by D9).
// Usage: pnpm lint:content [--require math,webgl]
//   --require: every curriculum lesson of those tracks MUST have a folder;
//   lessons of other tracks are checked but only warn (future work).

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");
const requireArg = process.argv.find((a) => a.startsWith("--require"));
const requiredTracks = requireArg
  ? (
      requireArg.split("=")[1] ??
      process.argv[process.argv.indexOf(requireArg) + 1] ??
      ""
    )
      .split(",")
      .filter(Boolean)
  : [];

const errors: string[] = [];
const warnings: string[] = [];

function stripFences(src: string): string {
  return src.replace(/^```[\s\S]*?^```/gm, "");
}

function headingTree(src: string): string[] {
  return stripFences(src)
    .split("\n")
    .map((l) => /^(#{2,4})\s/.exec(l)?.[1])
    .filter((h): h is string => h !== undefined);
}

function wordCount(src: string): number {
  return stripFences(src)
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

async function lintLesson(trackDir: string, slug: string) {
  const at = `${trackDir}/${slug}`;
  const dir = path.join(LESSONS_DIR, trackDir, slug);
  const meta = LESSONS.find((l) => l.slug === slug);
  if (!meta) {
    errors.push(`${at}: folder has no curriculum entry (slug typo?)`);
    return;
  }
  const isCheckpoint = meta.kind === "checkpoint";
  // Lessons of tracks outside --require are future work: warn, don't block
  const strict =
    requiredTracks.length === 0 || requiredTracks.includes(meta.trackId);
  const report = (msg: string) => (strict ? errors : warnings).push(msg);

  // --- theory ---------------------------------------------------------
  const viPath = path.join(dir, "theory.vi.mdx");
  const enPath = path.join(dir, "theory.en.mdx");
  const viExists = fs.existsSync(viPath);
  const enExists = fs.existsSync(enPath);
  if (!viExists) report(`${at}: missing theory.vi.mdx`);
  if (!enExists) report(`${at}: missing theory.en.mdx`);

  if (viExists && enExists) {
    const vi = fs.readFileSync(viPath, "utf8");
    const en = fs.readFileSync(enPath, "utf8");

    for (const [name, src] of [
      ["vi", vi],
      ["en", en],
    ] as const) {
      if (/^#\s/m.test(stripFences(src))) {
        report(
          `${at}: theory.${name} uses an h1 - start at ## (the page renders the title)`,
        );
      }
    }

    const viTree = headingTree(vi);
    const enTree = headingTree(en);
    if (viTree.join(",") !== enTree.join(",")) {
      report(
        `${at}: heading trees differ (vi: ${viTree.join(",") || "none"} vs en: ${enTree.join(",") || "none"}) - spec 3.2 requires identical structure`,
      );
    }

    if (!isCheckpoint) {
      if (!/<Callout\s+variant="mistake"/.test(vi)) {
        report(`${at}: theory.vi missing the mistake Callout (spec 10)`);
      }
      if (!/<Callout\s+variant="mistake"/.test(en)) {
        report(`${at}: theory.en missing the mistake Callout (spec 10)`);
      }
      for (const [name, src] of [
        ["vi", vi],
        ["en", en],
      ] as const) {
        const words = wordCount(src);
        if (words < 300) {
          warnings.push(`${at}: theory.${name} is thin (${words} words)`);
        }
        if (words > 1500) {
          warnings.push(
            `${at}: theory.${name} is long (${words} words; guideline <=1200)`,
          );
        }
      }
    }
  }

  // --- references (regular lessons only; optional for checkpoints) ----
  const refsPath = path.join(dir, "references.ts");
  if (!isCheckpoint) {
    if (!fs.existsSync(refsPath)) {
      report(`${at}: missing references.ts`);
    } else {
      const { references } = (await import(pathToFileURL(refsPath).href)) as {
        references: Citation[];
      };
      const withUrl = references.filter(
        (r) => r.url && r.url.startsWith("http"),
      );
      if (withUrl.length < 2) {
        report(
          `${at}: needs >=2 citations with verifiable URLs (has ${withUrl.length})`,
        );
      }
      const ids = new Set(references.map((r) => r.id));
      if (ids.size !== references.length) {
        report(`${at}: duplicate citation ids`);
      }
    }
  }

  // --- exercises ------------------------------------------------------
  const exPath = path.join(dir, "exercises.ts");
  if (!fs.existsSync(exPath)) {
    report(`${at}: missing exercises.ts`);
  } else {
    const { exercises } = (await import(pathToFileURL(exPath).href)) as {
      exercises: Exercise[];
    };
    const kinds = new Set(exercises.map((e) => e.kind));
    if (isCheckpoint) {
      if (!kinds.has("build")) {
        report(`${at}: checkpoint needs a build exercise (D9)`);
      }
    } else {
      if (exercises.length < 2) {
        report(`${at}: regular lesson needs >=2 exercises (D9)`);
      }
      if (!kinds.has("concept")) {
        report(`${at}: missing a concept exercise (D9)`);
      }
      if (!kinds.has("code") && !kinds.has("shader")) {
        report(`${at}: missing a code/shader exercise (D9)`);
      }
    }
    const ids = new Set<string>();
    for (const ex of exercises) {
      if (ids.has(ex.id)) report(`${at}: duplicate exercise id "${ex.id}"`);
      ids.add(ex.id);
      if (ex.hints.length < 1) report(`${at}/${ex.id}: needs >=1 hint`);
      const minChecklist = ex.kind === "build" ? 3 : 1;
      if (ex.checklist.length < minChecklist) {
        report(`${at}/${ex.id}: needs >=${minChecklist} checklist items`);
      }
      for (const loc of ["vi", "en"] as const) {
        if (!ex.prompt[loc]?.trim()) {
          report(`${at}/${ex.id}: empty ${loc} prompt`);
        }
      }
    }
  }

  // --- demo <-> metadata ----------------------------------------------
  const hasDemoFile = fs.existsSync(path.join(dir, "demo.tsx"));
  if (meta.hasDemo && !hasDemoFile) {
    report(`${at}: curriculum says hasDemo but demo.tsx is missing`);
  }
  if (!meta.hasDemo && hasDemoFile) {
    warnings.push(`${at}: demo.tsx exists but curriculum hasDemo=false`);
  }
}

async function main() {
  const foundSlugs = new Set<string>();
  if (fs.existsSync(LESSONS_DIR)) {
    for (const trackDir of fs.readdirSync(LESSONS_DIR).sort()) {
      const trackPath = path.join(LESSONS_DIR, trackDir);
      if (!fs.statSync(trackPath).isDirectory() || trackDir.startsWith("_")) {
        continue;
      }
      for (const slug of fs.readdirSync(trackPath).sort()) {
        if (!fs.statSync(path.join(trackPath, slug)).isDirectory()) continue;
        foundSlugs.add(slug);
        await lintLesson(trackDir, slug);
      }
    }
  }

  for (const trackId of requiredTracks) {
    for (const lesson of LESSONS.filter((l) => l.trackId === trackId)) {
      if (!foundSlugs.has(lesson.slug)) {
        errors.push(
          `track ${trackId}: lesson "${lesson.slug}" has no content folder`,
        );
      }
    }
  }

  for (const w of warnings) console.warn(`WARN  ${w}`);
  for (const e of errors) console.error(`ERROR ${e}`);
  console.log(
    `\ncontent lint: ${foundSlugs.size} lessons checked, ${errors.length} errors, ${warnings.length} warnings`,
  );
  if (errors.length > 0) process.exit(1);
}

void main();
