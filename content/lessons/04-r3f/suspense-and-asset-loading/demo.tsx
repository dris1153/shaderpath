"use client";

import { Suspense, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Suspense: tải exhibit nặng kèm placeholder",
    load: "Tải exhibit nặng",
    preload: "Preload trước",
    loading: "đang tải…",
    staticLabel: "Luôn hiện — không suspend",
  },
  en: {
    title: "Suspense: Loading a Heavy Exhibit with a Placeholder",
    load: "Load heavy exhibit",
    preload: "Preload ahead of time",
    loading: "loading…",
    staticLabel: "Always visible — never suspends",
  },
} as const;

type DemoLabels = Record<keyof typeof LABELS.vi, string>;

const DELAY_MS = 1500;
const EXHIBIT_URL = "exhibit://gallery-demo";

// A THREE.Loader that never touches the network — it simulates latency with
// setTimeout, so the demo needs zero external assets while still going
// through the exact useLoader/Suspense mechanism a real GLTFLoader would.
class DelayedGeometryLoader extends THREE.Loader<THREE.BufferGeometry> {
  load(
    _url: string,
    onLoad: (data: THREE.BufferGeometry) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ) {
    setTimeout(() => {
      try {
        onLoad(new THREE.TorusKnotGeometry(0.5, 0.16, 96, 12));
      } catch (err) {
        onError?.(err);
      }
    }, DELAY_MS);
  }
}

// Module scope: one loader instance shared by the real useLoader call and by
// preload() — both must resolve to the exact same [loader, url] cache key.
const exhibitLoader = new DelayedGeometryLoader();

function HeavyExhibit() {
  const geometry = useLoader(exhibitLoader, EXHIBIT_URL);
  return (
    <mesh geometry={geometry} position={[1.3, 0, 0]}>
      <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.15} />
    </mesh>
  );
}

// Suspense fallback: a real mesh (spinning wireframe) PLUS an Html spinner
// label — both are valid children of a Suspense living inside Canvas; a
// plain DOM <div> on its own would not be.
function Placeholder({ label }: { label: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.6;
  });
  return (
    <group position={[1.3, 0, 0]}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshBasicMaterial color="#52525b" wireframe />
      </mesh>
      <Html center occlude={false}>
        <div className="rounded-full border bg-background/85 px-2 py-1 font-mono text-[10px] whitespace-nowrap shadow-sm">
          {label}
        </div>
      </Html>
    </group>
  );
}

function Gallery({ L }: { L: DemoLabels }) {
  const { values } = useDemoContext();
  const load = booleanOf(values, "load", false);
  const preload = booleanOf(values, "preload", false);

  // Preload writes into the same suspend cache HeavyExhibit reads from — if
  // this already resolved by the time "load" flips on, Suspense never fires.
  useEffect(() => {
    if (preload) useLoader.preload(exhibitLoader, EXHIBIT_URL);
  }, [preload]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />

      <mesh position={[-1.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      <Html position={[-1.3, 0.65, 0]} center occlude={false}>
        <div className="rounded border bg-background/85 px-2 py-1 font-mono text-[10px] whitespace-nowrap shadow-sm">
          {L.staticLabel}
        </div>
      </Html>

      {load && (
        <Suspense fallback={<Placeholder label={L.loading} />}>
          <HeavyExhibit />
        </Suspense>
      )}
    </>
  );
}

export default function SuspenseAssetLoadingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "boolean", key: "preload", label: L.preload, defaultValue: false },
        { kind: "boolean", key: "load", label: L.load, defaultValue: false },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 1.4, 4.2], fov: 45 }}>
        <Gallery L={L} />
      </DemoCanvas>
    </Demo>
  );
}
