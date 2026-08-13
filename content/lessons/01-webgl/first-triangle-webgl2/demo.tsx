"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import fragmentSource from "./triangle.frag";
import vertexSource from "./triangle.vert";

const LABELS = {
  vi: {
    title: "Tam giác WebGL2 thuần — không thư viện",
    angle: "Góc xoay (°)",
    spin: "Tự xoay",
  },
  en: {
    title: "Raw WebGL2 Triangle — no libraries",
    angle: "Rotation (°)",
    spin: "Auto-spin",
  },
} as const;

interface GlState {
  gl: WebGL2RenderingContext;
  uAngle: WebGLUniformLocation | null;
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

// The non-R3F path: proves Demo works for a plain <canvas> too. Cleanup goes
// through useDisposable (§8.2), the loop through useVisibleRaf (§8.3).
function RawTriangle() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ angle: 0, spin: true });

  useEffect(() => {
    paramsRef.current.angle =
      (numberOf(values, "angle", 0) * Math.PI) / 180;
    paramsRef.current.spin = booleanOf(values, "spin", true);
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

    // x, y, r, g, b — one triangle, per-vertex color
    // prettier-ignore
    const data = new Float32Array([
       0.0,  0.62, 1.0, 0.42, 0.21,
      -0.6, -0.44, 0.36, 0.62, 1.0,
       0.6, -0.44, 0.55, 1.0, 0.55,
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
      uAngle: gl.getUniformLocation(program, "uAngle"),
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

    const { angle, spin } = paramsRef.current;
    gl.clearColor(0.06, 0.07, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(st.uAngle, angle + (spin ? t * 0.0005 : 0));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function FirstTriangleDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "number", key: "angle", label: L.angle, min: 0, max: 360, step: 1, defaultValue: 0 },
        { kind: "boolean", key: "spin", label: L.spin, defaultValue: true },
      ]}
    >
      <RawTriangle />
    </Demo>
  );
}
