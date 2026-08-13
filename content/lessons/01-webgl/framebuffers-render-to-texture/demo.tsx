"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import sceneFragmentSource from "./scene-triangle.frag";
import sceneVertexSource from "./scene-triangle.vert";
import postFragmentSource from "./post-effect.frag";
import postVertexSource from "./post-effect.vert";

const LABELS = {
  vi: {
    title: "Render-to-texture: pipeline 2 pass qua framebuffer",
    effect: "Hiệu ứng pass 2",
    strength: "Cường độ",
    effectNone: "Không (raw)",
    effectInvert: "Đảo màu",
    effectPixelate: "Pixelate",
    effectWave: "Sóng",
  },
  en: {
    title: "Render-to-Texture: a 2-Pass Framebuffer Pipeline",
    effect: "Pass 2 effect",
    strength: "Strength",
    effectNone: "None (raw)",
    effectInvert: "Invert",
    effectPixelate: "Pixelate",
    effectWave: "Wave",
  },
} as const;

const FBO_SIZE = 256;

const EFFECT_INDEX: Record<string, number> = {
  none: 0,
  invert: 1,
  pixelate: 2,
  wave: 3,
};

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

function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
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
  return program;
}

interface GlState {
  gl: WebGL2RenderingContext;
  sceneProgram: WebGLProgram;
  postProgram: WebGLProgram;
  sceneVao: WebGLVertexArrayObject;
  quadVao: WebGLVertexArrayObject;
  fbo: WebGLFramebuffer;
  fboTexture: WebGLTexture;
  uAngle: WebGLUniformLocation | null;
  uSceneTexture: WebGLUniformLocation | null;
  uEffect: WebGLUniformLocation | null;
  uStrength: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
}

// The non-R3F path: a real two-pass FBO pipeline on a plain <canvas>.
// Cleanup via useDisposable (§8.2), loop via useVisibleRaf (§8.3).
function RenderToTextureDemo() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const paramsRef = useRef({ effect: "invert", strength: 0.5 });

  useEffect(() => {
    paramsRef.current.effect = stringOf(values, "effect", "invert");
    paramsRef.current.strength = numberOf(values, "strength", 0.5);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");

    const sceneProgram = createProgram(
      gl,
      sceneVertexSource,
      sceneFragmentSource,
    );
    const postProgram = createProgram(gl, postVertexSource, postFragmentSource);

    // Pass 1 geometry: one triangle, per-vertex color.
    // prettier-ignore
    const triangleData = new Float32Array([
       0.0,  0.6, 1.0, 0.42, 0.21,
      -0.55, -0.45, 0.36, 0.62, 1.0,
       0.55, -0.45, 0.55, 1.0, 0.55,
    ]);
    const sceneVao = gl.createVertexArray();
    const sceneBuffer = gl.createBuffer();
    gl.bindVertexArray(sceneVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleData, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(sceneProgram, "aPosition");
    const aCol = gl.getAttribLocation(sceneProgram, "aColor");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(aCol);
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 20, 8);

    // Pass 2 geometry: a fullscreen quad, position + UV.
    // prettier-ignore
    const quadData = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
       1,  1, 1, 1,
      -1, -1, 0, 0,
       1,  1, 1, 1,
      -1,  1, 0, 1,
    ]);
    const quadVao = gl.createVertexArray();
    const quadBuffer = gl.createBuffer();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadData, gl.STATIC_DRAW);
    const aQuadPos = gl.getAttribLocation(postProgram, "aPosition");
    const aQuadUv = gl.getAttribLocation(postProgram, "aUV");
    gl.enableVertexAttribArray(aQuadPos);
    gl.vertexAttribPointer(aQuadPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aQuadUv);
    gl.vertexAttribPointer(aQuadUv, 2, gl.FLOAT, false, 16, 8);

    // Render target: an empty texture attached as the FBO's color attachment.
    const fboTexture = gl.createTexture();
    if (!fboTexture) throw new Error("createTexture failed");
    gl.bindTexture(gl.TEXTURE_2D, fboTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      FBO_SIZE,
      FBO_SIZE,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fbo = gl.createFramebuffer();
    if (!fbo) throw new Error("createFramebuffer failed");
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      fboTexture,
      0,
    );
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer incomplete: 0x${status.toString(16)}`);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    stateRef.current = {
      gl,
      sceneProgram,
      postProgram,
      sceneVao,
      quadVao,
      fbo,
      fboTexture,
      uAngle: gl.getUniformLocation(sceneProgram, "uAngle"),
      uSceneTexture: gl.getUniformLocation(postProgram, "uSceneTexture"),
      uEffect: gl.getUniformLocation(postProgram, "uEffect"),
      uStrength: gl.getUniformLocation(postProgram, "uStrength"),
      uTime: gl.getUniformLocation(postProgram, "uTime"),
    };

    disposables.registerFn(() => {
      stateRef.current = null;
      gl.deleteBuffer(sceneBuffer);
      gl.deleteBuffer(quadBuffer);
      gl.deleteVertexArray(sceneVao);
      gl.deleteVertexArray(quadVao);
      gl.deleteTexture(fboTexture);
      gl.deleteFramebuffer(fbo);
      gl.deleteProgram(sceneProgram);
      gl.deleteProgram(postProgram);
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

    const { effect, strength } = paramsRef.current;
    const effectIndex = EFFECT_INDEX[effect] ?? 0;
    const timeSec = t * 0.001;

    // Pass 1: draw the animated triangle into the FBO's texture. Viewport
    // MUST match the attachment size — the FBO texture is FBO_SIZE x
    // FBO_SIZE, independent of the canvas' real resolution.
    gl.bindFramebuffer(gl.FRAMEBUFFER, st.fbo);
    gl.viewport(0, 0, FBO_SIZE, FBO_SIZE);
    gl.clearColor(0.05, 0.06, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(st.sceneProgram);
    gl.bindVertexArray(st.sceneVao);
    gl.uniform1f(st.uAngle, timeSec * 0.8);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Pass 2: back to the default framebuffer (the canvas), sample the FBO
    // texture through the selected effect on a fullscreen quad.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.02, 0.02, 0.03, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(st.postProgram);
    gl.bindVertexArray(st.quadVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, st.fboTexture);
    gl.uniform1i(st.uSceneTexture, 0);
    gl.uniform1f(st.uTime, timeSec);
    gl.uniform1f(st.uStrength, strength);
    gl.uniform1i(st.uEffect, effectIndex);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Inset: the same FBO texture, no effect, drawn into a small corner
    // viewport — proof pass 1's raw output and pass 2's processed output
    // both exist at the same time.
    const insetSize = Math.round(Math.min(w, h) * 0.28);
    const margin = Math.round(12 * dpr);
    gl.viewport(
      w - insetSize - margin,
      h - insetSize - margin,
      insetSize,
      insetSize,
    );
    gl.uniform1i(st.uEffect, 0);
    gl.uniform1f(st.uStrength, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function FramebuffersRenderToTextureDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "effect",
          label: L.effect,
          defaultValue: "invert",
          options: [
            { value: "none", label: L.effectNone },
            { value: "invert", label: L.effectInvert },
            { value: "pixelate", label: L.effectPixelate },
            { value: "wave", label: L.effectWave },
          ],
        },
        {
          kind: "number",
          key: "strength",
          label: L.strength,
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.5,
        },
      ]}
    >
      <RenderToTextureDemo />
    </Demo>
  );
}
