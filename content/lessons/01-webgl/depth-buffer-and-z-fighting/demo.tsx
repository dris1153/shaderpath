"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./quad.frag";
import vertexSource from "./quad.vert";

const LABELS = {
  vi: {
    title: "Z-fighting sống: khoảng cách & near plane",
    gap: "Khoảng cách 2 mặt (world)",
    near: "Near plane",
    stable: "ổn định",
    flickering: "z-fighting",
    deltaLabel: "Δz (NDC)",
    stepLabel: "1 bước lượng tử",
  },
  en: {
    title: "Live Z-Fighting: Gap & Near Plane",
    gap: "Surface gap (world units)",
    near: "Near plane",
    stable: "stable",
    flickering: "z-fighting",
    deltaLabel: "Δz (NDC)",
    stepLabel: "1 quantized step",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

// Fixed so the two controls (gap, near) fully drive the outcome — matches
// the depth(d) formula from the theory: depth(d) = f/(f-n) * (1 - n/d).
const FAR = 50;
const BASE_DISTANCE = 10;

function depthAt(d: number, near: number, far: number): number {
  return (far / (far - near)) * (1 - near / d);
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

interface GlState {
  gl: WebGL2RenderingContext;
  uScale: WebGLUniformLocation | null;
  uOffset: WebGLUniformLocation | null;
  uZ: WebGLUniformLocation | null;
  uColor: WebGLUniformLocation | null;
  depthBits: number;
}

// Raw-WebGL2 path (§8.2/§8.3): cleanup via useDisposable, loop via
// useVisibleRaf. Two quads share one program/VAO; only uOffset/uZ/uColor
// change between the two draw calls.
function ZFightingQuads({ L }: { L: Labels }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ gap: 0.05, near: 0.05 });

  useEffect(() => {
    paramsRef.current.gap = numberOf(values, "gap", 0.05);
    paramsRef.current.near = numberOf(values, "near", 0.05);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false });
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

    // Unit quad, two triangles — both surfaces reuse this same geometry,
    // positioned/depth-shifted purely through uniforms.
    // prettier-ignore
    const data = new Float32Array([
      -1, -1,  1, -1,  1, 1,
      -1, -1,  1,  1, -1, 1,
    ]);
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    gl.useProgram(program);
    stateRef.current = {
      gl,
      uScale: gl.getUniformLocation(program, "uScale"),
      uOffset: gl.getUniformLocation(program, "uOffset"),
      uZ: gl.getUniformLocation(program, "uZ"),
      uColor: gl.getUniformLocation(program, "uColor"),
      // Real hardware value, not assumed — the "1 quantized step" readout
      // below is only honest if this comes from the actual context.
      depthBits: gl.getParameter(gl.DEPTH_BITS) as number,
    };

    disposables.registerFn(() => {
      stateRef.current = null;
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      // No loseContext() here: Strict Mode remounts reuse the SAME canvas, and
      // a lost context can never be recreated on it. The browser reclaims the
      // context when the canvas leaves the DOM.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, (t) => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    const readout = readoutRef.current;
    if (!st || !canvas) return;
    const { gl } = st;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    const { gap, near } = paramsRef.current;
    const depthA = depthAt(BASE_DISTANCE, near, FAR);
    const depthBBase = depthAt(BASE_DISTANCE + gap, near, FAR);
    const ndcA = depthA * 2 - 1;
    const ndcBBase = depthBBase * 2 - 1;

    // One quantized step, in NDC units, computed from the REAL depth-buffer
    // bit depth of this context (see depthBits above), not a guessed 24.
    const quantStep = 2 / (2 ** st.depthBits - 1);
    // A tiny simulated camera/floating-point jitter — the same order of
    // magnitude as real-world noise (a few quantized steps). Without some
    // per-frame perturbation the GPU is fully deterministic and a tied
    // depth test would just pick one static winner, not visibly flicker;
    // this jitter stands in for the camera micro-motion that makes real
    // z-fighting flicker over time instead of freezing on one surface.
    const jitterAmp = quantStep * 4;
    const jitter = jitterAmp * Math.sin(t * 0.004);
    const ndcB = ndcBBase + jitter;

    gl.clearColor(0.05, 0.06, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform2f(st.uScale, 0.35, 0.35);

    gl.uniform2f(st.uOffset, -0.2, 0);
    gl.uniform1f(st.uZ, ndcA);
    gl.uniform3f(st.uColor, 0.94, 0.5, 0.2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.uniform2f(st.uOffset, 0.2, 0);
    gl.uniform1f(st.uZ, ndcB);
    gl.uniform3f(st.uColor, 0.3, 0.55, 0.95);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (readout) {
      const deltaNdc = Math.abs(ndcBBase - ndcA);
      const flicker = deltaNdc < jitterAmp;
      readout.textContent = `${L.deltaLabel} ${deltaNdc.toExponential(2)}  ·  ${L.stepLabel} ${quantStep.toExponential(2)}  ·  ${flicker ? L.flickering : L.stable}`;
    }
  });

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full" />
      <div
        ref={readoutRef}
        className="text-muted-foreground pointer-events-none absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium"
      />
    </div>
  );
}

export default function DepthBufferZFightingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "number", key: "gap", label: L.gap, min: 0, max: 1.5, step: 0.001, defaultValue: 0.05 },
        { kind: "number", key: "near", label: L.near, min: 0.001, max: 1, step: 0.001, defaultValue: 0.05 },
      ]}
    >
      <ZFightingQuads L={L} />
    </Demo>
  );
}
