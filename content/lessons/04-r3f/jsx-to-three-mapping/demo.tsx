"use client";

import { useRef, type RefObject } from "react";
import { useLocale } from "next-intl";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "args vs prop vs pierced prop — cùng một mesh, ba đường dẫn",
    sizeArgs: "size (qua args)",
    sizeScale: "size (qua scale)",
    sizeX: "size (qua scale-x pierced)",
    argsLabel: "args",
    scaleLabel: "scale",
    pierceLabel: "scale-x/y/z",
    constructCount: "Số lần geometry dựng lại",
  },
  en: {
    title: "args vs. Property vs. Pierced Prop — Same Mesh, Three Paths",
    sizeArgs: "size (via args)",
    sizeScale: "size (via scale)",
    sizeX: "size (via pierced scale-x)",
    argsLabel: "args",
    scaleLabel: "scale",
    pierceLabel: "scale-x/y/z",
    constructCount: "Geometry (re)construct count",
  },
} as const;

const BOX_COLOR_ARGS = "#ef4444";
const BOX_COLOR_SCALE = "#3b82f6";
const BOX_COLOR_PIERCE = "#22c55e";

// Watches the REAL THREE.BufferGeometry identity each pumped frame (§8.3) --
// a new uuid means `args` forced a destroy+reconstruct; an unchanged uuid
// means only a property got mutated. Proves the cost gap instead of just
// asserting it.
function GeometryConstructCounter({
  meshRef,
  displayRef,
}: {
  meshRef: RefObject<Mesh | null>;
  displayRef: RefObject<HTMLSpanElement | null>;
}) {
  const lastUuid = useRef<string | null>(null);
  const count = useRef(0);

  useFrame(() => {
    const uuid = meshRef.current?.geometry.uuid;
    if (uuid && uuid !== lastUuid.current) {
      lastUuid.current = uuid;
      count.current += 1;
      if (displayRef.current) {
        displayRef.current.textContent = String(count.current);
      }
    }
  });

  return null;
}

function ThreeBoxes({
  countRefs,
}: {
  countRefs: {
    args: RefObject<HTMLSpanElement | null>;
    scale: RefObject<HTMLSpanElement | null>;
    pierce: RefObject<HTMLSpanElement | null>;
  };
}) {
  const { values } = useDemoContext();
  const sizeArgs = numberOf(values, "sizeArgs", 1);
  const sizeScale = numberOf(values, "sizeScale", 1);
  const sizeX = numberOf(values, "sizeX", 1);

  const argsMeshRef = useRef<Mesh>(null);
  const scaleMeshRef = useRef<Mesh>(null);
  const pierceMeshRef = useRef<Mesh>(null);

  return (
    <>
      {/* Box A: size changes via args -- destroys + rebuilds the geometry every time. */}
      <mesh ref={argsMeshRef} position={[-2.4, 0, 0]}>
        <boxGeometry args={[sizeArgs, sizeArgs, sizeArgs]} />
        <meshBasicMaterial color={BOX_COLOR_ARGS} />
      </mesh>

      {/* Box B: fixed 1x1x1 geometry, size via the `scale` scalar shorthand -- cheap mutation. */}
      <mesh ref={scaleMeshRef} position={[0, 0, 0]} scale={sizeScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={BOX_COLOR_SCALE} />
      </mesh>

      {/* Box C: fixed 1x1x1 geometry, size via three pierced props -- also a cheap mutation. */}
      <mesh
        ref={pierceMeshRef}
        position={[2.4, 0, 0]}
        scale-x={sizeX}
        scale-y={sizeX}
        scale-z={sizeX}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={BOX_COLOR_PIERCE} />
      </mesh>

      <GeometryConstructCounter meshRef={argsMeshRef} displayRef={countRefs.args} />
      <GeometryConstructCounter meshRef={scaleMeshRef} displayRef={countRefs.scale} />
      <GeometryConstructCounter meshRef={pierceMeshRef} displayRef={countRefs.pierce} />
    </>
  );
}

export default function JsxToThreeMappingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  const argsCountRef = useRef<HTMLSpanElement>(null);
  const scaleCountRef = useRef<HTMLSpanElement>(null);
  const pierceCountRef = useRef<HTMLSpanElement>(null);

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "sizeArgs", label: L.sizeArgs, min: 0.5, max: 2.5, step: 0.1, defaultValue: 1 },
        { kind: "number", key: "sizeScale", label: L.sizeScale, min: 0.5, max: 2.5, step: 0.1, defaultValue: 1 },
        { kind: "number", key: "sizeX", label: L.sizeX, min: 0.5, max: 2.5, step: 0.1, defaultValue: 1 },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 1.8, 7], fov: 45 }}>
          <ThreeBoxes
            countRefs={{ args: argsCountRef, scale: scaleCountRef, pierce: pierceCountRef }}
          />
        </DemoCanvas>
        <div className="bg-background/85 absolute top-2 left-2 space-y-0.5 rounded border px-2 py-1 font-mono text-xs shadow-sm">
          <div className="font-semibold">{L.constructCount}</div>
          <div>
            <span style={{ color: BOX_COLOR_ARGS }}>{L.argsLabel}</span>:{" "}
            <span ref={argsCountRef}>0</span>
          </div>
          <div>
            <span style={{ color: BOX_COLOR_SCALE }}>{L.scaleLabel}</span>:{" "}
            <span ref={scaleCountRef}>0</span>
          </div>
          <div>
            <span style={{ color: BOX_COLOR_PIERCE }}>{L.pierceLabel}</span>:{" "}
            <span ref={pierceCountRef}>0</span>
          </div>
        </div>
      </div>
    </Demo>
  );
}
