import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { FRAG_PRELUDE, FULLSCREEN_VERT } from "../lib/glsl/assemble";
import type { Exercise } from "../content/types";

// Regenerates checkpoint reference images by RUNNING each lesson's own
// solutionCode, so the picture a learner compares against cannot drift from the
// answer the lesson teaches. Run by hand after editing a solution; not part of
// the build. Usage: pnpm gen:shots
//
// The prelude and fullscreen triangle are imported from the playground's own
// module rather than copied, so a shader that renders here renders identically
// in the app.

declare global {
  interface Window {
    __rendered?: boolean;
    __spread?: number;
    __png?: string;
  }
}

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");
const FIGURES_DIR = path.join(process.cwd(), "public", "figures");

interface ShaderShot {
  track: string;
  slug: string;
  width: number;
  height: number;
  /** uTime in seconds. 0 is each solution's canonical, unshifted frame. */
  time: number;
}

const SHADER_SHOTS: ShaderShot[] = [
  { track: "02-glsl", slug: "checkpoint-gradient-palette", width: 640, height: 360, time: 0 },
  // The 6x6 grid divides uv on both axes, so a non-square canvas stretches every
  // cell and sdCircle renders as an ellipse. This poster is only honest at 1:1.
  { track: "02-glsl", slug: "checkpoint-pattern-tile-poster", width: 512, height: 512, time: 0 },
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

function harnessHtml(shot: ShaderShot, fragment: string): string {
  return `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#000}canvas{display:block}</style>
<canvas id="c" width="${shot.width}" height="${shot.height}"></canvas>
<script>
const FRAG = ${JSON.stringify(FRAG_PRELUDE + fragment)};
const VERT = ${JSON.stringify(FULLSCREEN_VERT)};
// preserveDrawingBuffer matters here and nowhere else in the app: this renders a
// single frame with no RAF loop, so without it the buffer is discarded after
// presentation and the screenshot comes back black.
const gl = document.getElementById("c").getContext("webgl2", {
  antialias: false,
  preserveDrawingBuffer: true,
});
if (!gl) throw new Error("WebGL2 unavailable");

function compile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || "compile failed");
  }
  return sh;
}

const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program) || "link failed");
}
gl.useProgram(program);

gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

gl.viewport(0, 0, ${shot.width}, ${shot.height});
gl.uniform1f(gl.getUniformLocation(program, "uTime"), ${shot.time});
gl.uniform2f(gl.getUniformLocation(program, "uResolution"), ${shot.width}, ${shot.height});
gl.uniform2f(gl.getUniformLocation(program, "uMouse"), 0.5, 0.5);
gl.drawArrays(gl.TRIANGLES, 0, 3);
gl.finish();

// Read the frame back and report its colour spread. A flat frame means the
// shader drew nothing useful, which a screenshot alone cannot distinguish from
// a legitimately dark render.
const px = new Uint8Array(${shot.width} * ${shot.height} * 4);
gl.readPixels(0, 0, ${shot.width}, ${shot.height}, gl.RGBA, gl.UNSIGNED_BYTE, px);
let spread = 0;
for (let c = 0; c < 3; c++) {
  let lo = 255, hi = 0;
  for (let i = c; i < px.length; i += 4 * 97) {
    if (px[i] < lo) lo = px[i];
    if (px[i] > hi) hi = px[i];
  }
  spread = Math.max(spread, hi - lo);
}
window.__spread = spread;
// Encode straight from the preserved drawing buffer instead of screenshotting
// the composited page: same task as the draw, so nothing can reclaim the buffer
// in between, and the result is the exact pixels the shader produced.
window.__png = document.getElementById("c").toDataURL("image/png");
window.__rendered = true;
</script>`;
}

async function main() {
  const browser = await chromium.launch();

  for (const shot of SHADER_SHOTS) {
    const fragment = await solutionOf(shot.track, shot.slug);
    // One page per shot. Reusing a page let a stale __rendered flag from the
    // previous shader satisfy the wait, so a failing shader silently inherited
    // its predecessor's image.
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    // A shader that fails to compile must not quietly produce a wrong reference
    // image — the harness only sets __rendered after a successful draw, so a
    // compile failure surfaces here as the GLSL log rather than as a timeout.
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    await page.setContent(harnessHtml(shot, fragment));
    try {
      await page.waitForFunction(() => window.__rendered === true, null, {
        timeout: 15_000,
      });
    } catch {
      throw new Error(
        `${shot.track}/${shot.slug} never rendered:\n${pageErrors.join("\n") || "no page error captured"}`,
      );
    }
    const spread = (await page.evaluate(() => window.__spread ?? 0)) as number;
    if (spread < 8) {
      throw new Error(
        `${shot.track}/${shot.slug}: frame is flat (colour spread ${spread}) - the shader rendered nothing`,
      );
    }

    const dataUrl = await page.evaluate(() => window.__png ?? "");
    const base64 = dataUrl.split(",")[1];
    if (!base64) throw new Error(`${shot.track}/${shot.slug}: no PNG produced`);

    const out = path.join(FIGURES_DIR, shot.track, `${shot.slug}.png`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(base64, "base64"));
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(
      `${shot.track}/${shot.slug}.png  ${shot.width}x${shot.height}  spread ${spread}  ${kb} KB`,
    );
    await page.close();
  }

  await browser.close();
}

void main();
