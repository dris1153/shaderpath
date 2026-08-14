"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./equation-anatomy.frag";
import vertexShader from "./equation-anatomy.vert";

// Must match #define MAX_LIGHTS in equation-anatomy.frag -- the uLightDir
// uniform array is always fully-sized (Three requires it), unused slots
// past uLightCount are simply never read (loop `break`, see frag shader).
const MAX_LIGHTS = 32;

type Term = "emission" | "diffuse" | "specular" | "combined";

const LABELS = {
  vi: {
    title: "Giải phẫu phương trình: cô lập từng số hạng của Lo",
    term: "Số hạng cô lập",
    optEmission: "Le — chỉ phát xạ",
    optDiffuse: "∫fr·Li·(n·ωi) — xấp xỉ diffuse",
    optSpecular: "fr đặc quyền — chóp specular",
    optCombined: "Lo — kết hợp tất cả",
    lightCount: "Số đèn mẫu (N, xấp xỉ tích phân)",
    formula: (mode: Term, n: number) =>
      mode === "emission"
        ? "Lo(x,ωo) ≈ Le(x,ωo)"
        : mode === "diffuse"
          ? `Lo(x,ωo) ≈ Σᵢ₌₁..${n} fr·Li·(n·ωᵢ)·(1/${n})  — N=${n} mẫu rời rạc`
          : mode === "specular"
            ? "Lo(x,ωo) ≈ fr_spec(x,ωi,ωo)·Li·(n·ωi)"
            : `Lo = Le + ∫Ω fr·Li·(n·ωi) dωi   (≈ tổng N=${n} mẫu)`,
  },
  en: {
    title: "Equation Anatomy: Isolating Each Term of Lo",
    term: "Isolated term",
    optEmission: "Le — emission only",
    optDiffuse: "∫fr·Li·(n·ωi) — diffuse approx.",
    optSpecular: "fr's specular lobe",
    optCombined: "Lo — all combined",
    lightCount: "Sample light count (N, integral approx.)",
    formula: (mode: Term, n: number) =>
      mode === "emission"
        ? "Lo(x,ωo) ≈ Le(x,ωo)"
        : mode === "diffuse"
          ? `Lo(x,ωo) ≈ Σᵢ₌₁..${n} fr·Li·(n·ωᵢ)·(1/${n})  — N=${n} discrete samples`
          : mode === "specular"
            ? "Lo(x,ωo) ≈ fr_spec(x,ωi,ωo)·Li·(n·ωi)"
            : `Lo = Le + ∫Ω fr·Li·(n·ωi) dωi   (≈ sum of N=${n} samples)`,
  },
} as const;

const MODE_INDEX: Record<Term, number> = {
  emission: 0,
  diffuse: 1,
  specular: 2,
  combined: 3,
};

// Evenly spreads `n` directions over the upper hemisphere (y-up) using a
// Fibonacci lattice -- a cheap stand-in for uniformly sampling Omega. Always
// returns MAX_LIGHTS entries (padded with the pole direction) because Three
// requires a fixed-size array matching the GLSL `uLightDir[MAX_LIGHTS]` decl.
function hemisphereDirections(n: number): THREE.Vector3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dirs: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const cosPhi = (i + 0.5) / n; // (0,1): height above the horizon
    const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
    const theta = i * golden;
    dirs.push(
      new THREE.Vector3(
        Math.cos(theta) * sinPhi,
        cosPhi,
        Math.sin(theta) * sinPhi,
      ),
    );
  }
  while (dirs.length < MAX_LIGHTS) dirs.push(new THREE.Vector3(0, 1, 0));
  return dirs;
}

function EquationAnatomySphere() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uMode: { value: MODE_INDEX.combined },
      uLightCount: { value: 8 },
      uLightDir: { value: hemisphereDirections(8) },
      uSkyColor: { value: new THREE.Color("#bcd4ff") },
      uBaseColor: { value: new THREE.Color("#e0522f") },
      uEmissiveColor: { value: new THREE.Color("#3a2a12") },
      uKeyLightDir: { value: new THREE.Vector3(0.5, 0.6, 0.7).normalize() },
      uShininess: { value: 48 },
    }),
    [],
  );

  useEffect(() => {
    const term = stringOf(values, "term", "combined") as Term;
    const count = Math.max(1, Math.round(numberOf(values, "lightCount", 8)));
    uniforms.uMode.value = MODE_INDEX[term] ?? MODE_INDEX.combined;
    uniforms.uLightCount.value = count;
    uniforms.uLightDir.value = hemisphereDirections(count);
    invalidate();
  }, [values, uniforms, invalidate]);

  // Slow idle spin so every control combination is visible from more than
  // one angle -- the container's own RAF pump (useVisibleFrameloop) already
  // keeps this canvas rendering while visible, so no manual invalidate here.
  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Reads control values from context -- must live INSIDE <Demo>'s children,
// since DemoContextProvider only wraps the children Demo is given.
function FormulaLabel({ L }: { L: (typeof LABELS)[keyof typeof LABELS] }) {
  const { values } = useDemoContext();
  const term = stringOf(values, "term", "combined") as Term;
  const lightCount = Math.max(1, Math.round(numberOf(values, "lightCount", 8)));
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
      {L.formula(term, lightCount)}
    </div>
  );
}

export default function RenderingEquationIntuitionDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "term",
          label: L.term,
          defaultValue: "combined",
          options: [
            { value: "emission", label: L.optEmission },
            { value: "diffuse", label: L.optDiffuse },
            { value: "specular", label: L.optSpecular },
            { value: "combined", label: L.optCombined },
          ],
        },
        {
          kind: "number",
          key: "lightCount",
          label: L.lightCount,
          min: 1,
          max: MAX_LIGHTS,
          step: 1,
          defaultValue: 8,
        },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 0, 3.4], fov: 45 }}>
          <EquationAnatomySphere />
        </DemoCanvas>
        <FormulaLabel L={L} />
      </div>
    </Demo>
  );
}
