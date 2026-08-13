"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./pattern.frag";
import vertexSource from "./pattern.vert";

const LABELS = {
  vi: {
    title: "Kiểm tra độ nét: DPR & kích thước buffer",
    dpr: "Chế độ DPR",
    dprHalf: "0.5× (buffer nhỏ hơn CSS)",
    dprOne: "1× (bỏ qua Retina)",
    dprNative: "devicePixelRatio (thật)",
    dprCapped: "min(dpr, 2) — khuyến nghị",
    css: "CSS",
    buffer: "Buffer",
  },
  en: {
    title: "Crispness Test: DPR & Buffer Size",
    dpr: "DPR mode",
    dprHalf: "0.5× (buffer smaller than CSS)",
    dprOne: "1× (ignores Retina)",
    dprNative: "devicePixelRatio (native)",
    dprCapped: "min(dpr, 2) — recommended",
    css: "CSS",
    buffer: "Buffer",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

function resolveDpr(mode: string): number {
  const raw = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  if (mode === "0.5") return 0.5;
  if (mode === "1") return 1;
  if (mode === "2cap") return Math.min(raw, 2);
  return raw; // "native"
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
  uResolution: WebGLUniformLocation | null;
}

// Raw-WebGL2 path (§8.2/§8.3): cleanup via useDisposable, loop via
// useVisibleRaf. No VBO/VAO — the vertex shader builds a fullscreen
// triangle straight from gl_VertexID.
function DprCanvas({ L }: { L: Labels }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const dprModeRef = useRef("native");

  useEffect(() => {
    dprModeRef.current = stringOf(values, "dpr", "native");
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
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

    gl.useProgram(program);
    stateRef.current = {
      gl,
      uResolution: gl.getUniformLocation(program, "uResolution"),
    };

    disposables.registerFn(() => {
      stateRef.current = null;
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

    // Resize on demand: cheap check every frame, buffer only reallocated
    // (and gl.viewport only re-issued) when the computed size actually changes.
    const dpr = resolveDpr(dprModeRef.current);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      const readout = readoutRef.current;
      if (readout) {
        readout.textContent = `${L.css} ${cssW}×${cssH}px  ${L.buffer} ${w}×${h}px  (dpr ${dpr.toFixed(2)})`;
      }
    }

    gl.clearColor(0.04, 0.05, 0.07, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(st.uResolution, w, h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
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

export default function CanvasContextDprDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "dpr",
          label: L.dpr,
          defaultValue: "native",
          options: [
            { value: "0.5", label: L.dprHalf },
            { value: "1", label: L.dprOne },
            { value: "native", label: L.dprNative },
            { value: "2cap", label: L.dprCapped },
          ],
        },
      ]}
    >
      <DprCanvas L={L} />
    </Demo>
  );
}
