"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./shape.frag";
import vertexSource from "./shape.vert";

const LABELS = {
  vi: {
    title: "Ba hình trong suốt: preset blend & lỗi thứ tự vẽ",
    preset: "Blend preset",
    presetAlpha: "Alpha (SRC_ALPHA, 1-SRC_ALPHA)",
    presetAdditive: "Additive (ONE, ONE)",
    presetMultiply: "Multiply (DST_COLOR, ZERO)",
    order: "Vẽ đúng (xa→gần, depth write tắt)",
    correctNote: "Đúng: xa→gần, depthMask(false) — các lớp chồng mượt",
    buggyNote: "Sai: gần→xa, depthMask vẫn bật — vùng chồng bị đục lỗ",
  },
  en: {
    title: "Three Translucent Shapes: Blend Preset & Draw-Order Bug",
    preset: "Blend preset",
    presetAlpha: "Alpha (SRC_ALPHA, 1-SRC_ALPHA)",
    presetAdditive: "Additive (ONE, ONE)",
    presetMultiply: "Multiply (DST_COLOR, ZERO)",
    order: "Draw correctly (far→near, depth write off)",
    correctNote: "Correct: far→near, depthMask(false) — layers blend smoothly",
    buggyNote: "Buggy: near→far, depthMask still on — overlaps get punched out",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

interface Shape {
  offset: [number, number];
  z: number;
  color: [number, number, number];
}

// z encodes "true" camera distance: smaller = nearer (matches gl.depthFunc(LESS)).
const RED_NEAR: Shape = { offset: [-0.22, 0.15], z: -0.3, color: [0.92, 0.25, 0.25] };
const GREEN_MID: Shape = { offset: [0.22, 0.15], z: 0, color: [0.25, 0.85, 0.4] };
const BLUE_FAR: Shape = { offset: [0, -0.22], z: 0.3, color: [0.3, 0.45, 0.95] };

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
  uAlpha: WebGLUniformLocation | null;
}

// Raw-WebGL2 path (§8.2/§8.3): cleanup via useDisposable, loop via
// useVisibleRaf. Depth test stays enabled throughout — the "buggy" mode
// reproduces the classic bug by leaving depthMask on, not by disabling
// the test itself.
function BlendShapes({ L }: { L: Labels }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ preset: "alpha", correctOrder: true });

  useEffect(() => {
    paramsRef.current.preset = stringOf(values, "preset", "alpha");
    paramsRef.current.correctOrder = booleanOf(values, "order", true);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // alpha: false — an opaque canvas. The demo's blend passes leave framebuffer
    // alpha < 1, and the browser would composite that as premultiplied (this
    // lesson's own mistake #3), washing the shapes out over the page.
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

    // Unit quad, two triangles — all three shapes reuse this geometry,
    // positioned/colored purely through uniforms.
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
      uAlpha: gl.getUniformLocation(program, "uAlpha"),
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

  useVisibleRaf(containerRef, () => {
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

    const { preset, correctOrder } = paramsRef.current;

    // Multiply only reads as "darkening" against a light background —
    // swap the clear color per preset instead of forcing one bg to work
    // for every mode.
    if (preset === "multiply") gl.clearColor(0.86, 0.86, 0.88, 1);
    else gl.clearColor(0.05, 0.06, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    if (preset === "additive") gl.blendFunc(gl.ONE, gl.ONE);
    else if (preset === "multiply") gl.blendFunc(gl.DST_COLOR, gl.ZERO);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // The bug being reproduced: leaving depth WRITE on while drawing
    // transparent shapes in the wrong (near-to-far) order lets the
    // nearer shape's depth block the farther ones from blending in.
    gl.depthMask(!correctOrder);

    const order = correctOrder
      ? [BLUE_FAR, GREEN_MID, RED_NEAR] // back-to-front: correct
      : [RED_NEAR, GREEN_MID, BLUE_FAR]; // front-to-back: reproduces the bug

    gl.uniform2f(st.uScale, 0.34, 0.34);
    gl.uniform1f(st.uAlpha, 0.55);
    for (const shape of order) {
      gl.uniform2f(st.uOffset, shape.offset[0], shape.offset[1]);
      gl.uniform1f(st.uZ, shape.z);
      gl.uniform3f(st.uColor, shape.color[0], shape.color[1], shape.color[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.depthMask(true);
    gl.disable(gl.BLEND);

    if (readout) {
      readout.textContent = correctOrder ? L.correctNote : L.buggyNote;
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

export default function BlendingAlphaDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "preset",
          label: L.preset,
          defaultValue: "alpha",
          options: [
            { value: "alpha", label: L.presetAlpha },
            { value: "additive", label: L.presetAdditive },
            { value: "multiply", label: L.presetMultiply },
          ],
        },
        { kind: "boolean", key: "order", label: L.order, defaultValue: true },
      ]}
    >
      <BlendShapes L={L} />
    </Demo>
  );
}
