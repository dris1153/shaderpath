"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import twistDisplacement from "./twist-displacement.glsl";
import colorBand from "./color-band.glsl";

const LABELS = {
  vi: {
    hint: "Kéo độ xoắn lên cao trong khi vẫn bật đổ bóng: hình vặn đi mà bóng vặn theo đúng như vậy. Lighting gốc của three vẫn lo phần đó, bạn không hề viết lại.",
    title: "onBeforeCompile — vặn xoắn MeshStandardMaterial, giữ nguyên lighting/shadow",
    twist: "Độ xoắn (uTwist)",
    effect: "Hiệu ứng onBeforeCompile",
    shadows: "Đổ bóng",
  },
  en: {
    hint: "Crank the twist up with shadows still on: the shape distorts and its shadow distorts with it. The original three lighting still handles that; you never rewrote it.",
    title: "onBeforeCompile — Twisting MeshStandardMaterial Without Losing Lighting/Shadows",
    twist: "Twist amount (uTwist)",
    effect: "onBeforeCompile effect",
    shadows: "Shadows",
  },
} as const;

// Both materials are built by this ONE factory, so their `onBeforeCompile`
// closures share the exact same source text — only `effectOn` differs by
// closure capture. Material's default customProgramCacheKey() calls
// `this.onBeforeCompile.toString()`, which can't see that difference, so an
// explicit customProgramCacheKey below is what actually keeps the two
// variants from colliding in Three's program cache (see the lesson's
// mistake #2 for what happens without it).
function createTwistMaterial(
  effectOn: boolean,
  twistUniform: { value: number },
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#caa06a"),
    roughness: 0.4,
    metalness: 0.2,
  });

  material.onBeforeCompile = (shader) => {
    if (!effectOn) return;

    shader.uniforms.uTwist = twistUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>\nuniform float uTwist;\nvarying float vBand;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${twistDisplacement}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying float vBand;`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>\n${colorBand}`,
      );
  };

  material.customProgramCacheKey = () => (effectOn ? "twist-on" : "twist-off");

  return material;
}

function TwistedKnot({ shadowsOn }: { shadowsOn: boolean }) {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();

  // Stable object identity: mutating .value later updates the GPU uniform
  // without ever recompiling or recreating a material.
  const twistUniform = useMemo(() => ({ value: 1.2 }), []);

  const geometry = useMemo(
    // A sphere maps onto itself under a per-slice Y twist (nothing visibly
    // moves) — a torus knot has no such symmetry, so the twist reads.
    // Normals are NOT counter-rotated by the chunk, so shading swims
    // slightly at high twist — the classic displacement caveat.
    () => disposables.register(new THREE.TorusKnotGeometry(0.62, 0.24, 220, 40)),
    [disposables],
  );
  const materialOn = useMemo(
    () => disposables.register(createTwistMaterial(true, twistUniform)),
    [disposables, twistUniform],
  );
  const materialOff = useMemo(
    () => disposables.register(createTwistMaterial(false, twistUniform)),
    [disposables, twistUniform],
  );

  const effectOn = booleanOf(values, "effect", true);

  useEffect(() => {
    twistUniform.value = numberOf(values, "twist", 1.2);
    invalidate();
  }, [values, twistUniform, invalidate]);

  return (
    <mesh
      geometry={geometry}
      material={effectOn ? materialOn : materialOff}
      position={[0, 1.1, 0]}
      castShadow={shadowsOn}
    />
  );
}

function Scene() {
  const { values } = useDemoContext();
  const shadowsOn = booleanOf(values, "shadows", true);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={2}
        castShadow={shadowsOn}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0015}
      />
      <TwistedKnot shadowsOn={shadowsOn} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={shadowsOn}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#3a3f4a" roughness={0.95} />
      </mesh>
    </>
  );
}

export default function OnBeforeCompileDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      hint={L.hint}
      ratio={16 / 10}
      controls={[
        {
          kind: "number",
          key: "twist",
          label: L.twist,
          min: -3,
          max: 3,
          step: 0.1,
          defaultValue: 1.2,
        },
        { kind: "boolean", key: "effect", label: L.effect, defaultValue: true },
        { kind: "boolean", key: "shadows", label: L.shadows, defaultValue: true },
      ]}
    >
      <DemoCanvas shadows camera={{ position: [3.4, 2.6, 4.2], fov: 42 }}>
        <Scene />
      </DemoCanvas>
    </Demo>
  );
}
