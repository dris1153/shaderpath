"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./texture-quad.frag";
import vertexSource from "./texture-quad.vert";

const LABELS = {
  vi: {
    title: "Texture: filter, wrap & UV scale",
    filter: "Filter",
    wrap: "Wrap mode",
    uvScale: "UV scale",
    filterNearest: "Nearest",
    filterLinear: "Linear",
    filterMipmap: "Mipmap (trilinear)",
    wrapRepeat: "Repeat",
    wrapClamp: "Clamp to edge",
    wrapMirror: "Mirrored repeat",
  },
  en: {
    title: "Textures: Filtering, Wrapping & UV Scale",
    filter: "Filter",
    wrap: "Wrap mode",
    uvScale: "UV scale",
    filterNearest: "Nearest",
    filterLinear: "Linear",
    filterMipmap: "Mipmap (trilinear)",
    wrapRepeat: "Repeat",
    wrapClamp: "Clamp to edge",
    wrapMirror: "Mirrored repeat",
  },
} as const;

const TEXTURE_SIZE = 128;
const CHECKER_TILE = 8;

// Procedural checker + gradient: checker shows tiling/minification, the
// per-channel gradient shows filter smoothness (D8 demo idea).
function buildCheckerGradientPixels(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const checkerOn =
        (Math.floor(x / CHECKER_TILE) + Math.floor(y / CHECKER_TILE)) % 2 ===
        0;
      const base = checkerOn ? 235 : 30;
      const gx = x / (size - 1);
      const gy = y / (size - 1);
      data[i] = Math.round(base * (0.35 + 0.65 * gx));
      data[i + 1] = Math.round(base * (0.35 + 0.65 * gy));
      data[i + 2] = Math.round(base * 0.75);
      data[i + 3] = 255;
    }
  }
  return data;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("createShader failed");
  gl.shaderSource(shader, source.trim());
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

// MIN vs MAG filter, and the mipmap chain — the min filter is the only one
// that can be a MIPMAP-suffixed constant (spec §10 mistake #2).
function applyFilter(gl: WebGL2RenderingContext, filter: string) {
  const min =
    filter === "nearest"
      ? gl.NEAREST
      : filter === "linear"
        ? gl.LINEAR
        : gl.LINEAR_MIPMAP_LINEAR;
  const mag = filter === "nearest" ? gl.NEAREST : gl.LINEAR;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag);
  if (filter === "mipmap") gl.generateMipmap(gl.TEXTURE_2D);
}

function applyWrap(gl: WebGL2RenderingContext, wrap: string) {
  const mode =
    wrap === "repeat"
      ? gl.REPEAT
      : wrap === "clamp"
        ? gl.CLAMP_TO_EDGE
        : gl.MIRRORED_REPEAT;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mode);
}

interface GlState {
  gl: WebGL2RenderingContext;
  uUvScale: WebGLUniformLocation | null;
  lastFilter: string;
  lastWrap: string;
}

// The non-R3F path: proves the upload/sampling pipeline with a plain
// <canvas>. Cleanup via useDisposable (§8.2), loop via useVisibleRaf (§8.3).
function RawTextureQuad() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ filter: "mipmap", wrap: "repeat", uvScale: 4 });

  useEffect(() => {
    paramsRef.current.filter = stringOf(values, "filter", "mipmap");
    paramsRef.current.wrap = stringOf(values, "wrap", "repeat");
    paramsRef.current.uvScale = numberOf(values, "uvScale", 4);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");

    const vs = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error("createProgram failed");
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
    }

    // x, y, u, v — a quad from two triangles
    // prettier-ignore
    const data = new Float32Array([
      -0.85, -0.85, 0, 0,
       0.85, -0.85, 1, 0,
       0.85,  0.85, 1, 1,
      -0.85, -0.85, 0, 0,
       0.85,  0.85, 1, 1,
      -0.85,  0.85, 0, 1,
    ]);
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aUV = gl.getAttribLocation(program, "aUV");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8);

    // Upload path: createTexture -> bind -> texImage2D from raw pixels.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      buildCheckerGradientPixels(TEXTURE_SIZE),
    );
    applyFilter(gl, paramsRef.current.filter);
    applyWrap(gl, paramsRef.current.wrap);

    gl.useProgram(program);
    // Texture unit wiring: activeTexture picks the unit, bindTexture attaches
    // the texture to it, uniform1i tells the sampler WHICH unit to read —
    // three separate calls, the classic point of confusion (spec §10).
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);

    stateRef.current = {
      gl,
      uUvScale: gl.getUniformLocation(program, "uUVScale"),
      lastFilter: paramsRef.current.filter,
      lastWrap: paramsRef.current.wrap,
    };

    disposables.registerFn(() => {
      stateRef.current = null;
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      // No loseContext() here: Strict Mode remounts reuse the SAME canvas, and
      // a lost context can never be recreated on it. The browser reclaims the
      // context when the canvas leaves the DOM.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, () => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;
    const { gl } = st;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    const { filter, wrap, uvScale } = paramsRef.current;
    if (filter !== st.lastFilter) {
      applyFilter(gl, filter);
      st.lastFilter = filter;
    }
    if (wrap !== st.lastWrap) {
      applyWrap(gl, wrap);
      st.lastWrap = wrap;
    }

    gl.clearColor(0.06, 0.07, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(st.uUvScale, uvScale);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function TexturesUploadAndSamplingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "filter",
          label: L.filter,
          defaultValue: "mipmap",
          options: [
            { value: "nearest", label: L.filterNearest },
            { value: "linear", label: L.filterLinear },
            { value: "mipmap", label: L.filterMipmap },
          ],
        },
        {
          kind: "select",
          key: "wrap",
          label: L.wrap,
          defaultValue: "repeat",
          options: [
            { value: "repeat", label: L.wrapRepeat },
            { value: "clamp", label: L.wrapClamp },
            { value: "mirror", label: L.wrapMirror },
          ],
        },
        {
          kind: "number",
          key: "uvScale",
          label: L.uvScale,
          min: 1,
          max: 16,
          step: 1,
          defaultValue: 4,
        },
      ]}
    >
      <RawTextureQuad />
    </Demo>
  );
}
