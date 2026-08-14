"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fresnelVert from "./fresnel-object.vert";
import fresnelFrag from "./fresnel-object.frag";

const LABELS = {
  vi: {
    title: "Bể nước & dãy vật liệu — Fresnel theo góc nhìn",
    viewAngle: "Góc nhìn (độ, 90° = nhìn thẳng xuống)",
    material: "Vật liệu nổi bật (đường cong F(θ))",
    schlick: "Dùng Schlick (tắt = F0 hằng số)",
    curveTitle: "F(θ) — vật liệu nổi bật",
  },
  en: {
    title: "Water & Material Row — Fresnel by Viewing Angle",
    viewAngle: "View angle (degrees, 90° = looking straight down)",
    material: "Highlighted material (F(θ) curve)",
    schlick: "Use Schlick (off = constant F0)",
    curveTitle: "F(θ) — highlighted material",
  },
} as const;

type Vec3 = [number, number, number];

interface Labels {
  title: string;
  viewAngle: string;
  material: string;
  schlick: string;
  curveTitle: string;
}

interface Preset {
  key: string;
  f0: Vec3;
  base: Vec3;
  env: Vec3;
  label: { vi: string; en: string };
}

// F0/base/env recipe: dielectrics keep a colored base (the "transmitted"
// look) with a bright tinted env (what grazing angle reflects); metals get
// a near-black base + white env so F0 alone carries their color (see theory
// "Kim loai: F0 chinh la mau"). F0 values sourced in references.ts.
const PRESETS: Preset[] = [
  {
    key: "water",
    f0: [0.02, 0.02, 0.02],
    base: [0.03, 0.1, 0.16],
    env: [0.75, 0.88, 1.0],
    label: { vi: "Nước", en: "Water" },
  },
  {
    key: "glass",
    f0: [0.04, 0.04, 0.04],
    base: [0.05, 0.05, 0.06],
    env: [0.85, 0.92, 1.0],
    label: { vi: "Kính", en: "Glass" },
  },
  {
    key: "plastic",
    f0: [0.04, 0.04, 0.04],
    base: [0.62, 0.1, 0.12],
    env: [0.92, 0.92, 0.95],
    label: { vi: "Nhựa", en: "Plastic" },
  },
  {
    key: "gold",
    f0: [1.0, 0.85, 0.57],
    base: [0.02, 0.02, 0.02],
    env: [1.0, 1.0, 1.0],
    label: { vi: "Vàng", en: "Gold" },
  },
  {
    key: "copper",
    f0: [0.97, 0.74, 0.62],
    base: [0.02, 0.02, 0.02],
    env: [1.0, 1.0, 1.0],
    label: { vi: "Đồng", en: "Copper" },
  },
];

const WATER = PRESETS[0]!;

function luminance([r, g, b]: Vec3): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function schlick(f0: number, cosTheta: number): number {
  const t = Math.min(Math.max(1 - cosTheta, 0), 1);
  return f0 + (1 - f0) * t ** 5;
}

function useFresnelUniforms(preset: Preset) {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const uniforms = useMemo(
    () => ({
      uF0: { value: new THREE.Color(...preset.f0) },
      uUseSchlick: { value: 1 },
      uBaseColor: { value: new THREE.Color(...preset.base) },
      uEnvColor: { value: new THREE.Color(...preset.env) },
    }),
    [preset],
  );
  useEffect(() => {
    uniforms.uUseSchlick.value = booleanOf(values, "schlick", true) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);
  return uniforms;
}

function FresnelSphere({
  preset,
  position,
  radius,
}: {
  preset: Preset;
  position: [number, number, number];
  radius: number;
}) {
  const uniforms = useFresnelUniforms(preset);
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 64, 48]} />
      <shaderMaterial
        vertexShader={fresnelVert}
        fragmentShader={fresnelFrag}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function WaterPlane() {
  const uniforms = useFresnelUniforms(WATER);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 16]} />
      <shaderMaterial
        vertexShader={fresnelVert}
        fragmentShader={fresnelFrag}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Thin backface-only shell around a sphere — a standard outline trick, used
// here to ring whichever preset the "material" select is currently pointing at.
function HighlightRing({
  position,
  radius,
}: {
  position: [number, number, number];
  radius: number;
}) {
  return (
    <mesh position={position} scale={1.14}>
      <sphereGeometry args={[radius, 32, 24]} />
      <meshBasicMaterial color="#ffffff" side={THREE.BackSide} transparent opacity={0.85} />
    </mesh>
  );
}

// Elevation-only orbit: elevationDeg=90 looks straight down (theta=0, F=F0);
// elevationDeg near 0 is a grazing view across the water plane (theta->90, F->1).
function CameraRig({ elevationDeg }: { elevationDeg: number }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const radius = 7.5;
    const target = new THREE.Vector3(0, 0.4, 0);
    const elev = THREE.MathUtils.degToRad(elevationDeg);
    const azim = THREE.MathUtils.degToRad(18);
    const horiz = radius * Math.cos(elev);
    camera.position.set(
      horiz * Math.sin(azim),
      target.y + radius * Math.sin(elev),
      horiz * Math.cos(azim),
    );
    camera.lookAt(target);
    invalidate();
  }, [camera, invalidate, elevationDeg]);
  return null;
}

function Scene({ highlightKey }: { highlightKey: string }) {
  const { values } = useDemoContext();
  const elevation = numberOf(values, "viewAngle", 35);
  const spacing = 1.55;
  const sphereRadius = 0.5;

  return (
    <>
      <color attach="background" args={["#0a0d13"]} />
      <CameraRig elevationDeg={elevation} />
      <WaterPlane />
      {PRESETS.map((preset, i) => {
        const x = (i - (PRESETS.length - 1) / 2) * spacing;
        const position: [number, number, number] = [x, sphereRadius, 0];
        return (
          <group key={preset.key}>
            <FresnelSphere preset={preset} position={position} radius={sphereRadius} />
            {preset.key === highlightKey && (
              <HighlightRing position={position} radius={sphereRadius} />
            )}
          </group>
        );
      })}
    </>
  );
}

// Pure-DOM SVG readout — mirrors the exact JS math above, no WebGL involved.
function FresnelCurveInset({
  preset,
  thetaDeg,
  schlickOn,
  L,
}: {
  preset: Preset;
  thetaDeg: number;
  schlickOn: boolean;
  L: Labels;
}) {
  const f0 = luminance(preset.f0);
  const steps = 18;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const theta = (i / steps) * 90;
    const cosT = Math.cos(THREE.MathUtils.degToRad(theta));
    const f = schlickOn ? schlick(f0, cosT) : f0;
    return `${(theta / 90) * 100},${100 - f * 100}`;
  }).join(" ");

  const curCos = Math.cos(THREE.MathUtils.degToRad(thetaDeg));
  const curF = schlickOn ? schlick(f0, curCos) : f0;
  const markerX = (thetaDeg / 90) * 100;
  const markerY = 100 - curF * 100;

  return (
    <div className="absolute top-3 right-3 w-40 rounded-lg border bg-background/85 p-2 backdrop-blur-sm">
      <div className="mb-1 text-[10px] text-muted-foreground">{L.curveTitle}</div>
      <svg viewBox="0 0 100 100" className="h-20 w-full overflow-visible">
        <polyline points="0,0 0,100 100,100" fill="none" stroke="currentColor" strokeOpacity={0.15} />
        <polyline points={points} fill="none" stroke="#5ac8fa" strokeWidth={2.5} />
        <circle cx={markerX} cy={markerY} r={3} fill="#ffb454" />
      </svg>
      <div className="mt-1 font-mono text-[10px] leading-tight">
        <div>F0 ≈ {f0.toFixed(2)} · θ ≈ {thetaDeg.toFixed(0)}°</div>
        <div>F(θ) ≈ {curF.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default function FresnelAndSchlickDemo() {
  const locale = useLocale();
  const L: Labels = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        {
          kind: "number",
          key: "viewAngle",
          label: L.viewAngle,
          min: 5,
          max: 90,
          step: 1,
          defaultValue: 35,
        },
        {
          kind: "select",
          key: "material",
          label: L.material,
          defaultValue: "water",
          options: PRESETS.map((p) => ({ value: p.key, label: p.label[locale as "vi" | "en"] ?? p.label.vi })),
        },
        { kind: "boolean", key: "schlick", label: L.schlick, defaultValue: true },
      ]}
    >
      <DemoInner L={L} />
    </Demo>
  );
}

// Split out so useDemoContext (needs the <Demo> provider above) can read the
// "material"/"viewAngle"/"schlick" control values for the DOM-side SVG inset.
function DemoInner({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const highlightKey = stringOf(values, "material", "water");
  const elevation = numberOf(values, "viewAngle", 35);
  const schlickOn = booleanOf(values, "schlick", true);
  const highlighted = PRESETS.find((p) => p.key === highlightKey) ?? WATER;

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [3, 3.5, 7], fov: 45 }}>
        <Scene highlightKey={highlightKey} />
      </DemoCanvas>
      <FresnelCurveInset
        preset={highlighted}
        thetaDeg={90 - elevation}
        schlickOn={schlickOn}
        L={L}
      />
    </div>
  );
}
