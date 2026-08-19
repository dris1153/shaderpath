import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { LESSON_SLUGS } from "../content/slugs";

// Deterministic triage for the content accuracy audit. Complements
// lint-content.ts (which already covers figure-existence, heading parity and
// exercise structure) — nothing here duplicates it.
// Usage: pnpm audit:triage [--urls] [--glsl]
//   default: orphan SVGs, internal links, VI/EN parity (figures, fences, numbers)
//   --urls:  HTTP-check every external reference URL
//   --glsl:  compile every shader-exercise solution in headless WebGL2

const ROOT = process.cwd();
const LESSONS_DIR = path.join(ROOT, "content", "lessons");
const FIGURES_DIR = path.join(ROOT, "public", "figures");
const REPORT = path.join(
  ROOT, "plans", "260819-2103-content-accuracy-audit", "reports", "triage-report.md",
);
const VALID_SLUGS = new Set<string>(LESSON_SLUGS);

const findings = new Map<string, string[]>(); // track dir -> lines
function report(track: string, line: string) {
  if (!findings.has(track)) findings.set(track, []);
  findings.get(track)!.push(line);
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
}

const contentFiles = walk(LESSONS_DIR);
const trackOf = (f: string) =>
  path.relative(LESSONS_DIR, f).split(path.sep)[0] ?? "?";

// --- 1. orphan SVGs (disk -> refs direction; lint covers refs -> disk) ------
const referenced = new Set<string>();
for (const f of contentFiles) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/\/figures\/[^\s"'`)>]+/g)) {
    referenced.add(m[0].split("?")[0]!);
  }
}
for (const f of walk(FIGURES_DIR)) {
  const rel = "/" + path.relative(path.join(ROOT, "public"), f).replaceAll("\\", "/");
  if (!referenced.has(rel)) {
    report(rel.split("/")[2] ?? "?", `orphan figure: ${rel} referenced nowhere`);
  }
}

// --- 2. internal lesson links ----------------------------------------------
for (const f of contentFiles.filter((f) => f.endsWith(".mdx"))) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/\/lesson\/([a-z0-9-]+)/g)) {
    if (!VALID_SLUGS.has(m[1]!)) {
      report(trackOf(f), `${path.basename(path.dirname(f))}: dead lesson link /lesson/${m[1]}`);
    }
  }
}

// --- 3. VI/EN parity beyond headings ---------------------------------------
const figureList = (s: string) =>
  [...s.matchAll(/\/figures\/[^\s"'`)>]+/g)].map((m) => m[0]);
const fenceCount = (s: string) => (s.match(/^```/gm) ?? []).length;
// Locale-blind canonical form: VI groups thousands with "." and writes decimal
// commas, EN the other way round. Grouped integers lose their separators,
// decimal commas become dots, so only real value differences survive.
function canonical(token: string): string {
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(token)) return token.replace(/[.,]/g, "");
  return token.replace(",", ".");
}
// Single digits skipped: EN spells them as words ("three axes" vs "3 trục").
// Pre-passes: KaTeX decimal commas render as "1{,}32"; some prose groups
// thousands with (non-breaking) spaces.
const numbers = (s: string) =>
  (s
    .replace(/\{,\}/g, ",")
    .replace(/(\d)[   ](\d{3})(?!\d)/g, "$1$2")
    // Lookbehind kills alphanumeric identifiers ("a11y"), not units ("80px").
    .match(/(?<![a-zA-Z])\d+(?:[.,]\d+)*/g) ?? [])
    .map(canonical)
    .filter((t) => t.length >= 2)
    .sort();

for (const viPath of contentFiles.filter((f) => f.endsWith("theory.vi.mdx"))) {
  const enPath = viPath.replace("theory.vi.mdx", "theory.en.mdx");
  if (!fs.existsSync(enPath)) continue; // lint's problem
  const at = path.basename(path.dirname(viPath));
  const track = trackOf(viPath);
  const vi = fs.readFileSync(viPath, "utf8");
  const en = fs.readFileSync(enPath, "utf8");

  if (figureList(vi).join() !== figureList(en).join()) {
    report(track, `${at}: figure refs differ vi=[${figureList(vi)}] en=[${figureList(en)}]`);
  }
  if (fenceCount(vi) !== fenceCount(en)) {
    report(track, `${at}: code fences differ vi=${fenceCount(vi)} en=${fenceCount(en)}`);
  }
  const nv = numbers(vi);
  const ne = numbers(en);
  if (nv.join() !== ne.join()) {
    const only = (a: string[], b: string[]) => {
      const c = [...b]; // multiset difference
      return a.filter((x) => {
        const i = c.indexOf(x);
        if (i < 0) return true;
        c.splice(i, 1);
        return false;
      });
    };
    report(track, `${at}: numbers diverge vi-only=[${only(nv, ne)}] en-only=[${only(ne, nv)}]`);
  }
}

// --- 4. --urls: external reference URLs ------------------------------------
async function checkUrls() {
  const urls = new Map<string, string[]>(); // url -> lessons
  for (const f of contentFiles.filter((f) => f.endsWith("references.ts"))) {
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(/https?:\/\/[^\s"'`]+/g)) {
      const u = m[0].replace(/[.,]$/, "");
      if (!urls.has(u)) urls.set(u, []);
      urls.get(u)!.push(`${trackOf(f)}/${path.basename(path.dirname(f))}`);
    }
  }
  const entries = [...urls.entries()];
  console.log(`checking ${entries.length} unique URLs...`);
  let done = 0;
  const probe = async (url: string): Promise<string> => {
    for (const method of ["HEAD", "GET"]) {
      try {
        const res = await fetch(url, {
          method,
          redirect: "follow",
          signal: AbortSignal.timeout(12000),
        });
        if (res.ok) return "ok";
        if ([403, 405, 429, 503].includes(res.status)) {
          if (method === "GET") return `manual (${res.status})`;
          continue; // some hosts reject HEAD; retry with GET
        }
        if (method === "GET") return `broken (${res.status})`;
      } catch {
        if (method === "GET") return "manual (network/timeout)";
      }
    }
    return "manual (unreachable)";
  };
  const queue = [...entries];
  const results = new Map<string, string>();
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let e = queue.shift(); e; e = queue.shift()) {
        results.set(e[0], await probe(e[0]));
        done += 1;
        if (done % 50 === 0) console.log(`  ${done}/${entries.length}`);
      }
    }),
  );
  for (const [url, verdict] of results) {
    if (verdict === "ok") continue;
    for (const lesson of urls.get(url)!) {
      const [track, slug] = lesson.split("/");
      report(track!, `${slug}: URL ${verdict}: ${url}`);
    }
  }
}

// --- 5. --glsl: compile shader-exercise solutions in headless WebGL2 --------
async function checkGlsl() {
  const { chromium } = await import("@playwright/test");
  const { assembleFragment, FULLSCREEN_VERT } = await import("../lib/glsl/assemble");
  const cases: { at: string; track: string; id: string; frag: string }[] = [];
  for (const f of contentFiles.filter((f) => f.endsWith("exercises.ts"))) {
    const mod = (await import(pathToFileURL(f).href)) as {
      exercises?: { kind: string; id: string; solutionCode?: string }[];
    };
    for (const ex of mod.exercises ?? []) {
      if (ex.kind === "shader" && ex.solutionCode) {
        cases.push({
          at: path.basename(path.dirname(f)),
          track: trackOf(f),
          id: ex.id,
          frag: assembleFragment(ex.solutionCode),
        });
      }
    }
  }
  console.log(`compiling ${cases.length} shader solutions...`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // A string, not a closure: tsx/esbuild injects __name helpers into
  // transpiled closures, and those don't exist inside the page. The string is
  // wrapped into a self-calling expression below — evaluate() does NOT call a
  // bare function-expression string (measured: every case returned undefined,
  // which read as "compiles" for arbitrarily broken shaders).
  const compileInPage = `([vs, fsrc]) => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const mk = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS)
        ? s : (gl.getShaderInfoLog(s) || "compile failed");
    };
    const v = mk(gl.VERTEX_SHADER, vs);
    if (typeof v === "string") return "vert: " + v;
    const f = mk(gl.FRAGMENT_SHADER, fsrc);
    if (typeof f === "string") return "frag: " + f;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS)
      ? null : "link: " + gl.getProgramInfoLog(p);
  }`;
  for (const c of cases) {
    const expr = `(${compileInPage})(${JSON.stringify([FULLSCREEN_VERT, c.frag])})`;
    const log = (await page.evaluate(expr)) as string | null;
    if (log) {
      // GL info logs end in NUL on some drivers, which turns the report binary.
      const clean = log.replace(/[ --]/g, "").trim();
      report(c.track, `${c.at}/${c.id}: solution does not compile — ${clean}`);
    }
  }
  await browser.close();
}

// --- report -----------------------------------------------------------------
async function main() {
  const flags = process.argv.slice(2);
  if (flags.includes("--urls")) await checkUrls();
  if (flags.includes("--glsl")) await checkGlsl();

  const tracks = [...findings.keys()].sort();
  const total = tracks.reduce((n, t) => n + findings.get(t)!.length, 0);
  const lines = [
    "# Triage report (generated by pnpm audit:triage)",
    "",
    `Run: ${flags.join(" ") || "(offline checks only)"} — ${total} findings.`,
    "MDX GLSL fences are NOT compiled: they are illustrative fragments by design.",
    "",
  ];
  for (const t of tracks) {
    lines.push(`## ${t}`, "", ...findings.get(t)!.map((l) => `- ${l}`), "");
  }
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, lines.join("\n"));
  console.log(`${total} findings -> ${path.relative(ROOT, REPORT)}`);
}
void main();
