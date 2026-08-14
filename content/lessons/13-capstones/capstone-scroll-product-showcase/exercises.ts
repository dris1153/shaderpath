import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-scroll-product-showcase",
    kind: "build",
    prompt: {
      vi: `Dựng \`ScrollProductShowcase\`, một trang giới thiệu sản phẩm cuộn trang hoàn chỉnh tổng hợp GLTF/asset pipeline, ScrollTrigger đồng bộ R3F và một chuỗi post-processing tiết chế. \`starterCode\` đã dựng khung: một component load model GLTF nhúng (đại diện cho asset thật đã qua Draco/KTX2), một proxy object \`{ dolly, turntable, spotlight }\`, và khung composer hậu kỳ — việc của bạn là lấp 6 TODO theo đúng 6 mốc của dự án.

Mốc 1 (TODO 1): parse \`buildProductGltf()\` bằng \`GLTFLoader.parse()\`, đăng ký geometry/material qua \`useDisposable\`, add vào scene. Mốc 2 (TODO 2): camera đọc \`progress.dolly\` trong \`useFrame\`, và một \`ScrollTrigger\` scrub đầu tiên ghi vào đúng field đó rồi gọi \`invalidate()\`. Mốc 3 (TODO 3): thêm hai ScrollTrigger scrub còn lại (turntable, spotlight) cộng một vòng lặp \`toggleActions\` cho mọi \`.chapter-copy\`. Mốc 4 (TODO 4): ánh sáng + material cho cảm giác sản phẩm cao cấp. Mốc 5 (TODO 5): composer thủ công — \`RenderPass\` → \`UnrealBloomPass\` (ngưỡng cao, chỉ bloom vành emissive) → \`OutputPass\` → vignette \`ShaderPass\`, đo \`composer.render()\` bằng EMA so với một ngân sách cụ thể. Mốc 6 (TODO 6): nhánh \`prefers-reduced-motion: reduce\` set thẳng một pose tĩnh, cộng dispose composer/pass khi unmount.

Layout giữ tối giản có chủ đích: canvas \`position: sticky\` phủ toàn bộ trong lúc ba \`section\` cao \`150vh\` cuộn qua bên dưới. Một trang thật sẽ chia lưới canvas/text thành hai cột để copy không bao giờ nằm dưới model — phần đó nằm ngoài phạm vi \`solutionCode\` này, vốn tập trung vào phần biên đạo cuộn + render.`,
      en: `Build \`ScrollProductShowcase\`, a complete scroll-driven product page synthesizing the GLTF/asset pipeline, ScrollTrigger synced to R3F, and a restrained post-processing chain. The \`starterCode\` already scaffolds it: a component loading an embedded GLTF model (standing in for a real Draco/KTX2-compressed asset), a proxy object \`{ dolly, turntable, spotlight }\`, and a post-processing composer frame — your job is filling 6 TODOs matching the project's 6 milestones.

Milestone 1 (TODO 1): parse \`buildProductGltf()\` with \`GLTFLoader.parse()\`, register the geometry/material through \`useDisposable\`, add it to the scene. Milestone 2 (TODO 2): the camera reads \`progress.dolly\` inside \`useFrame\`, and a first scrub \`ScrollTrigger\` writes into that exact field then calls \`invalidate()\`. Milestone 3 (TODO 3): add the two remaining scrub triggers (turntable, spotlight) plus a \`toggleActions\` loop over every \`.chapter-copy\`. Milestone 4 (TODO 4): lighting + material for a premium-product feel. Milestone 5 (TODO 5): a manual composer — \`RenderPass\` → \`UnrealBloomPass\` (high threshold, bloom only the emissive rim) → \`OutputPass\` → a vignette \`ShaderPass\`, measuring \`composer.render()\` with an EMA against a stated budget. Milestone 6 (TODO 6): a \`prefers-reduced-motion: reduce\` branch setting a static pose directly, plus disposing the composer/passes on unmount.

The layout stays deliberately minimal: a \`position: sticky\` canvas covers the viewport while three \`150vh\` sections scroll past underneath. A real page would grid the canvas against a text column so copy never sits under the model — that's out of scope for this \`solutionCode\`, which focuses on the scroll choreography and render wiring.`,
    },
    starterCode: `"use client";
// SCAFFOLD -- 6 milestones, 6 TODOs. Fill each one in order; later TODOs
// read structures set up by earlier ones (progress fields, the composer).

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import { useDisposable } from "@/lib/hooks/use-disposable";

gsap.registerPlugin(ScrollTrigger);

// ---- asset pipeline (Milestone 1) --------------------------------------
// Real project: run the source .glb through gltf-transform BEFORE it ever
// reaches this file --
//   npx @gltf-transform/cli optimize product.glb product.opt.glb \\
//     --compress draco --texture-compress ktx2
// then wire DRACOLoader/KTX2Loader on GLTFLoader BEFORE calling load():
//   const draco = new DRACOLoader().setDecoderPath("/draco/");
//   const ktx2 = new KTX2Loader().setTranscoderPath("/basis/").detectSupport(gl);
//   new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2)
//     .load("/models/product.glb", onLoad);
// This repo ships no binary assets, so the reference below embeds a plain
// (uncompressed) glTF JSON built from a real BufferGeometry -- same
// accessor/bufferView shape GLTFLoader.parse() reads from a real file.

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function toBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out += b1 === undefined ? "=" : B64[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? "=" : B64[b2 & 63];
  }
  return out;
}

function buildProductGltf(): Record<string, unknown> {
  const geo = new THREE.CylinderGeometry(0.6, 0.75, 2.2, 32);
  const position = geo.attributes.position!.array as Float32Array;
  const normal = geo.attributes.normal!.array as Float32Array;
  const uv = geo.attributes.uv!.array as Float32Array;
  const index = Uint32Array.from(geo.index!.array);
  const toBytes = (a: Float32Array | Uint32Array) => new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  const [pB, nB, uB, iB] = [toBytes(position), toBytes(normal), toBytes(uv), toBytes(index)];
  const combined = new Uint8Array(pB.length + nB.length + uB.length + iB.length);
  let off = 0;
  for (const chunk of [pB, nB, uB, iB]) {
    combined.set(chunk, off);
    off += chunk.length;
  }
  return {
    asset: { version: "2.0", generator: "shaderpath-capstone-product" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "Product" }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    // TODO 4: tune baseColorFactor/metallicFactor/roughnessFactor for a
    // premium-product material (this placeholder is intentionally flat).
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.7, 0.7, 0.7, 1], metallicFactor: 0, roughnessFactor: 1 } }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: position.length / 3, type: "VEC3" },
      { bufferView: 1, componentType: 5126, count: normal.length / 3, type: "VEC3" },
      { bufferView: 2, componentType: 5126, count: uv.length / 2, type: "VEC2" },
      { bufferView: 3, componentType: 5125, count: index.length, type: "SCALAR" },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: pB.length, target: 34962 },
      { buffer: 0, byteOffset: pB.length, byteLength: nB.length, target: 34962 },
      { buffer: 0, byteOffset: pB.length + nB.length, byteLength: uB.length, target: 34962 },
      { buffer: 0, byteOffset: pB.length + nB.length + uB.length, byteLength: iB.length, target: 34963 },
    ],
    buffers: [{ byteLength: combined.length, uri: "data:application/octet-stream;base64," + toBase64(combined) }],
  };
}

interface ChapterProgress {
  dolly: number;
  turntable: number;
  spotlight: number;
}

/** Hoists R3F's \`invalidate\` out of the Canvas so the DOM-level scroller can call it. */
function InvalidateBridge({ invalidateRef }: { invalidateRef: RefObject<(() => void) | null> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidateRef.current = invalidate;
  }, [invalidate, invalidateRef]);
  return null;
}

function ProductScene({ progressRef }: { progressRef: RefObject<ChapterProgress> }) {
  const disposables = useDisposable();
  const modelRef = useRef<THREE.Group | null>(null);
  const spotRef = useRef<THREE.Mesh>(null);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    // TODO 1: new GLTFLoader().parse(JSON.stringify(buildProductGltf()), "",
    // onLoad, onError) -- inside onLoad, traverse the model, register every
    // Mesh's geometry/material via disposables.register(), scene.add(model),
    // store it in modelRef.current. Remove it from the scene on cleanup.
  }, [scene, disposables]);

  useFrame(({ camera }) => {
    const p = progressRef.current;
    // TODO 2: camera.position.z = 5 - p.dolly * 2.6; camera.lookAt(0, 0, 0);
    // TODO 3: if (modelRef.current) modelRef.current.rotation.y = p.turntable * Math.PI * 2;
    // TODO 3: if (spotRef.current) update its material's emissiveIntensity from p.spotlight
  });

  return (
    <>
      {/* TODO 4: ambient + directional light tuned for a premium-product look */}
      <mesh ref={spotRef} position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.15, 48]} />
        <meshStandardMaterial color="#f5d38a" emissive="#f5a623" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
    </>
  );
}

// ---- restrained post chain (Milestone 5) -------------------------------
const vignetteVert = /* glsl */ \`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
\`;
const vignetteFrag = /* glsl */ \`
  uniform sampler2D tDiffuse;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    vec2 centered = vUv - 0.5;
    float vig = 1.0 - dot(centered, centered) * uStrength;
    gl_FragColor = vec4(color * clamp(vig, 0.0, 1.0), 1.0);
  }
\`;

const BUDGET_MS = 4;

function ShowcasePostFX() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const passes = useMemo(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    // TODO 5: threshold (4th constructor arg) needs to be HIGH so only the
    // emissive spotlight ring blooms, not the whole lit product.
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.9, 0.5, 0.2);
    const outputPass = new OutputPass();
    const vignettePass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uStrength: { value: 0.65 } },
      vertexShader: vignetteVert,
      fragmentShader: vignetteFrag,
    });
    // TODO 5: composer.addPass() all four in the canonical order --
    // scene -> bloom -> tone map -> stylistic (vignette).
    return { composer, renderPass, bloomPass, outputPass, vignettePass };
  }, [gl, scene, camera]);

  useEffect(() => {
    passes.composer.setSize(size.width, size.height);
  }, [passes, size.width, size.height]);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    return () => {
      // TODO 6: dispose composer + every pass created above
    };
  }, [passes, gl]);

  const emaRef = useRef(0);
  useFrame(() => {
    const t0 = performance.now();
    passes.composer.render();
    const dt = performance.now() - t0;
    emaRef.current = emaRef.current === 0 ? dt : emaRef.current * 0.9 + dt * 0.1;
    if (emaRef.current > BUDGET_MS) {
      console.warn(\`ShowcasePostFX over budget: \${emaRef.current.toFixed(2)}ms > \${BUDGET_MS}ms\`);
    }
  }, 1);

  return null;
}

function useScrollChoreography(
  scrollerRef: RefObject<HTMLDivElement | null>,
  progressRef: RefObject<ChapterProgress>,
  invalidateRef: RefObject<(() => void) | null>,
) {
  useGsapContext(() => {
    if (!scrollerRef.current) return;
    const scroller = scrollerRef.current;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // TODO 6: set progressRef.current straight to a static pose (no
      // ScrollTrigger at all), then invalidateRef.current?.() once.
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // TODO 2: ScrollTrigger.create for ".chapter-dolly" -- trigger it,
      // scroller, start "top top", end "bottom bottom", scrub: true,
      // onUpdate writes progressRef.current.dolly = self.progress then
      // calls invalidateRef.current?.().

      // TODO 3: two more ScrollTrigger.create calls, same shape, for
      // ".chapter-turntable" -> progress.turntable and ".chapter-spotlight"
      // -> progress.spotlight. Then a gsap.utils.toArray(".chapter-copy",
      // scroller).forEach(...) loop tweening each one in via toggleActions
      // "play reverse play reverse" (autoAlpha + y, not width/top/left).
    });
  }, [scrollerRef, progressRef, invalidateRef]);
}

export function ScrollProductShowcase() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<ChapterProgress>({ dolly: 0, turntable: 0, spotlight: 0 });
  const invalidateRef = useRef<(() => void) | null>(null);

  useScrollChoreography(scrollerRef, progressRef, invalidateRef);

  return (
    <div ref={scrollerRef} style={{ height: "100vh", overflowY: "auto", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Canvas frameloop="demand" camera={{ position: [0, 0, 5], fov: 45 }}>
          <InvalidateBridge invalidateRef={invalidateRef} />
          <ProductScene progressRef={progressRef} />
          <ShowcasePostFX />
        </Canvas>
      </div>
      <section className="chapter-dolly" style={{ height: "150vh" }}>
        <p className="chapter-copy">Crafted for every angle.</p>
      </section>
      <section className="chapter-turntable" style={{ height: "150vh" }}>
        <p className="chapter-copy">Turns to show what matters.</p>
      </section>
      <section className="chapter-spotlight" style={{ height: "150vh" }}>
        <p className="chapter-copy">Detail worth the spotlight.</p>
      </section>
    </div>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import { useDisposable } from "@/lib/hooks/use-disposable";

gsap.registerPlugin(ScrollTrigger);

// ---- Milestone 1: asset pipeline ---------------------------------------
// Real project: run the source .glb through gltf-transform BEFORE it ever
// reaches this file --
//   npx @gltf-transform/cli optimize product.glb product.opt.glb \\
//     --compress draco --texture-compress ktx2
// then wire DRACOLoader/KTX2Loader on GLTFLoader BEFORE calling load():
//   const draco = new DRACOLoader().setDecoderPath("/draco/");
//   const ktx2 = new KTX2Loader().setTranscoderPath("/basis/").detectSupport(gl);
//   new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2)
//     .load("/models/product.glb", onLoad);
// This repo ships no binary assets (Track 3 rule), so the reference below
// embeds a plain (uncompressed) glTF JSON built from a real BufferGeometry
// at module load -- the exact accessor/bufferView shape GLTFLoader.parse()
// reads from a real file, only the compression and transport differ.

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function toBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out += b1 === undefined ? "=" : B64[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? "=" : B64[b2 & 63];
  }
  return out;
}

function buildProductGltf(): Record<string, unknown> {
  const geo = new THREE.CylinderGeometry(0.6, 0.75, 2.2, 32);
  const position = geo.attributes.position!.array as Float32Array;
  const normal = geo.attributes.normal!.array as Float32Array;
  const uv = geo.attributes.uv!.array as Float32Array;
  const index = Uint32Array.from(geo.index!.array);
  const toBytes = (a: Float32Array | Uint32Array) => new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  const [pB, nB, uB, iB] = [toBytes(position), toBytes(normal), toBytes(uv), toBytes(index)];
  const combined = new Uint8Array(pB.length + nB.length + uB.length + iB.length);
  let off = 0;
  for (const chunk of [pB, nB, uB, iB]) {
    combined.set(chunk, off);
    off += chunk.length;
  }
  return {
    asset: { version: "2.0", generator: "shaderpath-capstone-product" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "Product" }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    // Milestone 4: brushed-metal-ish base -- mid roughness, some metalness,
    // warm neutral tint reads as "premium" without needing an HDRI environment.
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.82, 0.78, 0.7, 1], metallicFactor: 0.35, roughnessFactor: 0.3 } }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: position.length / 3, type: "VEC3" },
      { bufferView: 1, componentType: 5126, count: normal.length / 3, type: "VEC3" },
      { bufferView: 2, componentType: 5126, count: uv.length / 2, type: "VEC2" },
      { bufferView: 3, componentType: 5125, count: index.length, type: "SCALAR" },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: pB.length, target: 34962 },
      { buffer: 0, byteOffset: pB.length, byteLength: nB.length, target: 34962 },
      { buffer: 0, byteOffset: pB.length + nB.length, byteLength: uB.length, target: 34962 },
      { buffer: 0, byteOffset: pB.length + nB.length + uB.length, byteLength: iB.length, target: 34963 },
    ],
    buffers: [{ byteLength: combined.length, uri: "data:application/octet-stream;base64," + toBase64(combined) }],
  };
}

interface ChapterProgress {
  dolly: number;
  turntable: number;
  spotlight: number;
}

/** Hoists R3F's \`invalidate\` out of the Canvas so the DOM-level scroller can call it
 *  (same bridge pattern as the scrolltrigger-plus-r3f-single-loop demo). */
function InvalidateBridge({ invalidateRef }: { invalidateRef: RefObject<(() => void) | null> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidateRef.current = invalidate;
  }, [invalidate, invalidateRef]);
  return null;
}

function ProductScene({ progressRef }: { progressRef: RefObject<ChapterProgress> }) {
  const disposables = useDisposable();
  const modelRef = useRef<THREE.Group | null>(null);
  const spotRef = useRef<THREE.Mesh>(null);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const loader = new GLTFLoader();
    let cancelled = false;
    loader.parse(
      JSON.stringify(buildProductGltf()),
      "",
      (gltf) => {
        if (cancelled) return;
        const model = gltf.scene;
        model.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            disposables.register(obj.geometry);
            disposables.register(obj.material as THREE.Material);
          }
        });
        scene.add(model);
        modelRef.current = model;
      },
      (err) => console.error("Product GLTF failed to load", err),
    );
    return () => {
      cancelled = true;
      if (modelRef.current) scene.remove(modelRef.current);
    };
  }, [scene, disposables]);

  // Single-render-loop rule (spec §8.4): useFrame ONLY reads progressRef.
  // ScrollTrigger (below) is the sole writer, and never calls render itself.
  useFrame(({ camera }) => {
    const p = progressRef.current;
    camera.position.z = 5 - p.dolly * 2.6;
    camera.lookAt(0, 0, 0);
    if (modelRef.current) {
      modelRef.current.rotation.y = p.turntable * Math.PI * 2;
    }
    if (spotRef.current) {
      const mat = spotRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + p.spotlight * 6;
    }
  });

  return (
    <>
      {/* Milestone 4: soft key + ambient fill, tuned low so the emissive ring
          still reads as the brightest thing in frame during the spotlight chapter */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={1.3} />
      <mesh ref={spotRef} position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.15, 48]} />
        <meshStandardMaterial color="#f5d38a" emissive="#f5a623" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
    </>
  );
}

// ---- Milestone 5: restrained post chain --------------------------------
const vignetteVert = /* glsl */ \`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
\`;
const vignetteFrag = /* glsl */ \`
  uniform sampler2D tDiffuse;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    vec2 centered = vUv - 0.5;
    float vig = 1.0 - dot(centered, centered) * uStrength;
    gl_FragColor = vec4(color * clamp(vig, 0.0, 1.0), 1.0);
  }
\`;

// Budget: keep the postfx layer under ~4ms at 1080p on a mid-range GPU --
// that leaves >12ms of the 16.6ms/frame (60fps) budget for scene + JS.
const BUDGET_MS = 4;

function ShowcasePostFX() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const passes = useMemo(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    // Restraint doctrine (Track 10): a HIGH threshold keeps bloom limited to
    // the emissive spotlight ring, not the whole lit product -- one
    // deliberate accent, not five stacked filters.
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.9, 0.5, 0.85);
    const outputPass = new OutputPass(); // tone map (ACES) + sRGB encode
    const vignettePass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uStrength: { value: 0.65 } },
      vertexShader: vignetteVert,
      fragmentShader: vignetteFrag,
    });
    // Canonical order: scene -> bloom -> tone map -> stylistic (vignette).
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    composer.addPass(vignettePass);
    return { composer, bloomPass, outputPass, vignettePass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    passes.composer.setSize(size.width, size.height);
  }, [passes, size.width, size.height]);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    return () => {
      passes.composer.dispose();
      passes.bloomPass.dispose();
      passes.outputPass.dispose();
      passes.vignettePass.dispose();
    };
  }, [passes, gl]);

  const emaRef = useRef(0);
  useFrame(() => {
    const t0 = performance.now();
    passes.composer.render();
    const dt = performance.now() - t0;
    emaRef.current = emaRef.current === 0 ? dt : emaRef.current * 0.9 + dt * 0.1;
    if (emaRef.current > BUDGET_MS) {
      console.warn(\`ShowcasePostFX over budget: \${emaRef.current.toFixed(2)}ms > \${BUDGET_MS}ms\`);
    }
  }, 1);

  return null;
}

function useScrollChoreography(
  scrollerRef: RefObject<HTMLDivElement | null>,
  progressRef: RefObject<ChapterProgress>,
  invalidateRef: RefObject<(() => void) | null>,
) {
  useGsapContext(() => {
    if (!scrollerRef.current) return;
    const scroller = scrollerRef.current;

    // gsap.matchMedia() created inside an active Context is auto-reverted by
    // ctx.revert() (GSAP's Context/MatchMedia integration) -- no separate
    // mm.revert() call is needed here.
    const mm = gsap.matchMedia();

    // Milestone 6: reduced-motion fallback -- one static pose, no
    // ScrollTrigger at all, then invalidate() once so it actually paints.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      progressRef.current.dolly = 0.5;
      progressRef.current.turntable = 0;
      progressRef.current.spotlight = 1;
      invalidateRef.current?.();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Milestones 2+3: one scrub ScrollTrigger per chapter, each writing
      // exactly ONE field of the shared progress object -- the single-loop
      // rule applies here too: no render() call anywhere in this file.
      const chapters: [string, keyof ChapterProgress][] = [
        [".chapter-dolly", "dolly"],
        [".chapter-turntable", "turntable"],
        [".chapter-spotlight", "spotlight"],
      ];
      for (const [selector, field] of chapters) {
        const trigger = scroller.querySelector<HTMLElement>(selector);
        if (!trigger) continue;
        ScrollTrigger.create({
          trigger,
          scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            progressRef.current[field] = self.progress;
            invalidateRef.current?.();
          },
        });
      }

      // Milestone 3: text overlays, independent of the 3D scrub -- DOM
      // tweens driven by their own toggleActions, not the progress object.
      gsap.utils.toArray<HTMLElement>(".chapter-copy", scroller).forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top 65%",
            toggleActions: "play reverse play reverse",
          },
        });
      });
    });
  }, [scrollerRef, progressRef, invalidateRef]);
}

export function ScrollProductShowcase() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<ChapterProgress>({ dolly: 0, turntable: 0, spotlight: 0 });
  const invalidateRef = useRef<(() => void) | null>(null);

  useScrollChoreography(scrollerRef, progressRef, invalidateRef);

  // Layout kept minimal on purpose -- a real page would grid the canvas
  // against a text column so overlay copy never sits under the model; this
  // reference focuses on the scroll choreography and render wiring.
  return (
    <div ref={scrollerRef} style={{ height: "100vh", overflowY: "auto", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Canvas frameloop="demand" camera={{ position: [0, 0, 5], fov: 45 }}>
          <InvalidateBridge invalidateRef={invalidateRef} />
          <ProductScene progressRef={progressRef} />
          <ShowcasePostFX />
        </Canvas>
      </div>
      <section className="chapter-dolly" style={{ height: "150vh" }}>
        <p className="chapter-copy">Crafted for every angle.</p>
      </section>
      <section className="chapter-turntable" style={{ height: "150vh" }}>
        <p className="chapter-copy">Turns to show what matters.</p>
      </section>
      <section className="chapter-spotlight" style={{ height: "150vh" }}>
        <p className="chapter-copy">Detail worth the spotlight.</p>
      </section>
    </div>
  );
}`,
    hints: [
      {
        vi: "Ba \`ScrollTrigger\` chapter (dolly/turntable/spotlight) đều ghi vào cùng MỘT object \`progressRef.current\` — mỗi trigger chỉ chạm đúng field của mình, và \`useFrame\` phía R3F là nơi DUY NHẤT đọc lại object đó rồi apply lên camera/model/material. Không nơi nào trong file này được gọi \`renderer.render()\`/\`composer.render()\` ngoài \`useFrame\` của \`ShowcasePostFX\`.",
        en: "The three chapter ScrollTriggers (dolly/turntable/spotlight) all write into the SAME \`progressRef.current\` object — each trigger only touches its own field, and R3F's \`useFrame\` is the ONLY place that reads it back and applies it to the camera/model/material. Nowhere else in this file should call \`renderer.render()\`/\`composer.render()\` except \`ShowcasePostFX\`'s \`useFrame\`.",
      },
      {
        vi: "\`invalidateRef\` phải được set từ BÊN TRONG \`<Canvas>\` (component \`InvalidateBridge\` gọi \`useThree((s) => s.invalidate)\`), rồi mới đọc được ở ngoài bởi \`useScrollChoreography\` — DOM scroller không có quyền truy cập trực tiếp instance R3F bên trong Canvas.",
        en: "\`invalidateRef\` has to be set from INSIDE \`<Canvas>\` (the \`InvalidateBridge\` component calling \`useThree((s) => s.invalidate)\`) before \`useScrollChoreography\` outside can read it — the DOM-level scroller has no direct access to the R3F instance living inside the Canvas.",
      },
      {
        vi: "Ngưỡng \`threshold\` của \`UnrealBloomPass\` (tham số thứ 4 trong constructor) phải đủ CAO để chỉ vành \`emissive\` nhấp nháy phát sáng, không phải toàn bộ product — nếu cả cảnh đều bloom, đó là dấu hiệu ngưỡng đang quá thấp cho phong cách tiết chế mà mốc 5 yêu cầu.",
        en: "The \`threshold\` parameter of \`UnrealBloomPass\` (the 4th constructor argument) needs to be HIGH enough that only the emissive ring blooms, not the whole product — if the entire scene starts glowing, the threshold is too low for the restrained look milestone 5 asks for.",
      },
    ],
    checklist: [
      {
        vi: "Model GLTF thật (hoặc nhúng đại diện) tải được qua \`GLTFLoader.parse()\` và hiện trong scene ngay khi mount",
        en: "The real (or embedded stand-in) GLTF model loads through \`GLTFLoader.parse()\` and appears in the scene right on mount",
      },
      {
        vi: "Camera dolly, model turntable và spotlight vật liệu đều đọc từ đúng MỘT \`progressRef\`, không có state React nào theo dõi giá trị scroll ở tốc độ cuộn",
        en: "Camera dolly, model turntable, and the material spotlight all read from exactly ONE \`progressRef\`, with no React state tracking the scroll value at scroll rate",
      },
      {
        vi: "Không có lệnh render/composer.render nào chạy ngoài đúng một \`useFrame\` — kiểm tra bằng cách grep \`.render(\` trong toàn bộ file",
        en: "No render/composer.render call runs outside exactly one \`useFrame\` — verify by grepping \`.render(\` across the whole file",
      },
      {
        vi: "Ba chapter cuộn mượt, mỗi chapter chỉ ảnh hưởng đúng một khía cạnh (dolly/turntable/spotlight) mà không làm nhảy giá trị của hai chapter còn lại",
        en: "All three chapters scrub smoothly, each affecting exactly one aspect (dolly/turntable/spotlight) without jumping the other two chapters' values",
      },
      {
        vi: "Text overlay (\`.chapter-copy\`) vào/ra đúng theo \`toggleActions\` khi cuộn qua/lùi khỏi chapter tương ứng",
        en: "Text overlays (\`.chapter-copy\`) enter/exit correctly via \`toggleActions\` when scrolling into/back out of their chapter",
      },
      {
        vi: "Chuỗi post-processing chỉ bloom đúng vành emissive (không phải toàn cảnh) cộng một vignette nhẹ, và ngân sách composer.render() được đo bằng EMA thật, có log cảnh báo khi vượt",
        en: "The post-processing chain blooms only the emissive ring (not the whole scene) plus a subtle vignette, and composer.render()'s budget is measured with a real EMA that logs a warning when exceeded",
      },
      {
        vi: "Bật \`prefers-reduced-motion: reduce\` (DevTools rendering tab) tắt hoàn toàn 3 ScrollTrigger scrub, hiện thẳng một pose tĩnh duy nhất",
        en: "Enabling \`prefers-reduced-motion: reduce\` (DevTools rendering tab) fully disables all 3 scrub ScrollTriggers and shows a single static pose directly",
      },
      {
        vi: "Mount/unmount \`ScrollProductShowcase\` nhiều lần không rò rỉ — composer, mọi pass tự tạo, và geometry/material của model đều được dispose qua \`useDisposable\`/cleanup",
        en: "Mounting/unmounting \`ScrollProductShowcase\` repeatedly leaks nothing — the composer, every self-created pass, and the model's geometry/material are all disposed via \`useDisposable\`/cleanup",
      },
    ],
  },
];
