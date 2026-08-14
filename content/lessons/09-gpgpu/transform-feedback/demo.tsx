"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import updateVertexSource from "./update.vert";
import updateFragmentSource from "./update.frag";
import renderVertexSource from "./render.vert";
import renderFragmentSource from "./render.frag";

const LABELS = {
  vi: {
    title: "Transform feedback: quỹ đạo particle không qua texture nào cả",
    strength: "Lực hút",
    count: "Số particle",
    paused: "Tạm dừng",
  },
  en: {
    title: "Transform Feedback: Particle Orbits With No Texture at All",
    strength: "Attractor strength",
    count: "Particle count",
    paused: "Paused",
  },
} as const;

const POINT_SIZE = 3;

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
  transformFeedbackVaryings?: string[],
) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  if (!program) throw new Error("createProgram failed");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  if (transformFeedbackVaryings) {
    // MUST run before linkProgram — the linker bakes varying capture into
    // the program's layout, and calling this after linking has no effect.
    gl.transformFeedbackVaryings(
      program,
      transformFeedbackVaryings,
      gl.SEPARATE_ATTRIBS,
    );
  }
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

interface BufferSet {
  vao: WebGLVertexArrayObject;
  position: WebGLBuffer;
  velocity: WebGLBuffer;
}

// Circular-orbit speed under the shader's inverse-square pull F = strength / r^2
// is v = sqrt(strength / r) — see theory for the derivation.
function seedParticles(count: number, baseStrength: number) {
  const positions = new Float32Array(count * 2);
  const velocities = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const r = 0.15 + Math.random() * 0.75;
    const theta = Math.random() * Math.PI * 2;
    const speed = Math.sqrt(baseStrength / r);
    positions[i * 2] = Math.cos(theta) * r;
    positions[i * 2 + 1] = Math.sin(theta) * r;
    velocities[i * 2] = -Math.sin(theta) * speed;
    velocities[i * 2 + 1] = Math.cos(theta) * speed;
  }
  return { positions, velocities };
}

function createBufferSet(
  gl: WebGL2RenderingContext,
  positions: Float32Array,
  velocities: Float32Array,
): BufferSet {
  const position = gl.createBuffer();
  const velocity = gl.createBuffer();
  if (!position || !velocity) throw new Error("createBuffer failed");
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_COPY);
  gl.bindBuffer(gl.ARRAY_BUFFER, velocity);
  gl.bufferData(gl.ARRAY_BUFFER, velocities, gl.DYNAMIC_COPY);

  const vao = gl.createVertexArray();
  if (!vao) throw new Error("createVertexArray failed");
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, velocity);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  return { vao, position, velocity };
}

function deleteBufferSet(gl: WebGL2RenderingContext, set: BufferSet) {
  gl.deleteVertexArray(set.vao);
  gl.deleteBuffer(set.position);
  gl.deleteBuffer(set.velocity);
}

interface GlState {
  gl: WebGL2RenderingContext;
  updateProgram: WebGLProgram;
  renderProgram: WebGLProgram;
  sets: [BufferSet, BufferSet];
  front: 0 | 1;
  count: number;
  uStrength: WebGLUniformLocation | null;
  uDelta: WebGLUniformLocation | null;
  uPointSize: WebGLUniformLocation | null;
}

// The Track 1 raw-WebGL2 pattern: Three.js has no transform feedback API, so
// this demo is a plain <canvas>, no R3F. Cleanup via useDisposable (§8.2),
// loop via useVisibleRaf (§8.3).
function ParticleCanvas() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<GlState | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const paramsRef = useRef({ strength: 0.02, paused: false, count: 16384 });

  useEffect(() => {
    paramsRef.current.strength = numberOf(values, "strength", 0.02);
    paramsRef.current.paused = booleanOf(values, "paused", false);
    paramsRef.current.count = Number(stringOf(values, "count", "16384"));
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");

    const updateProgram = createProgram(
      gl,
      updateVertexSource,
      updateFragmentSource,
      ["vPosition", "vVelocity"],
    );
    const renderProgram = createProgram(gl, renderVertexSource, renderFragmentSource);

    const count = paramsRef.current.count;
    const { positions, velocities } = seedParticles(count, paramsRef.current.strength);
    const sets: [BufferSet, BufferSet] = [
      createBufferSet(gl, positions, velocities),
      createBufferSet(gl, positions, velocities),
    ];

    const state: GlState = {
      gl,
      updateProgram,
      renderProgram,
      sets,
      front: 0,
      count,
      uStrength: gl.getUniformLocation(updateProgram, "uStrength"),
      uDelta: gl.getUniformLocation(updateProgram, "uDelta"),
      uPointSize: gl.getUniformLocation(renderProgram, "uPointSize"),
    };
    stateRef.current = state;

    disposables.registerFn(() => {
      const s = stateRef.current;
      stateRef.current = null;
      if (!s) return;
      deleteBufferSet(s.gl, s.sets[0]);
      deleteBufferSet(s.gl, s.sets[1]);
      s.gl.deleteProgram(s.updateProgram);
      s.gl.deleteProgram(s.renderProgram);
      // No loseContext() here: Strict Mode remounts reuse the SAME canvas,
      // and a lost context can never be recreated on it.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, (t) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!s || !canvas) return;
    const { gl } = s;

    const last = lastTimeRef.current;
    const dt = last === null ? 1 / 60 : Math.min((t - last) / 1000, 1 / 30);
    lastTimeRef.current = t;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    // Point count changed: rebuild both buffer sets at the new size.
    if (s.count !== paramsRef.current.count) {
      deleteBufferSet(gl, s.sets[0]);
      deleteBufferSet(gl, s.sets[1]);
      const { positions, velocities } = seedParticles(
        paramsRef.current.count,
        paramsRef.current.strength,
      );
      s.sets = [
        createBufferSet(gl, positions, velocities),
        createBufferSet(gl, positions, velocities),
      ];
      s.front = 0;
      s.count = paramsRef.current.count;
    }

    const readIdx = s.front;
    const writeIdx = s.front === 0 ? 1 : 0;

    // 1. Render the current front buffer (this frame's pre-update state) —
    // one frame stale by the time the update pass below finishes, which is
    // imperceptible at 60fps and keeps the render draw independent of the
    // transform feedback draw within the same frame.
    gl.clearColor(0.02, 0.02, 0.03, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(s.renderProgram);
    gl.bindVertexArray(s.sets[readIdx].vao);
    gl.uniform1f(s.uPointSize, POINT_SIZE * dpr);
    gl.drawArrays(gl.POINTS, 0, s.count);

    // 2. Update via transform feedback: read the front set, write into the
    // other set, then swap so next frame renders the fresh result.
    if (!paramsRef.current.paused) {
      gl.useProgram(s.updateProgram);
      gl.bindVertexArray(s.sets[readIdx].vao);
      gl.uniform1f(s.uStrength, paramsRef.current.strength);
      gl.uniform1f(s.uDelta, dt);

      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, s.sets[writeIdx].position);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, s.sets[writeIdx].velocity);
      gl.enable(gl.RASTERIZER_DISCARD);
      gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS, 0, s.count);
      gl.endTransformFeedback();
      gl.disable(gl.RASTERIZER_DISCARD);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);

      s.front = writeIdx;
    }

    gl.bindVertexArray(null);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function TransformFeedbackDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "number",
          key: "strength",
          label: L.strength,
          min: 0.005,
          max: 0.08,
          step: 0.005,
          defaultValue: 0.02,
        },
        {
          kind: "select",
          key: "count",
          label: L.count,
          defaultValue: "16384",
          options: [
            { value: "4096", label: "4,096" },
            { value: "16384", label: "16,384" },
            { value: "65536", label: "65,536" },
          ],
        },
        { kind: "boolean", key: "paused", label: L.paused, defaultValue: false },
      ]}
    >
      <ParticleCanvas />
    </Demo>
  );
}
