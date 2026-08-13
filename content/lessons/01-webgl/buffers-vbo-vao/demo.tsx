"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./interleaved-quad.frag";
import vertexSource from "./interleaved-quad.vert";

const LABELS = {
  vi: {
    title: "Buffer xen kẽ: byte table trực quan",
    wrong: "Dùng offset SAI (giáo dục)",
    caption: "Buffer interleaved — 20 byte/vertex (2 float vị trí + 3 float màu)",
    statusOk: "VAO đúng: pos offset 0, color offset 8 (byte)",
    statusBad: "VAO SAI: color offset 4 thay vì 8 — đọc lệch 1 số thực (4 byte)",
  },
  en: {
    title: "Interleaved Buffer: Visual Byte Table",
    wrong: "Use WRONG offset (educational)",
    caption: "Interleaved buffer — 20 bytes/vertex (2 position floats + 3 color floats)",
    statusOk: "Correct VAO: pos offset 0, color offset 8 (bytes)",
    statusBad: "WRONG VAO: color offset 4 instead of 8 — off by one float (4 bytes)",
  },
} as const;

// x, y, r, g, b per vertex — same layout the whole track reuses.
const QUAD_VERTS = [
  { x: -0.6, y: 0.6, r: 1.0, g: 0.3, b: 0.3 }, // top-left
  { x: -0.6, y: -0.6, r: 0.3, g: 0.4, b: 1.0 }, // bottom-left
  { x: 0.6, y: 0.6, r: 0.3, g: 1.0, b: 0.3 }, // top-right
  { x: 0.6, y: 0.6, r: 0.3, g: 1.0, b: 0.3 }, // top-right
  { x: -0.6, y: -0.6, r: 0.3, g: 0.4, b: 1.0 }, // bottom-left
  { x: 0.6, y: -0.6, r: 1.0, g: 0.9, b: 0.3 }, // bottom-right
] as const;

const QUAD_DATA = new Float32Array(
  QUAD_VERTS.flatMap((v) => [v.x, v.y, v.r, v.g, v.b]),
);
const STRIDE_BYTES = 20; // 5 floats * 4 bytes/float

interface GlState {
  gl: WebGL2RenderingContext;
  vaoCorrect: WebGLVertexArrayObject;
  vaoWrong: WebGLVertexArrayObject;
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

// Two VAOs sharing one VBO: vaoCorrect wires color at the right byte offset,
// vaoWrong wires it 4 bytes short. Toggling just swaps which recorded wiring
// gets bound — no vertexAttribPointer calls happen at draw time (§ VAO).
function InterleavedQuad() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ wrong: false });

  useEffect(() => {
    paramsRef.current.wrong = booleanOf(values, "wrong", false);
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
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Quad data never changes after upload — STATIC_DRAW is the honest hint.
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_DATA, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aColor = gl.getAttribLocation(program, "aColor");

    const vaoCorrect = gl.createVertexArray();
    if (!vaoCorrect) throw new Error("createVertexArray failed");
    gl.bindVertexArray(vaoCorrect);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, STRIDE_BYTES, 0);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE_BYTES, 8);

    // WRONG on purpose: color offset 4 instead of 8, reads (y, r, g) as (r, g, b).
    const vaoWrong = gl.createVertexArray();
    if (!vaoWrong) throw new Error("createVertexArray failed");
    gl.bindVertexArray(vaoWrong);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, STRIDE_BYTES, 0);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE_BYTES, 4);

    gl.bindVertexArray(null);
    gl.useProgram(program);
    stateRef.current = { gl, vaoCorrect, vaoWrong };

    disposables.registerFn(() => {
      stateRef.current = null;
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vaoCorrect);
      gl.deleteVertexArray(vaoWrong);
      gl.deleteProgram(program);
      // No loseContext(): Strict Mode remounts reuse the SAME canvas.
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

    gl.bindVertexArray(paramsRef.current.wrong ? st.vaoWrong : st.vaoCorrect);
    gl.clearColor(0.06, 0.07, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const wrong = booleanOf(values, "wrong", false);

  return (
    <div className="flex size-full flex-col gap-2 p-2 sm:flex-row">
      <div className="flex shrink-0 flex-col gap-1 sm:w-1/2">
        <canvas ref={canvasRef} className="aspect-square w-full rounded" />
        <div className="rounded bg-background/60 px-2 py-1 font-mono text-[10px] sm:text-xs">
          {wrong ? L.statusBad : L.statusOk}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-md bg-background/40 p-2 font-mono text-[10px] leading-relaxed sm:text-xs">
        <div className="mb-1 font-sans text-[11px] font-medium text-muted-foreground">
          {L.caption}
        </div>
        {QUAD_VERTS.map((v, i) => {
          const base = i * STRIDE_BYTES;
          return (
            <div key={i} className="flex flex-wrap items-center gap-1 py-0.5">
              <span className="w-6 text-muted-foreground">V{i}</span>
              <span className="rounded bg-sky-500/20 px-1 text-sky-700 dark:text-sky-300">
                {base}-{base + 7}B pos({v.x.toFixed(1)},{v.y.toFixed(1)})
              </span>
              <span className="rounded bg-amber-500/20 px-1 text-amber-700 dark:text-amber-300">
                {base + 8}-{base + 19}B rgb({v.r.toFixed(1)},{v.g.toFixed(1)},{v.b.toFixed(1)})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BuffersVboVaoDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "boolean", key: "wrong", label: L.wrong, defaultValue: false },
      ]}
    >
      <InterleavedQuad />
    </Demo>
  );
}
