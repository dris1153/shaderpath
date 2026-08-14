"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "useFrame: mutate ref vs setState mỗi frame",
    mode: "Chế độ animate quỹ đạo",
    modeRef: "Mutate ref (đúng)",
    modeState: "setState mỗi frame (sai)",
    renders: "render component quỹ đạo",
  },
  en: {
    title: "useFrame: Ref Mutation vs setState Per Frame",
    mode: "Orbit animation mode",
    modeRef: "Mutate ref (correct)",
    modeState: "setState every frame (wrong)",
    renders: "orbit component renders",
  },
} as const;

const ORBIT_RADIUS = 2.2;
// rad/s — delta-corrected below, so this stays a real rad/s at any framerate.
const ORBIT_SPEED = 0.9;
const POINTER_PLANE_HALF = 3;

type OrbitMode = "ref" | "state";

// Correct pattern: the angle lives in a ref, useFrame writes straight into
// the Object3D via meshRef.current — zero React re-renders while it spins.
function OrbitRef({ renderLabel }: { renderLabel: string }) {
  const meshRef = useRef<Mesh>(null);
  const angleRef = useRef(0);
  const renderCount = useRef(0);
  renderCount.current += 1;
  const countRef = useRef<HTMLSpanElement>(null);

  useFrame((state, delta) => {
    angleRef.current += ORBIT_SPEED * delta;
    const x = Math.cos(angleRef.current) * ORBIT_RADIUS;
    const z = Math.sin(angleRef.current) * ORBIT_RADIUS;
    meshRef.current?.position.set(x, 0.6, z);
  });

  useEffect(() => {
    if (countRef.current) {
      countRef.current.textContent = `${renderCount.current} ${renderLabel}`;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[ORBIT_RADIUS, 0.6, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <Html position={[0, 2.3, 0]} center occlude={false}>
        <span
          ref={countRef}
          className="bg-background/85 rounded border px-2 py-1 font-mono text-xs whitespace-nowrap"
        />
      </Html>
    </>
  );
}

// Anti-pattern kept intentionally for the lesson: setAngle every frame forces
// a full React re-render of this component, ~60/s while animating.
function OrbitState({ renderLabel }: { renderLabel: string }) {
  const [angle, setAngle] = useState(0);
  const renderCount = useRef(0);
  renderCount.current += 1;
  const countRef = useRef<HTMLSpanElement>(null);

  useFrame((state, delta) => {
    setAngle((a) => a + ORBIT_SPEED * delta);
  });

  useEffect(() => {
    if (countRef.current) {
      countRef.current.textContent = `${renderCount.current} ${renderLabel}`;
    }
  });

  const x = Math.cos(angle) * ORBIT_RADIUS;
  const z = Math.sin(angle) * ORBIT_RADIUS;

  return (
    <>
      <mesh position={[x, 0.6, z]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Html position={[0, 2.3, 0]} center occlude={false}>
        <span
          ref={countRef}
          className="bg-background/85 rounded border px-2 py-1 font-mono text-xs whitespace-nowrap"
        />
      </Html>
    </>
  );
}

// Reads state.pointer directly inside useFrame — the cheapest way to chase
// the cursor, no hand-built Raycaster needed.
function PointerFollower() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    const x = state.pointer.x * POINTER_PLANE_HALF;
    const z = -state.pointer.y * POINTER_PLANE_HALF;
    meshRef.current?.position.set(x, 0.3, z);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.25, 24, 24]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

function HooksScene({ renderLabel }: { renderLabel: string }) {
  const { values } = useDemoContext();
  const mode = stringOf(values, "mode", "ref") as OrbitMode;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1f2430" />
      </mesh>
      {mode === "ref" ? (
        <OrbitRef renderLabel={renderLabel} />
      ) : (
        <OrbitState renderLabel={renderLabel} />
      )}
      <PointerFollower />
    </>
  );
}

export default function R3fCoreHooksDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "ref",
          options: [
            { value: "ref", label: L.modeRef },
            { value: "state", label: L.modeState },
          ],
        },
      ]}
    >
      <DemoCanvas camera={{ position: [4, 3, 5], fov: 50 }}>
        <HooksScene renderLabel={L.renders} />
      </DemoCanvas>
    </Demo>
  );
}
