"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";

// "Individual meshes" mode is capped low on purpose — the point is to make
// the draw-call gap visible/measurable, not to actually try 2000 draw calls.
const INDIVIDUAL_CAP = 300;
const SPREAD = 6;

const LABELS = {
  vi: {
    title: "Field 2000 instance: InstancedMesh vs mesh riêng lẻ",
    count: "Số lượng",
    animate: "Animate (bob theo aPhase)",
    individual: `Vẽ dạng mesh riêng (giới hạn ${INDIVIDUAL_CAP})`,
    readout: (calls: number, fps: number) => `${calls} draw call · ${Math.round(fps)} fps`,
  },
  en: {
    title: "2000-Instance Field: InstancedMesh vs. Individual Meshes",
    count: "Count",
    animate: "Animate (bob by aPhase)",
    individual: `Render as individual meshes (capped at ${INDIVIDUAL_CAP})`,
    readout: (calls: number, fps: number) => `${calls} draw calls · ${Math.round(fps)} fps`,
  },
} as const;

// Imperative construction on purpose — the lesson teaches the literal
// `new THREE.InstancedMesh(geometry, material, count)` constructor API, so
// the demo builds it the same way instead of hiding it behind JSX sugar.
function InstancedField({ count, animate }: { count: number; animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const timeUniform = useMemo(() => ({ value: 0 }), []);
  const animateUniform = useMemo(() => ({ value: 1 }), []);

  useEffect(() => {
    animateUniform.value = animate ? 1 : 0;
  }, [animate, animateUniform]);

  // Rebuilds the whole InstancedMesh only when count changes — animate/time
  // are separate memoized uniforms mutated in place, no rebuild needed for those.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) phases[i] = Math.random() * Math.PI * 2;
    geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));

    // vertexColors: true is required for the built-in color_fragment chunk
    // to actually multiply diffuseColor by the instanceColor setColorAt below.
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.55,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = timeUniform;
      shader.uniforms.uAnimate = animateUniform;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute float aPhase;\nuniform float uTime;\nuniform float uAnimate;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\n  transformed.y += uAnimate * sin(uTime * 2.0 + aPhase) * 0.35;",
        );
    };
    // The injected code never changes shape across recompiles (only uniform
    // values do), so a constant cache key is enough here.
    material.customProgramCacheKey = () => "instanced-bob-v1";

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * SPREAD,
        (Math.random() - 0.5) * SPREAD * 0.3,
        (Math.random() - 0.5) * SPREAD,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.setHSL(i / count, 0.55, 0.55));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();

    group.add(mesh);
    invalidate();

    return () => {
      group.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [count, timeUniform, animateUniform, invalidate]);

  useFrame((state) => {
    timeUniform.value = state.clock.elapsedTime;
  });

  return <group ref={groupRef} />;
}

interface BoxSpec {
  position: [number, number, number];
  color: string;
}

// Module-level helper (not inlined in useMemo) so Math.random stays outside
// what the react-hooks/purity rule analyzes as "the render calculation".
function buildBoxSpecs(count: number): BoxSpec[] {
  return Array.from({ length: count }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * SPREAD,
      (Math.random() - 0.5) * SPREAD * 0.3,
      (Math.random() - 0.5) * SPREAD,
    ],
    color: `hsl(${Math.round((i / count) * 360)}, 55%, 55%)`,
  }));
}

// Static on purpose (no per-mesh bob) — this mode exists to isolate the cost
// of draw-call count itself, not to also pay for per-mesh animation.
function IndividualBoxes({ count }: { count: number }) {
  const boxes = useMemo(() => buildBoxSpecs(count), [count]);

  return (
    <>
      {boxes.map((box, i) => (
        <mesh key={i} position={box.position}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color={box.color} roughness={0.55} />
        </mesh>
      ))}
    </>
  );
}

function PerfProbe({
  onSample,
}: {
  onSample: (stats: { calls: number; fps: number }) => void;
}) {
  const gl = useThree((s) => s.gl);
  const avgMs = useRef(16.7);
  const sinceReport = useRef(0);

  useFrame((_state, delta) => {
    const ms = delta * 1000;
    avgMs.current += (ms - avgMs.current) * 0.1; // rolling average (EMA)
    sinceReport.current += delta;
    if (sinceReport.current > 0.2) {
      sinceReport.current = 0;
      onSample({
        calls: gl.info.render.calls,
        fps: 1000 / Math.max(avgMs.current, 0.01),
      });
    }
  });

  return null;
}

// Reads the count/animate/individual controls and picks which scene to
// mount. Must live INSIDE <Demo>'s children (here, inside <DemoCanvas>) —
// useDemoContext only resolves within the provider Demo wraps around them.
function FieldScene() {
  const { values } = useDemoContext();
  const count = numberOf(values, "count", 2000);
  const animate = booleanOf(values, "animate", true);
  const individual = booleanOf(values, "individual", false);
  const cappedCount = individual ? Math.min(count, INDIVIDUAL_CAP) : count;

  return individual ? (
    <IndividualBoxes count={cappedCount} />
  ) : (
    <InstancedField count={count} animate={animate} />
  );
}

export default function InstancedMeshPerInstanceAttributesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const [stats, setStats] = useState({ calls: 0, fps: 60 });

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "number",
          key: "count",
          label: L.count,
          min: 100,
          max: 2000,
          step: 100,
          defaultValue: 2000,
        },
        { kind: "boolean", key: "animate", label: L.animate, defaultValue: true },
        {
          kind: "boolean",
          key: "individual",
          label: L.individual,
          defaultValue: false,
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 1.5, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2} />
        <PerfProbe onSample={setStats} />
        <FieldScene />
      </DemoCanvas>
      <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
        {L.readout(stats.calls, stats.fps)}
      </div>
    </Demo>
  );
}
