"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./pipeline-trace.frag";
import vertexSource from "./pipeline-trace.vert";

const LABELS = {
  vi: {
    title: "Trace panel: một tam giác qua từng trạm của pipeline",
    stage: "Trạm",
    stageInput: "1. Vertex specification (input)",
    stageClip: "2. Vertex shader output (clip space)",
    stageNdc: "3. Sau perspective divide (NDC)",
    stageViewport: "4. Viewport transform (pixel)",
    stageFragments: "5. Rasterization (số fragment)",
    w: "w đồng nhất (mô phỏng perspective divide)",
    vertex: "Đỉnh",
    fragmentCount: "Số fragment được tạo ra",
    canvasSize: "Kích thước drawing buffer",
    fragmentNote:
      "đếm bằng gl.readPixels, so khớp màu — số gần đúng do làm tròn theo pixel",
    viewportNote:
      "toạ độ kiểu OpenGL: gốc dưới-trái, trục y hướng lên — khác gốc canvas 2D",
    loading: "đang dựng lại pipeline…",
  },
  en: {
    title: "Trace Panel: One Triangle Through Every Pipeline Station",
    stage: "Station",
    stageInput: "1. Vertex specification (input)",
    stageClip: "2. Vertex shader output (clip space)",
    stageNdc: "3. After the perspective divide (NDC)",
    stageViewport: "4. Viewport transform (pixels)",
    stageFragments: "5. Rasterization (fragment count)",
    w: "shared w (simulated perspective divide)",
    vertex: "Vertex",
    fragmentCount: "Fragments generated",
    canvasSize: "Drawing buffer size",
    fragmentNote:
      "counted via gl.readPixels color matching — approximate due to pixel rounding",
    viewportNote:
      "OpenGL-style coordinates: bottom-left origin, y points up — not the 2D canvas origin",
    loading: "rebuilding the pipeline…",
  },
} as const;

// Input positions in the vertex shader's own units — with uW = 1 these pass
// straight through as clip-space coordinates, matching the theory lesson.
const VERTS: { id: string; x: number; y: number }[] = [
  { id: "A", x: 0.0, y: 0.5 },
  { id: "B", x: -0.55, y: -0.4 },
  { id: "C", x: 0.55, y: -0.4 },
];

const BG_COLOR: [number, number, number] = [0.06, 0.07, 0.1];
const TRIANGLE_COLOR: [number, number, number] = [1.0, 0.65, 0.21];
const TRIANGLE_COLOR_BYTES: [number, number, number] = [255, 166, 54];
const COLOR_TOLERANCE = 4;

interface StageRow {
  id: string;
  input: [number, number];
  clip: [number, number, number, number];
  ndc: [number, number, number];
  viewport: [number, number];
}

interface StageData {
  canvasW: number;
  canvasH: number;
  fragmentCount: number;
  rows: StageRow[];
}

// Recomputes every station's numbers for all 3 vertices, plus an actual
// fragment count read back from the framebuffer. Only called on resize or a
// `w` change (see the revision check in useVisibleRaf below) — not every
// frame, since gl.readPixels over the whole canvas isn't free.
function computeStageData(
  gl: WebGL2RenderingContext,
  w: number,
  canvasW: number,
  canvasH: number,
): StageData {
  const rows: StageRow[] = VERTS.map((v) => {
    const clip: [number, number, number, number] = [v.x, v.y, 0, w];
    const ndc: [number, number, number] = [v.x / w, v.y / w, 0];
    const viewport: [number, number] = [
      (ndc[0] * 0.5 + 0.5) * canvasW,
      (ndc[1] * 0.5 + 0.5) * canvasH,
    ];
    return { id: v.id, input: [v.x, v.y], clip, ndc, viewport };
  });

  const pixels = new Uint8Array(canvasW * canvasH * 4);
  gl.readPixels(0, 0, canvasW, canvasH, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let fragmentCount = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    if (
      Math.abs(r - TRIANGLE_COLOR_BYTES[0]) <= COLOR_TOLERANCE &&
      Math.abs(g - TRIANGLE_COLOR_BYTES[1]) <= COLOR_TOLERANCE &&
      Math.abs(b - TRIANGLE_COLOR_BYTES[2]) <= COLOR_TOLERANCE
    ) {
      fragmentCount++;
    }
  }

  return { canvasW, canvasH, fragmentCount, rows };
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

function formatRow(stage: string, r: StageRow): string {
  switch (stage) {
    case "clip":
      return `(${r.clip.map((n) => n.toFixed(2)).join(", ")})`;
    case "ndc":
      return `(${r.ndc.map((n) => n.toFixed(3)).join(", ")})`;
    case "viewport":
      return `(${r.viewport[0].toFixed(1)}, ${r.viewport[1].toFixed(1)}) px`;
    default:
      return `(${r.input[0].toFixed(2)}, ${r.input[1].toFixed(2)})`;
  }
}

interface GlState {
  gl: WebGL2RenderingContext;
  uW: WebGLUniformLocation | null;
  uColor: WebGLUniformLocation | null;
}

// The non-R3F path: same VBO/VAO/program setup as the first-triangle demo,
// but this one also reads its own framebuffer back to prove the fragment
// count is real, not illustrative.
function PipelineTracePanel() {
  const { values, containerRef } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ w: 1, revision: 0 });
  const appliedRevisionRef = useRef(-1);
  const [stageData, setStageData] = useState<StageData | null>(null);

  useEffect(() => {
    const w = numberOf(values, "w", 1);
    if (w !== paramsRef.current.w) {
      paramsRef.current.w = w;
      paramsRef.current.revision++;
    }
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

    const data = new Float32Array(VERTS.flatMap((v) => [v.x, v.y]));
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    stateRef.current = {
      gl,
      uW: gl.getUniformLocation(program, "uW"),
      uColor: gl.getUniformLocation(program, "uColor"),
    };

    disposables.registerFn(() => {
      stateRef.current = null;
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      // No loseContext() here: Strict Mode remounts reuse the SAME canvas.
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
    let sizeChanged = false;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      sizeChanged = true;
    }
    gl.viewport(0, 0, w, h);

    gl.clearColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(st.uW, paramsRef.current.w);
    gl.uniform3f(
      st.uColor,
      TRIANGLE_COLOR[0],
      TRIANGLE_COLOR[1],
      TRIANGLE_COLOR[2],
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const revisionChanged =
      appliedRevisionRef.current !== paramsRef.current.revision;
    if (sizeChanged || revisionChanged) {
      appliedRevisionRef.current = paramsRef.current.revision;
      setStageData(computeStageData(gl, paramsRef.current.w, w, h));
    }
  });

  const stage = stringOf(values, "stage", "input");

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full" />
      <div className="absolute inset-x-3 top-3 space-y-1.5 rounded-lg border bg-background/85 p-3 font-mono text-xs backdrop-blur-sm">
        {!stageData && <div>{L.loading}</div>}
        {stageData &&
          stage !== "fragments" &&
          stageData.rows.map((r) => (
            <div
              key={r.id}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="text-muted-foreground">
                {L.vertex} {r.id}
              </span>
              <span className="text-right">{formatRow(stage, r)}</span>
            </div>
          ))}
        {stageData && stage === "viewport" && (
          <div className="text-muted-foreground pt-1 text-[0.65rem]">
            {L.viewportNote}
          </div>
        )}
        {stageData && stage === "fragments" && (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">
                {L.fragmentCount}
              </span>
              <span className="text-right">
                {stageData.fragmentCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">{L.canvasSize}</span>
              <span className="text-right">
                {stageData.canvasW}×{stageData.canvasH}
              </span>
            </div>
            <div className="text-muted-foreground pt-1 text-[0.65rem]">
              {L.fragmentNote}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RenderingPipelineDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "stage",
          label: L.stage,
          defaultValue: "input",
          options: [
            { value: "input", label: L.stageInput },
            { value: "clip", label: L.stageClip },
            { value: "ndc", label: L.stageNdc },
            { value: "viewport", label: L.stageViewport },
            { value: "fragments", label: L.stageFragments },
          ],
        },
        {
          kind: "number",
          key: "w",
          label: L.w,
          min: 0.5,
          max: 2.5,
          step: 0.1,
          defaultValue: 1,
        },
      ]}
    >
      <PipelineTracePanel />
    </Demo>
  );
}
