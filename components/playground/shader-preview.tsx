"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import { useQuality } from "@/components/providers/quality-provider";
import {
  FULLSCREEN_VERT,
  assembleFragment,
} from "@/lib/glsl/assemble";
import { compileProgram } from "@/lib/glsl/compile";
import {
  bindForWrite,
  canRenderFloat,
  createPresenter,
  destroyPingPong,
  presentAndSwap,
  reconcilePingPong,
  type PingPong,
  type Presenter,
} from "@/lib/glsl/ping-pong";
import { parseGlslLog, type GlslError } from "@/lib/glsl/parse-error";

interface GlState {
  gl: WebGL2RenderingContext;
  program: WebGLProgram | null;
  uTime: WebGLUniformLocation | null;
  uResolution: WebGLUniformLocation | null;
  uMouse: WebGLUniformLocation | null;
  uPrev: WebGLUniformLocation | null;
  uFrame: WebGLUniformLocation | null;
  /** Null unless the current program reads uPrev. */
  pair: PingPong | null;
  presenter: Presenter | null;
  float: boolean;
  frame: number;
}

// Raw WebGL2 on purpose (not Three): we control the exact assembled source,
// so compiler line numbers map 1:1 through PRELUDE_LINES (§11.5).
export function ShaderPreview({
  source,
  onCompile,
}: {
  source: string;
  onCompile: (errors: GlslError[], compileMs: number) => void;
}) {
  const t = useTranslations("playground");
  const { effectBudget } = useQuality();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GlState | null>(null);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const disposables = useDisposable();
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false });
    if (!gl) throw new Error("WebGL2 not supported");

    // Fullscreen triangle — covers the viewport with 3 vertices, no quad seam
    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    stateRef.current = {
      gl,
      program: null,
      uTime: null,
      uResolution: null,
      uMouse: null,
      uPrev: null,
      uFrame: null,
      pair: null,
      presenter: createPresenter(gl, FULLSCREEN_VERT, compileProgram),
      float: canRenderFloat(gl),
      frame: 0,
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height, // GL convention: y up
      ];
    };
    canvas.addEventListener("pointermove", onMove);

    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    disposables.registerFn(() => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      const st = stateRef.current;
      if (st?.program) gl.deleteProgram(st.program);
      if (st?.pair) destroyPingPong(gl, st.pair);
      if (st?.presenter) gl.deleteProgram(st.presenter.program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      stateRef.current = null;
      // No loseContext(): Strict Mode remounts reuse this canvas (phase-04 note)
    });
  }, [disposables]);

  // Compile off the render path; on failure keep the last good program (§11.5)
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const { gl } = st;
    const started = performance.now();
    const result = compileProgram(
      gl,
      FULLSCREEN_VERT,
      assembleFragment(source),
    );
    const ms = Math.round(performance.now() - started);

    if (result.ok) {
      if (st.program) gl.deleteProgram(st.program);
      st.program = result.program;
      st.uTime = gl.getUniformLocation(result.program, "uTime");
      st.uResolution = gl.getUniformLocation(result.program, "uResolution");
      st.uMouse = gl.getUniformLocation(result.program, "uMouse");
      st.uPrev = gl.getUniformLocation(result.program, "uPrev");
      st.uFrame = gl.getUniformLocation(result.program, "uFrame");
      // Editing a feedback rule and then seeing residue from the old rule
      // teaches nothing, so every recompile starts the simulation over.
      st.frame = 0;
      onCompile([], ms);
    } else {
      onCompile(parseGlslLog(result.log, source.split("\n").length), ms);
    }
  }, [source, onCompile]);

  useVisibleRaf(containerRef, (t) => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;
    const { gl } = st;

    const dpr = Math.min(window.devicePixelRatio || 1, 2) * effectBudget;
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    // A resize cannot preserve simulation state, and one happens on any window
    // drag or quality-tier change — so feedback presets must seed from frame 0.
    const pair = reconcilePingPong(gl, st.pair, {
      needed: st.uPrev !== null,
      width: w,
      height: h,
      float: st.float,
    });
    if (pair !== st.pair) {
      st.pair = pair;
      st.frame = 0;
    }

    if (!st.program) {
      gl.clearColor(0.05, 0.06, 0.09, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    gl.useProgram(st.program);
    gl.uniform1f(st.uTime, t / 1000);
    gl.uniform2f(st.uResolution, w, h);
    gl.uniform2f(st.uMouse, mouseRef.current[0], mouseRef.current[1]);
    if (st.uFrame) gl.uniform1i(st.uFrame, st.frame);

    if (st.pair && st.presenter) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, st.pair.tex[st.pair.read]);
      gl.uniform1i(st.uPrev, 0);
      bindForWrite(gl, st.pair);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      presentAndSwap(gl, st.pair, st.presenter);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    st.frame++;
  });

  return (
    <div ref={containerRef} className="relative size-full">
      <canvas ref={canvasRef} className="size-full" data-testid="shader-canvas" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Alert variant="destructive">
            <AlertDescription>{t("contextLost")}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
