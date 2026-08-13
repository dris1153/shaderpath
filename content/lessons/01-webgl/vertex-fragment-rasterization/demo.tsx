"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./gradient-triangle.frag";
import vertexSource from "./gradient-triangle.vert";

const LABELS = {
  vi: {
    title: "Tam giác gradient — kéo một đỉnh",
    ax: "Đỉnh A: x",
    ay: "Đỉnh A: y",
    vertexCount: "Vertex shader chạy",
    fragmentCount: "Fragment shader chạy (ước lượng)",
  },
  en: {
    title: "Gradient Triangle — drag one vertex",
    ax: "Vertex A: x",
    ay: "Vertex A: y",
    vertexCount: "Vertex shader runs",
    fragmentCount: "Fragment shader runs (estimate)",
  },
} as const;

// B and C stay fixed; only A moves. x, y, r, g, b per vertex — 20 bytes/vertex.
const VERT_B = { x: -0.6, y: -0.55, r: 0.35, g: 1.0, b: 0.35 };
const VERT_C = { x: 0.6, y: -0.55, r: 0.35, g: 0.45, b: 1.0 };
const COLOR_A = { r: 1.0, g: 0.35, b: 0.35 };
const STRIDE_BYTES = 20;

function buildData(ax: number, ay: number): Float32Array {
  return new Float32Array([
    ax, ay, COLOR_A.r, COLOR_A.g, COLOR_A.b,
    VERT_B.x, VERT_B.y, VERT_B.r, VERT_B.g, VERT_B.b,
    VERT_C.x, VERT_C.y, VERT_C.r, VERT_C.g, VERT_C.b,
  ]);
}

// Barycentric-area estimate of covered fragments, in device pixels.
function toScreen(x: number, y: number, w: number, h: number) {
  return { sx: (x * 0.5 + 0.5) * w, sy: (1 - (y * 0.5 + 0.5)) * h };
}
function triangleAreaPx(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  w: number,
  h: number,
) {
  const A = toScreen(a.x, a.y, w, h);
  const B = toScreen(b.x, b.y, w, h);
  const C = toScreen(c.x, c.y, w, h);
  return (
    Math.abs(A.sx * (B.sy - C.sy) + B.sx * (C.sy - A.sy) + C.sx * (A.sy - B.sy)) / 2
  );
}

interface GlState {
  gl: WebGL2RenderingContext;
  buffer: WebGLBuffer;
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

// aPosition lives in a DYNAMIC_DRAW buffer re-uploaded every frame — moving a
// slider moves real vertex data, not a uniform, so rasterization visibly
// recomputes from scratch each time (§ vertex vs fragment call counts).
function GradientTriangle() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fragmentCountRef = useRef<HTMLSpanElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ ax: 0, ay: 0.7 });

  useEffect(() => {
    paramsRef.current.ax = numberOf(values, "ax", 0);
    paramsRef.current.ay = numberOf(values, "ay", 0.7);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");

    const vs = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
    }

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("createBuffer failed");
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Written every frame below — DYNAMIC_DRAW is the honest usage hint here.
    gl.bufferData(
      gl.ARRAY_BUFFER,
      buildData(paramsRef.current.ax, paramsRef.current.ay),
      gl.DYNAMIC_DRAW,
    );
    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aColor = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, STRIDE_BYTES, 0);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE_BYTES, 8);

    gl.useProgram(program);
    stateRef.current = { gl, buffer };

    disposables.registerFn(() => {
      stateRef.current = null;
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      // No loseContext(): Strict Mode remounts reuse the SAME canvas.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, () => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;
    const { gl, buffer } = st;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    const { ax, ay } = paramsRef.current;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buildData(ax, ay), gl.DYNAMIC_DRAW);

    gl.clearColor(0.06, 0.07, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const area = triangleAreaPx({ x: ax, y: ay }, VERT_B, VERT_C, w, h);
    if (fragmentCountRef.current) {
      fragmentCountRef.current.textContent = Math.round(area).toLocaleString();
    }
  });

  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <div className="flex size-full flex-col">
      <canvas ref={canvasRef} className="w-full flex-1" />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t bg-background/60 px-2 py-1 font-mono text-[11px] sm:text-xs">
        <span>{L.vertexCount}: 3</span>
        <span>
          {L.fragmentCount}: <span ref={fragmentCountRef}>0</span>
        </span>
      </div>
    </div>
  );
}

export default function VertexFragmentRasterizationDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "number", key: "ax", label: L.ax, min: -1, max: 1, step: 0.01, defaultValue: 0 },
        { kind: "number", key: "ay", label: L.ay, min: -1, max: 1, step: 0.01, defaultValue: 0.7 },
      ]}
    >
      <GradientTriangle />
    </Demo>
  );
}
