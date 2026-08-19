"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import type { ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./wave.frag";
import vertexShader from "./wave.vert";

const LABELS = {
  vi: {
    title: "ShaderMaterial thuần vs helper shaderMaterial của drei",
    plainLabel: "Thuần — ref + useFrame",
    dreiLabel: "drei — uniform là prop",
    color: "Màu sóng",
    blue: "Xanh dương",
    orange: "Cam",
    green: "Xanh lá",
  },
  en: {
    title: "Plain ShaderMaterial vs drei's shaderMaterial Helper",
    plainLabel: "Plain — ref + useFrame",
    dreiLabel: "drei — uniform as a prop",
    color: "Wave color",
    blue: "Blue",
    orange: "Orange",
    green: "Green",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

const COLORS = {
  blue: "#4da6ff",
  orange: "#ff8a3d",
  green: "#4dd68a",
} as const;

function colorHexFor(key: string): string {
  return key in COLORS ? COLORS[key as keyof typeof COLORS] : COLORS.blue;
}

// Built ONCE at module scope. Calling shaderMaterial()/extend() inside a
// component body would mint a brand new class (and a new .key) every
// render — see this lesson's mistake callout.
const WaveMaterialImpl = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(COLORS.blue) },
  vertexShader,
  fragmentShader,
);
extend({ WaveMaterial: WaveMaterialImpl });

// R3F v9 types JSX elements via the ThreeElements interface — this is the
// module augmentation that makes <waveMaterial uColor="..." /> type-check.
declare module "@react-three/fiber" {
  interface ThreeElements {
    waveMaterial: ThreeElement<typeof WaveMaterialImpl>;
  }
}

// Plain path: the boilerplate this lesson is about. Uniforms object
// identity must stay stable (Track 4 discipline) — useMemo with [] deps,
// never a fresh {} per render. The memoized object itself (not a ref to the
// material) is the stable handle both uTime and uColor get mutated through.
function PlainWave({ colorHex }: { colorHex: string }) {
  // colorHex seeds the INITIAL value only — identity must stay stable, so
  // it's deliberately left out of the deps; later changes flow through the
  // useEffect below instead of ever recreating this object.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(colorHex) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uColor.value.set(colorHex);
  }, [colorHex, uniforms]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });


  const bindUniforms = useSharedUniforms(uniforms);
  return (
    <mesh rotation-x={-0.6}>
      <planeGeometry args={[2.6, 2.6, 48, 48]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        ref={bindUniforms}
      />
    </mesh>
  );
}

// drei path: uColor travels as a reactive JSX prop (R3F's applyProps calls
// uColor.set(colorHex) on the existing THREE.Color, same as color="..." on
// any built-in material). uTime still goes through a ref — it changes every
// frame, and re-rendering React 60x/s just to set one number is real
// reconciler overhead the plain path never had to think about either.
function DreiWave({ colorHex }: { colorHex: string }) {
  const materialRef = useRef<InstanceType<typeof WaveMaterialImpl>>(null);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uTime = state.clock.elapsedTime;
  });

  return (
    <mesh rotation-x={-0.6}>
      <planeGeometry args={[2.6, 2.6, 48, 48]} />
      <waveMaterial ref={materialRef} key={WaveMaterialImpl.key} uColor={colorHex} />
    </mesh>
  );
}

function WaveSide({
  variant,
  colorHex,
  label,
}: {
  variant: "plain" | "drei";
  colorHex: string;
  label: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <DemoCanvas camera={{ position: [0, 1.6, 3.4], fov: 45 }}>
        {variant === "plain" ? (
          <PlainWave colorHex={colorHex} />
        ) : (
          <DreiWave colorHex={colorHex} />
        )}
      </DemoCanvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-2">
        <span className="bg-background/85 rounded px-2 py-1 text-xs font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}

function WaveComparison({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const colorHex = colorHexFor(stringOf(values, "color", "blue"));

  return (
    <div className="divide-border flex size-full divide-x">
      <WaveSide variant="plain" colorHex={colorHex} label={L.plainLabel} />
      <WaveSide variant="drei" colorHex={colorHex} label={L.dreiLabel} />
    </div>
  );
}

export default function DreiShaderMaterialHelperDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={2}
      controls={[
        {
          kind: "select",
          key: "color",
          label: L.color,
          defaultValue: "blue",
          options: [
            { value: "blue", label: L.blue },
            { value: "orange", label: L.orange },
            { value: "green", label: L.green },
          ],
        },
      ]}
    >
      <WaveComparison L={L} />
    </Demo>
  );
}
