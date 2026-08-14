"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";

const LABELS = {
  vi: {
    title: "Material Lab — metal/rust sphere, bộ map ORM procedural",
    albedo: "Map Albedo",
    metalnessMap: "Map Metalness (kênh B)",
    roughnessMap: "Map Roughness (kênh G)",
    normalMap: "Map Normal (tangent-space)",
    aoMap: "Map AO (kênh R)",
    metalness: "Metalness (khi tắt map)",
    roughness: "Roughness (khi tắt map)",
    wrongColorSpace: "Sai color space Albedo (bug minh hoạ)",
  },
  en: {
    title: "Material Lab — Metal/Rust Sphere, Procedural ORM Set",
    albedo: "Albedo map",
    metalnessMap: "Metalness map (B channel)",
    roughnessMap: "Roughness map (G channel)",
    normalMap: "Normal map (tangent-space)",
    aoMap: "AO map (R channel)",
    metalness: "Metalness (when map off)",
    roughness: "Roughness (when map off)",
    wrongColorSpace: "Wrong Albedo color space (bug demo)",
  },
} as const;

const SIZE = 256;
const NORMAL_SIZE = 128;

// Fixed, deterministic "rust patch" centers — no Math.random(), matches the
// house convention (see three-injected-uniforms demo). Same mask drives both
// the metalness (B) channel and the albedo tint, so the two visibly agree.
const BLOTCHES = [
  { cx: 0.22, cy: 0.32, r: 0.17 },
  { cx: 0.7, cy: 0.24, r: 0.13 },
  { cx: 0.48, cy: 0.74, r: 0.21 },
  { cx: 0.86, cy: 0.68, r: 0.11 },
];

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

// 0 = clean metal, 1 = rust/paint core. The transition band (edge0..edge1)
// is where fractional mask values live — the ONLY physically-motivated
// source of in-between metalness (see theory: mask edges, not "half-metal").
function rustMask(u: number, v: number): number {
  let m = 0;
  for (const b of BLOTCHES) {
    const d = Math.hypot(u - b.cx, v - b.cy) / b.r;
    m = Math.max(m, 1 - smoothstep(0.82, 1.0, d));
  }
  return m;
}

function hash(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// R = AO (thin seam grid, crevice darkening), G = roughness (smooth->rough
// gradient, rougher inside rust), B = metalness (rust mask, inverted).
// One texture, three uses — the ORM channel-packing convention (verified
// against three's roughnessmap/metalnessmap/aomap fragment chunks).
function makeOrmTexture(): THREE.DataTexture {
  const data = new Uint8Array(SIZE * SIZE * 4);
  const seamSpacing = SIZE / 6;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE;
      const v = y / SIZE;
      const mask = rustMask(u, v);

      const distToSeam = Math.min(x % seamSpacing, seamSpacing - (x % seamSpacing), y % seamSpacing, seamSpacing - (y % seamSpacing));
      const seamDark = 1 - smoothstep(0, 3, distToSeam);
      const ao = 235 - seamDark * 130;

      const roughBase = 70 + u * 130 + hash(x, y) * 12;
      const roughness = Math.min(255, roughBase + mask * 45);

      const metalness = 245 * (1 - mask) + 15 * mask;

      const i = (y * SIZE + x) * 4;
      data[i] = ao;
      data[i + 1] = roughness;
      data[i + 2] = metalness;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
  tex.colorSpace = THREE.NoColorSpace; // ORM is non-color data, never sRGB
  tex.needsUpdate = true;
  return tex;
}

// Albedo: steel-gray where the ORM mask says "metal", rust orange where it
// says "rust" — same mask as makeOrmTexture so the two maps visibly agree.
// Flat colors only, no baked shading (see theory: "no lighting baked in").
function makeAlbedoTexture(): THREE.DataTexture {
  const data = new Uint8Array(SIZE * SIZE * 4);
  const metal: [number, number, number] = [150, 156, 162];
  const rust: [number, number, number] = [150, 82, 36];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE;
      const v = y / SIZE;
      const mask = rustMask(u, v);
      const jitter = (hash(x + 91, y + 17) - 0.5) * 14;
      const i = (y * SIZE + x) * 4;
      data[i] = Math.max(0, Math.min(255, metal[0] + (rust[0] - metal[0]) * mask + jitter));
      data[i + 1] = Math.max(0, Math.min(255, metal[1] + (rust[1] - metal[1]) * mask + jitter));
      data[i + 2] = Math.max(0, Math.min(255, metal[2] + (rust[2] - metal[2]) * mask + jitter));
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace; // albedo IS color data — the correct default
  tex.needsUpdate = true;
  return tex;
}

// Tangent-space normal map: a periodic height field, converted to normals
// via a central-difference gradient — no binary asset, no THREE.CanvasTexture
// round-trip needed for this one.
function makeNormalTexture(): THREE.DataTexture {
  const size = NORMAL_SIZE;
  const height = (x: number, y: number) => {
    const u = x / size;
    const v = y / size;
    return (
      Math.sin(u * Math.PI * 10) * Math.cos(v * Math.PI * 10) * 0.5 +
      Math.sin((u + v) * Math.PI * 24) * 0.15
    );
  };

  const data = new Uint8Array(size * size * 4);
  const strength = 1.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = height(x + 1, y) - height(x - 1, y);
      const dy = height(x, y + 1) - height(x, y - 1);
      const n = new THREE.Vector3(-dx * strength, -dy * strength, 1).normalize();
      const i = (y * size + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.NoColorSpace; // normal maps are non-color data too
  tex.needsUpdate = true;
  return tex;
}

function MaterialLabSphere() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();
  const meshRef = useRef<Mesh>(null);

  const albedoTex = useMemo(() => disposables.register(makeAlbedoTexture()), [disposables]);
  const ormTex = useMemo(() => disposables.register(makeOrmTexture()), [disposables]);
  const normalTex = useMemo(() => disposables.register(makeNormalTexture()), [disposables]);
  const material = useMemo(
    () => disposables.register(new THREE.MeshStandardMaterial()),
    [disposables],
  );

  useEffect(() => {
    const albedoOn = booleanOf(values, "albedo", true);
    const metalnessMapOn = booleanOf(values, "metalnessMap", true);
    const roughnessMapOn = booleanOf(values, "roughnessMap", true);
    const normalMapOn = booleanOf(values, "normalMap", true);
    const aoMapOn = booleanOf(values, "aoMap", true);
    const wrongColorSpace = booleanOf(values, "wrongColorSpace", false);
    const metalnessScalar = numberOf(values, "metalness", 0.5);
    const roughnessScalar = numberOf(values, "roughness", 0.5);

    // The classic bug (see theory Callout): the GPU only decodes sRGB->linear
    // at sample time if colorSpace says so. Flip it and re-upload.
    albedoTex.colorSpace = wrongColorSpace ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    albedoTex.needsUpdate = true;

    material.map = albedoOn ? albedoTex : null;
    material.metalnessMap = metalnessMapOn ? ormTex : null;
    material.roughnessMap = roughnessMapOn ? ormTex : null;
    material.aoMap = aoMapOn ? ormTex : null;
    material.normalMap = normalMapOn ? normalTex : null;
    material.aoMapIntensity = aoMapOn ? 1 : 0;

    // When a map drives a channel, its scalar factor must sit at 1 so the
    // map alone controls the per-pixel value (three multiplies the two —
    // see roughnessmap_fragment.glsl.js / metalnessmap_fragment.glsl.js).
    material.metalness = metalnessMapOn ? 1 : metalnessScalar;
    material.roughness = roughnessMapOn ? 1 : roughnessScalar;

    // Adding/removing a map toggles a compile-time #ifdef (USE_MAP etc.) —
    // without this the renderer keeps using the already-compiled program.
    material.needsUpdate = true;
    invalidate();
  }, [values, material, albedoTex, ormTex, normalTex, invalidate]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.18;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1.3, 128, 96]} />
    </mesh>
  );
}

function Lighting() {
  return (
    <>
      <hemisphereLight args={["#cfe0ff", "#20140c", 0.55]} />
      <directionalLight position={[3.5, 4, 2.5]} intensity={2.4} />
    </>
  );
}

export default function MetalnessRoughnessWorkflowDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        { kind: "boolean", key: "albedo", label: L.albedo, defaultValue: true },
        { kind: "boolean", key: "metalnessMap", label: L.metalnessMap, defaultValue: true },
        { kind: "boolean", key: "roughnessMap", label: L.roughnessMap, defaultValue: true },
        { kind: "boolean", key: "normalMap", label: L.normalMap, defaultValue: true },
        { kind: "boolean", key: "aoMap", label: L.aoMap, defaultValue: true },
        {
          kind: "number",
          key: "metalness",
          label: L.metalness,
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.5,
        },
        {
          kind: "number",
          key: "roughness",
          label: L.roughness,
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.5,
        },
        { kind: "boolean", key: "wrongColorSpace", label: L.wrongColorSpace, defaultValue: false },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 4], fov: 42 }}>
        <color attach="background" args={["#0a0d13"]} />
        <Lighting />
        <MaterialLabSphere />
      </DemoCanvas>
    </Demo>
  );
}
