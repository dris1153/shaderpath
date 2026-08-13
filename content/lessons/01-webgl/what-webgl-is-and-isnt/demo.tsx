"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "Context Inspector — WebGL2 là một state machine thật",
    clearColor: "Màu clear",
    colorSlate: "Xanh than đêm",
    colorCoral: "Cam san hô",
    colorTeal: "Ngọc lam",
    version: "VERSION",
    renderer: "RENDERER (unmasked)",
    maxTexture: "MAX_TEXTURE_SIZE",
    maxAttribs: "MAX_VERTEX_ATTRIBS",
    unavailable: "không đọc được — trình duyệt chặn WEBGL_debug_renderer_info",
    loading: "đang đọc từ GPU…",
    hint: "Đổi màu clear rồi nhìn canvas đổi ngay — mọi dòng bên dưới đọc thẳng từ driver GPU thật của máy bạn, không phải số giả lập.",
  },
  en: {
    title: "Context Inspector — WebGL2 Is a Real State Machine",
    clearColor: "Clear color",
    colorSlate: "Midnight slate",
    colorCoral: "Coral",
    colorTeal: "Teal",
    version: "VERSION",
    renderer: "RENDERER (unmasked)",
    maxTexture: "MAX_TEXTURE_SIZE",
    maxAttribs: "MAX_VERTEX_ATTRIBS",
    unavailable: "unavailable — browser blocks WEBGL_debug_renderer_info",
    loading: "reading from the GPU…",
    hint: "Switch the clear color and watch the canvas update instantly — every row below is read straight from your machine's real GPU driver, not simulated.",
  },
} as const;

// sRGB triples for the <select> presets — picked for visible contrast against
// the orange readout panel border, not for any technical reason.
const CLEAR_PRESETS: Record<string, [number, number, number]> = {
  slate: [0.06, 0.08, 0.14],
  coral: [0.82, 0.35, 0.26],
  teal: [0.04, 0.44, 0.42],
};

interface GlInfo {
  version: string;
  renderer: string | null;
  maxTextureSize: number;
  maxVertexAttribs: number;
}

// The non-R3F path: this demo has no draw call at all, only gl.clear() with a
// live-picked color — the point is that VERSION/RENDERER/MAX_* below are read
// from real hardware, not that anything gets rasterized yet (bài sau lo phần đó).
function ContextInspector() {
  const { values, containerRef } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const colorRef = useRef<[number, number, number]>(CLEAR_PRESETS.slate!);
  const [info, setInfo] = useState<GlInfo | null>(null);

  useEffect(() => {
    const key = stringOf(values, "clearColor", "slate");
    colorRef.current = CLEAR_PRESETS[key] ?? CLEAR_PRESETS.slate!;
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");
    glRef.current = gl;

    const debugExt = gl.getExtension("WEBGL_debug_renderer_info");
    setInfo({
      version: gl.getParameter(gl.VERSION) as string,
      renderer: debugExt
        ? (gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) as string)
        : null,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number,
    });

    disposables.registerFn(() => {
      glRef.current = null;
      // No loseContext() here: Strict Mode remounts reuse the SAME canvas,
      // and a lost context can never be recreated on it.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, () => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    const [r, g, b] = colorRef.current;
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  });

  const rows: [string, string][] = info
    ? [
        [L.version, info.version],
        [L.renderer, info.renderer ?? L.unavailable],
        [L.maxTexture, String(info.maxTextureSize)],
        [L.maxAttribs, String(info.maxVertexAttribs)],
      ]
    : [];

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full" />
      <div className="absolute inset-x-3 top-3 space-y-1.5 rounded-lg border bg-background/85 p-3 font-mono text-xs backdrop-blur-sm">
        {rows.length === 0 && <div>{L.loading}</div>}
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="max-w-[60%] truncate text-right">{value}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/85 px-3 py-1.5 text-xs">
        {L.hint}
      </div>
    </div>
  );
}

export default function WhatWebglIsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "clearColor",
          label: L.clearColor,
          defaultValue: "slate",
          options: [
            { value: "slate", label: L.colorSlate },
            { value: "coral", label: L.colorCoral },
            { value: "teal", label: L.colorTeal },
          ],
        },
      ]}
    >
      <ContextInspector />
    </Demo>
  );
}
