"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./roads.frag";
import vertexSource from "./roads.vert";

const LABELS = {
  vi: {
    title: "Ba con đường dữ liệu: attribute vs uniform vs varying",
    mode: "Con đường dữ liệu",
    modeUniform: "uniform — màu đặc cả tam giác",
    modeAttribute: "attribute — màu riêng từng đỉnh",
    modeVarying: "varying — gradient từ vị trí",
    hue: "Hue (chỉ dùng ở chế độ uniform)",
  },
  en: {
    title: "Three Data Roads: attribute vs uniform vs varying",
    mode: "Data road",
    modeUniform: "uniform — one solid color, whole triangle",
    modeAttribute: "attribute — distinct color per vertex",
    modeVarying: "varying — gradient computed from position",
    hue: "Hue (only used in uniform mode)",
  },
} as const;

// Mirrors uMode in roads.frag: 0 = uniform, 1 = attribute, 2 = varying
const MODE_INDEX: Record<string, number> = {
  uniform: 0,
  attribute: 1,
  varying: 2,
};

interface GlState {
  gl: WebGL2RenderingContext;
  uMode: WebGLUniformLocation | null;
  uSolidColor: WebGLUniformLocation | null;
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

// hue (0-360, full saturation/value) -> RGB, drives the "uniform" road's slider
function hueToRgb(hueDeg: number): [number, number, number] {
  const h = ((hueDeg % 360) + 360) % 360;
  const x = 1 - Math.abs(((h / 60) % 2) - 1);
  if (h < 60) return [1, x, 0];
  if (h < 120) return [x, 1, 0];
  if (h < 180) return [0, 1, x];
  if (h < 240) return [0, x, 1];
  if (h < 300) return [x, 0, 1];
  return [1, 0, x];
}

// The non-R3F path (§8.3): plain <canvas>, cleanup through useDisposable,
// the loop through useVisibleRaf.
function RoadsTriangle() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ mode: 0, hue: 210 });

  useEffect(() => {
    paramsRef.current.mode =
      MODE_INDEX[stringOf(values, "mode", "uniform")] ?? 0;
    paramsRef.current.hue = numberOf(values, "hue", 210);
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

    // x, y, r, g, b — pure red/green/blue per vertex: the "attribute" road's data
    // prettier-ignore
    const data = new Float32Array([
       0.0,  0.62, 1.0, 0.0, 0.0,
      -0.6, -0.44, 0.0, 1.0, 0.0,
       0.6, -0.44, 0.0, 0.0, 1.0,
    ]);
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aColor = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 20, 8);

    gl.useProgram(program);
    stateRef.current = {
      gl,
      uMode: gl.getUniformLocation(program, "uMode"),
      uSolidColor: gl.getUniformLocation(program, "uSolidColor"),
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

    const { mode, hue } = paramsRef.current;
    const [r, g, b] = hueToRgb(hue);
    gl.clearColor(0.06, 0.07, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(st.uMode, mode);
    gl.uniform3f(st.uSolidColor, r, g, b);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function AttributesUniformsVaryingsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "uniform",
          options: [
            { value: "uniform", label: L.modeUniform },
            { value: "attribute", label: L.modeAttribute },
            { value: "varying", label: L.modeVarying },
          ],
        },
        {
          kind: "number",
          key: "hue",
          label: L.hue,
          min: 0,
          max: 360,
          step: 1,
          defaultValue: 210,
        },
      ]}
    >
      <RoadsTriangle />
    </Demo>
  );
}
