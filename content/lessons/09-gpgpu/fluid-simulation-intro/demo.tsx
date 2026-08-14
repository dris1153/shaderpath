"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { Button } from "@/components/ui/button";
import { numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { FluidSim } from "./fluid-sim";

const LABELS = {
  vi: {
    title: "Stable Fluids lưới 2D — advect, splat, project",
    dissipation: "Độ lưu vệt màu",
    iterations: "Số vòng lặp áp suất",
    clear: "Xoá",
    hint: "Kéo chuột để bơm màu + lực",
  },
  en: {
    title: "2D Stable Fluids — advect, splat, project",
    dissipation: "Dye persistence",
    iterations: "Pressure iterations",
    clear: "Clear",
    hint: "Drag to inject dye + force",
  },
} as const;

const GRID_SIZE = 128;
const FORCE_SCALE = 12;
const MAX_DRAG_DELTA = 0.12;

interface FluidHandle {
  clear: () => void;
}

function hueColor(t: number): [number, number, number] {
  const c = new THREE.Color().setHSL(((t * 360) % 360) / 360, 0.85, 0.55);
  return [c.r, c.g, c.b];
}

function toUv(point: THREE.Vector3): [number, number] {
  return [(point.x + 1) / 2, (point.y + 1) / 2];
}

// Manual FBO pipeline (not GPUComputationRenderer): the varying pressure
// iteration count and per-frame pressure reset don't fit its fixed
// "compute every variable once" model — see theory for why.
function FluidScene({ ref }: { ref: Ref<FluidHandle> }) {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const disposables = useDisposable();
  const simRef = useRef<FluidSim | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hasMapRef = useRef(false);

  useEffect(() => {
    const sim = new FluidSim(gl, GRID_SIZE);
    simRef.current = sim;
    disposables.registerFn(() => {
      simRef.current = null;
      sim.dispose();
    });
  }, [gl, disposables]);

  const paramsRef = useRef({ dissipation: 0.98, iterations: 12 });
  useEffect(() => {
    paramsRef.current = {
      dissipation: numberOf(values, "dissipation", 0.98),
      iterations: Math.round(numberOf(values, "iterations", 12)),
    };
  }, [values]);

  useImperativeHandle(
    ref,
    () => ({ clear: () => simRef.current?.reset() }),
    [],
  );

  const dragRef = useRef({ down: false, u: 0.5, v: 0.5, hue: 0 });
  const pendingRef = useRef<{ u: number; v: number; du: number; dv: number; hue: number } | null>(
    null,
  );

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    const [u, v] = toUv(e.point);
    dragRef.current = { down: true, u, v, hue: dragRef.current.hue + 0.17 };
  }
  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!dragRef.current.down) return;
    const [u, v] = toUv(e.point);
    const du = THREE.MathUtils.clamp(u - dragRef.current.u, -MAX_DRAG_DELTA, MAX_DRAG_DELTA);
    const dv = THREE.MathUtils.clamp(v - dragRef.current.v, -MAX_DRAG_DELTA, MAX_DRAG_DELTA);
    pendingRef.current = { u, v, du, dv, hue: dragRef.current.hue };
    dragRef.current.u = u;
    dragRef.current.v = v;
  }
  function endDrag() {
    dragRef.current.down = false;
  }

  useFrame(() => {
    const sim = simRef.current;
    if (!sim) return;

    const pending = pendingRef.current;
    if (pending) {
      sim.splat(
        pending.u,
        pending.v,
        pending.du * FORCE_SCALE,
        pending.dv * FORCE_SCALE,
        hueColor(pending.hue),
      );
      pendingRef.current = null;
    }
    sim.step(paramsRef.current.dissipation, paramsRef.current.iterations);

    const material = materialRef.current;
    if (material) {
      if (!hasMapRef.current) {
        hasMapRef.current = true;
        material.needsUpdate = true;
      }
      material.map = sim.texture;
    }
  });

  return (
    <>
      <mesh
        position={[0, 0, 0.01]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial ref={materialRef} toneMapped={false} />
      </mesh>
    </>
  );
}

export default function FluidSimulationIntroDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const handleRef = useRef<FluidHandle>(null);

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "dissipation", label: L.dissipation, min: 0.9, max: 0.999, step: 0.001, defaultValue: 0.98 },
        { kind: "number", key: "iterations", label: L.iterations, min: 2, max: 20, step: 1, defaultValue: 12 },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas
          orthographic
          camera={{
            position: [0, 0, 1],
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: 0.1,
            far: 10,
            manual: true,
          }}
        >
          <FluidScene ref={handleRef} />
        </DemoCanvas>
        <div className="pointer-events-none absolute top-2 right-2 left-2 flex items-center justify-between gap-2">
          <span className="bg-background/80 text-muted-foreground rounded px-2 py-1 text-xs">
            {L.hint}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="pointer-events-auto"
            onClick={() => handleRef.current?.clear()}
          >
            {L.clear}
          </Button>
        </div>
      </div>
    </Demo>
  );
}
