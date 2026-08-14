"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLocale } from "next-intl";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Danh sách mesh do React state điều khiển",
    count: "Số mesh",
    shuffle: "Xáo màu (bật/tắt để đổi)",
    sceneCount: "scene.children.length",
  },
  en: {
    title: "A Mesh List Driven by React State",
    count: "Mesh count",
    shuffle: "Shuffle colors (toggle)",
    sceneCount: "scene.children.length",
  },
} as const;

const PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];
const SPACING = 1.3;

// Reads the REAL Three.js scene every pumped frame (§8.3 demand+visible
// pump) and writes it into a DOM node OUTSIDE the scene graph, so the
// readout itself never adds an extra Object3D and skews the count it reports.
function SceneCountReporter({
  targetRef,
}: {
  targetRef: RefObject<HTMLSpanElement | null>;
}) {
  const scene = useThree((s) => s.scene);

  useFrame(() => {
    if (targetRef.current) {
      targetRef.current.textContent = String(scene.children.length);
    }
  });

  return null;
}

function MeshRow({ countRef }: { countRef: RefObject<HTMLSpanElement | null> }) {
  const { values } = useDemoContext();
  const count = Math.round(numberOf(values, "count", 6));
  const shuffleToggle = booleanOf(values, "shuffle", false);
  const [seed, setSeed] = useState(0);
  const prevToggleRef = useRef(shuffleToggle);

  // A toggle FLIP (either direction) is the "shuffle" trigger, not the
  // boolean's actual value — flipping the switch either way reshuffles.
  useEffect(() => {
    if (prevToggleRef.current !== shuffleToggle) {
      prevToggleRef.current = shuffleToggle;
      setSeed((s) => s + 1);
    }
  }, [shuffleToggle]);

  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (i - (count - 1) / 2) * SPACING,
        color: PALETTE[(i * 3 + seed * 5) % PALETTE.length],
      })),
    [count, seed],
  );

  return (
    <>
      {items.map((item) => (
        <mesh key={item.id} position={[item.x, 0, 0]}>
          <boxGeometry args={[0.85, 0.85, 0.85]} />
          <meshBasicMaterial color={item.color} />
        </mesh>
      ))}
      <SceneCountReporter targetRef={countRef} />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={14} />
    </>
  );
}

export default function WhyR3fReconcilerDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const countRef = useRef<HTMLSpanElement>(null);

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "count", label: L.count, min: 1, max: 14, step: 1, defaultValue: 6 },
        { kind: "boolean", key: "shuffle", label: L.shuffle, defaultValue: false },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 2.5, 8], fov: 45 }}>
          <MeshRow countRef={countRef} />
        </DemoCanvas>
        <div className="bg-background/85 absolute top-2 left-2 rounded border px-2 py-1 font-mono text-xs shadow-sm">
          {L.sceneCount} = <span ref={countRef}>0</span>
        </div>
      </div>
    </Demo>
  );
}
