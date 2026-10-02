"use client";

import { useEffect, useRef, useState } from "react";
import { useVisibleRaf } from "@/lib/hooks/use-visible-raf";

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
// hash() rides on sin(dot(v, vec2(127.1, 311.7))) * 43758.5453, which bands
// badly at mediump — but a banded field beats no hero at all.
precision mediump float;
#endif
uniform vec2 uRes;uniform float uTime;
float hash(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 v){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(v);v*=2.02;a*=.5;}return s;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime*.05;
  vec2 q=vec2(fbm(uv*2.+t),fbm(uv*2.+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(uv*2.+4.*q+vec2(1.7,9.2)+t*1.2),fbm(uv*2.+4.*q+vec2(8.3,2.8)-t));
  float f=fbm(uv*2.+4.*r);
  vec3 deep=vec3(.04,.05,.06), cold=vec3(.13,.30,.44), warm=vec3(.91,.44,.23);
  vec3 col=mix(deep,cold,smoothstep(.24,.76,f));
  col=mix(col,warm,smoothstep(.55,1.06,f+.34*length(r)));
  col+=.045*hash(gl_FragCoord.xy+uTime);
  gl_FragColor=vec4(col,1.);
}`;

interface Scene {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  uRes: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
}

/** Spec §8.2: every GPU object this file creates is deleted again. */
function disposeScene(scene: Scene) {
  const { gl } = scene;
  gl.deleteBuffer(scene.buffer);
  gl.deleteProgram(scene.program);
}

function createScene(canvas: HTMLCanvasElement): Scene | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    if (process.env.NODE_ENV !== "production") {
      console.warn("hero shader failed to compile:", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  };

  const vs = compile(gl.VERTEX_SHADER, VS);
  const fs = compile(gl.FRAGMENT_SHADER, FS);
  const program = vs && fs ? gl.createProgram() : null;
  if (!vs || !fs || !program) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    if (program) gl.deleteProgram(program);
    return null;
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  // Attached shaders live on inside the linked program; the handles do not.
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("hero shader failed to link:", gl.getProgramInfoLog(program));
    }
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);

  // One triangle larger than the viewport — no index buffer, no quad seam.
  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const attrib = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(attrib);
  gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    program,
    buffer,
    uRes: gl.getUniformLocation(program, "uRes"),
    uTime: gl.getUniformLocation(program, "uTime"),
  };
}

function draw(scene: Scene, canvas: HTMLCanvasElement, seconds: number) {
  const { gl } = scene;
  // Decoration under a dark scrim: CSS-pixel resolution is indistinguishable and
  // costs half the fill of a 1.5x backing store.
  const dpr = 1;
  const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, w, h);
  gl.useProgram(scene.program);
  gl.uniform2f(scene.uRes, w, h);
  gl.uniform1f(scene.uTime, seconds);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/**
 * The landing hero's one live WebGL context — a fullscreen triangle and a
 * domain-warped FBM field. Raw WebGL on purpose: `three` and R3F are kept off
 * this route.
 *
 * Every path that would burn a stranger's battery is closed: the pump only
 * runs while the hero is on screen (and browsers pause rAF in hidden tabs),
 * reduced motion gets a single frame, and a lost context is not restored. When
 * WebGL is missing the canvas simply stays transparent and the container's
 * gradient is what shows.
 */
export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [dead, setDead] = useState(false);
  // Browsers pause rAF in hidden tabs, but only some of them and not in
  // headless, so the guard is stated here rather than assumed.
  const [hidden, setHidden] = useState(false);
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = createScene(canvas);
    sceneRef.current = scene;
    // Paint immediately: with alpha:false the buffer composites opaque black
    // until something draws, and under reduced motion this is the only frame.
    if (scene) draw(scene, canvas, 4);

    // The pump re-sizes the backing store every frame; when it is off, nothing
    // else would, so a rotated phone would stretch that single frame.
    const resize = new ResizeObserver(() => {
      const current = sceneRef.current;
      if (current) draw(current, canvas, 4);
    });
    if (reduced) resize.observe(canvas);

    // A context that never existed and one that was taken away are the same
    // thing here: stop the pump and let the container's gradient stand in.
    const kill = () => {
      sceneRef.current = null;
      setDead(true);
    };
    if (!scene) queueMicrotask(kill);

    const onVisibility = () => setHidden(document.hidden);
    canvas.addEventListener("webglcontextlost", kill);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      resize.disconnect();
      canvas.removeEventListener("webglcontextlost", kill);
      document.removeEventListener("visibilitychange", onVisibility);
      if (sceneRef.current) disposeScene(sceneRef.current);
      sceneRef.current = null;
    };
  }, [reduced]);

  useVisibleRaf(
    containerRef,
    (ms) => {
      const canvas = canvasRef.current;
      const scene = sceneRef.current;
      if (canvas && scene) draw(scene, canvas, (ms / 1000) % 1000);
    },
    !reduced && !dead && !hidden,
  );

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
