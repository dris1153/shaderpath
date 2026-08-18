import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import * as esbuild from "esbuild";
import ts from "typescript";
import type { Exercise } from "../content/types";

// Regenerates checkpoint reference images for the Three.js checkpoints by
// RUNNING each lesson's own solutionCode, the same contract as
// render-reference-shots.ts: the picture a learner compares against cannot
// drift from the answer the lesson teaches. Run by hand after editing a
// solution; not part of the build. Usage: pnpm gen:shots:three
//
// A vanilla solution needs no bundler: an import map resolves "three" and
// "three/addons/*" in the browser against the installed package, so stripping
// TypeScript is the only transform, and tsc is already a dependency.
//
// An R3F solution does need one, because React ships CommonJS and no browser
// can import that. Those go through esbuild, which also supplies the JSX
// transform. Only the two checkpoints that export a component containing
// their own <Canvas> qualify; the rest are fragments with no scene of their
// own, and inventing one would make the harness the author of the picture.

declare global {
  interface Window {
    __frames?: number;
  }
}

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");
const FIGURES_DIR = path.join(process.cwd(), "public", "figures");
const THREE_DIR = path.join(process.cwd(), "node_modules", "three");

interface ThreeShot {
  track: string;
  slug: string;
  width: number;
  height: number;
  /** Frames to let run before the screenshot. Stated in the caption. */
  frames: number;
  /** R3F solutions are bundled and mounted; vanilla ones run as plain modules. */
  react?: boolean;
  /**
   * Bare-relative imports the solution makes that do not resolve inside its own
   * lesson folder, mapped to the file that really holds them.
   */
  localModules?: Record<string, string>;
}

const THREE_SHOTS: ThreeShot[] = [
  // A still life composed left-to-right across x, so it wants a wide frame.
  // The camera drifts at t * 0.00012 rad/ms — 30 frames is under 4 degrees of
  // orbit, close enough to the canonical t=0 view to be reproducible.
  {
    track: "03-threejs",
    slug: "checkpoint-primitive-still-life",
    width: 640,
    height: 360,
    frames: 30,
  },
  // The solution imports "./embedded-color-cube-gltf", but that module lives in
  // the loading-gltf-draco-meshopt lesson, not beside the checkpoint.
  {
    track: "03-threejs",
    slug: "checkpoint-gltf-viewer",
    width: 640,
    height: 400,
    frames: 30,
    localModules: {
      "./embedded-color-cube-gltf": path.join(
        LESSONS_DIR,
        "03-threejs",
        "loading-gltf-draco-meshopt",
        "embedded-color-cube-gltf.ts",
      ),
    },
  },
  {
    track: "03-threejs",
    slug: "checkpoint-interactive-showroom",
    width: 640,
    height: 400,
    frames: 30,
  },
  // The only checkpoint outside track 03 that is a self-contained vanilla app;
  // every other remaining one is a React component, and most are fragments with
  // no Canvas of their own.
  {
    track: "12-performance",
    slug: "checkpoint-asset-diet",
    width: 640,
    height: 400,
    frames: 30,
  },

  // The two R3F checkpoints whose solution exports a component that mounts its
  // own <Canvas>, so the harness only has to render what the lesson wrote.
  // checkpoint-scene-rebuild-r3f looks like a third but is not: its Canvas
  // exists only inside a comment, so its default export is a bare scene graph.
  {
    track: "04-r3f",
    slug: "checkpoint-mini-configurator",
    width: 640,
    height: 400,
    frames: 40,
    react: true,
  },
  {
    track: "11-pbr",
    slug: "checkpoint-material-study",
    width: 640,
    height: 400,
    frames: 150,
    react: true,
  },
];

async function solutionOf(track: string, slug: string): Promise<string> {
  const file = path.join(LESSONS_DIR, track, slug, "exercises.ts");
  const { exercises } = (await import(pathToFileURL(file).href)) as {
    exercises: Exercise[];
  };
  const build = exercises.find((e) => e.kind === "build");
  if (!build?.solutionCode) {
    throw new Error(`${track}/${slug}: no build exercise with solutionCode`);
  }
  return build.solutionCode;
}

function toJs(source: string): string {
  return ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
}

const SCRATCH = path.join(process.cwd(), ".tmp-three-shots");

/**
 * Bundles an R3F solution together with a mount that renders the component the
 * lesson itself exports — the harness supplies the ReactDOM root and nothing
 * else about the picture.
 */
async function bundleReact(shot: ThreeShot, solution: string): Promise<string> {
  fs.mkdirSync(SCRATCH, { recursive: true });
  const solutionFile = path.join(SCRATCH, "solution.tsx");
  const entryFile = path.join(SCRATCH, "entry.tsx");
  fs.writeFileSync(solutionFile, solution);
  fs.writeFileSync(
    entryFile,
    `import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./solution";
createRoot(document.getElementById("root")!).render(createElement(App));
`,
  );
  try {
    const result = await esbuild.build({
      entryPoints: [entryFile],
      bundle: true,
      write: false,
      format: "esm",
      platform: "browser",
      target: "es2022",
      jsx: "automatic",
      // R3F reads NODE_ENV; without this the bundle references a bare `process`.
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    });
    const out = result.outputFiles[0]?.text;
    if (!out) throw new Error(`${shot.track}/${shot.slug}: esbuild produced no output`);
    return out;
  } finally {
    fs.rmSync(SCRATCH, { recursive: true, force: true });
  }
}

function pageHtml(shot: ThreeShot): string {
  // The solutions call setSize(canvas.clientWidth, clientHeight, false), so the
  // CSS box is what decides resolution — the width/height attributes only
  // matter until the first setSize. R3F sizes its canvas from the parent box
  // instead, so the react branch gives #root the same fixed size.
  const stage = shot.react
    ? `<div id="root"></div>`
    : `<canvas></canvas>`;
  const importMap = shot.react
    ? ""
    : `<script type="importmap">
{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}
</script>
`;
  return `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#000}#root,canvas{display:block;width:${shot.width}px;height:${shot.height}px}</style>
${importMap}${stage}
<script>
// Count frames so the screenshot lands on a stated frame rather than a stated
// wall-clock delay, which would vary with machine speed.
window.__frames = 0;
const _raf = window.requestAnimationFrame.bind(window);
window.requestAnimationFrame = (cb) => _raf((t) => { window.__frames++; return cb(t); });
</script>
<script type="module" src="/entry.js"></script>`;
}

function serve(shot: ThreeShot, entryJs: string): Promise<http.Server> {
  const locals = new Map<string, string>();
  for (const [specifier, file] of Object.entries(shot.localModules ?? {})) {
    locals.set(specifier.replace(/^\./, ""), toJs(fs.readFileSync(file, "utf8")));
  }

  const server = http.createServer((req, res) => {
    const url = (req.url ?? "/").split("?")[0] ?? "/";
    const js = (body: string) => {
      res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      res.end(body);
    };
    if (url === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(pageHtml(shot));
    }
    if (url === "/entry.js") return js(entryJs);
    const local = locals.get(url);
    if (local !== undefined) return js(local);
    if (url.startsWith("/three/")) {
      // Serving the package straight off disk keeps the addons' relative
      // imports (../utils/BufferGeometryUtils.js) working with no rewriting.
      const file = path.join(THREE_DIR, url.slice("/three/".length));
      if (file.startsWith(THREE_DIR) && fs.existsSync(file)) {
        return js(fs.readFileSync(file, "utf8"));
      }
    }
    res.writeHead(404).end("not found");
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function main() {
  const browser = await chromium.launch();

  for (const shot of THREE_SHOTS) {
    const solution = await solutionOf(shot.track, shot.slug);
    const entryJs = shot.react ? await bundleReact(shot, solution) : toJs(solution);
    const server = await serve(shot, entryJs);
    const { port } = server.address() as { port: number };
    // One page per shot, for the same reason the shader harness uses one: a
    // reused page can carry a previous solution's state into the next wait.
    const page = await browser.newPage({
      viewport: { width: shot.width + 40, height: shot.height + 40 },
      deviceScaleFactor: 1,
    });
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (m) => {
      if (m.type() === "error") pageErrors.push(m.text().split("\n")[0] ?? "");
    });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
      try {
        await page.waitForFunction(
          (n) => (window.__frames ?? 0) >= n,
          shot.frames,
          { timeout: 20_000 },
        );
      } catch {
        throw new Error(
          `${shot.track}/${shot.slug} never reached ${shot.frames} frames:\n${pageErrors.join("\n") || "no page error captured"}`,
        );
      }

      const canvas = page.locator("canvas");
      let png: Buffer;
      try {
        png = await canvas.screenshot({ timeout: 15_000 });
      } catch {
        // A React solution that throws during mount still lets the frame
        // counter run, so the missing canvas is the first visible symptom —
        // report what the page actually said instead of a bare timeout.
        throw new Error(
          `${shot.track}/${shot.slug}: no canvas after ${shot.frames} frames:\n${pageErrors.join("\n") || "no page error captured"}`,
        );
      }
      const spread = await page.evaluate(async (b64) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        if (!ctx) return -1;
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, c.width, c.height).data;
        let widest = 0;
        for (let channel = 0; channel < 3; channel++) {
          let lo = 255;
          let hi = 0;
          // Prime stride: sample the whole frame without aliasing against rows.
          for (let i = channel; i < px.length; i += 4 * 53) {
            const v = px[i] ?? 0;
            if (v < lo) lo = v;
            if (v > hi) hi = v;
          }
          widest = Math.max(widest, hi - lo);
        }
        return widest;
      }, png.toString("base64"));

      // Same guard as the shader harness: a flat frame means the solution drew
      // nothing, which a screenshot alone cannot tell from a dark scene.
      if (spread < 8) {
        const why = pageErrors.length > 0 ? [":", ...pageErrors].join("\n") : "";
        throw new Error(
          `${shot.track}/${shot.slug}: frame is flat (colour spread ${spread}) - the solution rendered nothing${why}`,
        );
      }
      if (pageErrors.length > 0) {
        throw new Error(`${shot.track}/${shot.slug} logged errors:\n${pageErrors.join("\n")}`);
      }

      const out = path.join(FIGURES_DIR, shot.track, `${shot.slug}.png`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, png);
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log(
        `${shot.track}/${shot.slug}.png  ${shot.width}x${shot.height}  frame ${shot.frames}  spread ${spread}  ${kb} KB`,
      );
    } finally {
      await page.close();
      server.close();
    }
  }

  await browser.close();
}

void main();
