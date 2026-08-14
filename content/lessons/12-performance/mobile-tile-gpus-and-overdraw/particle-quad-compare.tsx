"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";
import spriteVert from "./soft-sprite.vert";
import spriteFrag from "./soft-sprite.frag";

const COUNT = 240;
const VISIBLE_RADIUS = 0.045; // world units — the visible circle, constant across both modes
const TIGHT_SIDE = VISIBLE_RADIUS * 2 * 1.2; // ~20% padding, just enough to feather the edge
const LOOSE_SIDE = VISIBLE_RADIUS * 2 * 5; // a careless "big enough to be safe" default quad
const AREA_MULTIPLIER = Math.round((LOOSE_SIDE / TIGHT_SIDE) ** 2 * 10) / 10;

const LABELS = {
  vi: {
    tight: "Tight (khít sprite)",
    loose: "Loose (quad mặc định to)",
    stat: `Loose tốn thêm ~${AREA_MULTIPLIER}× diện tích fragment so với tight — cùng một hình tròn nhìn thấy, chỉ khác kích thước quad.`,
  },
  en: {
    tight: "Tight (fitted to sprite)",
    loose: "Loose (careless default quad)",
    stat: `Loose costs ~${AREA_MULTIPLIER}× more fragment area than tight — same visible circle, only the quad size differs.`,
  },
} as const;

function FrameloopGate() {
  const { containerRef } = useDemoContext();
  useVisibleFrameloop(containerRef);
  return null;
}

function buildPositions(): THREE.Vector2[] {
  return Array.from(
    { length: COUNT },
    () => new THREE.Vector2((Math.random() - 0.5) * 3.0, (Math.random() - 0.5) * 1.9),
  );
}

// Every particle here runs the exact same fragment shader regardless of
// mode — the point isn't a different shader, it's how much wasted-but-still-
// shaded transparent area the "loose" quad drags along for a visually
// identical result.
function ParticleField({ tight }: { tight: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(() => buildPositions(), []);
  const quadSide = tight ? TIGHT_SIDE : LOOSE_SIDE;
  const invalidate = useThree((s) => s.invalidate);

  // A fresh uniforms object per quadSide change (not a mutated one) — React
  // Compiler's lint rules forbid both mutating a useMemo value and reading a
  // ref during render, so "recompute, don't mutate" satisfies both.
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#7dd3fc") },
      uVisibleFrac: { value: VISIBLE_RADIUS / (quadSide / 2) },
      uFeather: { value: 0.08 },
    }),
    [quadSide],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      m.makeScale(quadSide, quadSide, 1).setPosition(p.x, p.y, 0);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [positions, quadSide, invalidate]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={spriteVert}
        fragmentShader={spriteFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export function ParticleQuadComparePanel() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const tight = stringOf(values, "quadMode", "tight") === "tight";

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-md border">
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 3.2], fov: 40 }}
      >
        <FrameloopGate />
        <ParticleField tight={tight} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-2 max-w-[92%] rounded bg-black/60 px-2 py-1 font-mono text-[11px] text-white">
        {tight ? L.tight : L.loose} — {L.stat}
      </div>
    </div>
  );
}
