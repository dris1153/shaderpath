"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { OrthographicCamera, PerspectiveCamera, View } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Hai viewport, một canvas — cộng một HUD qua createPortal",
    x: "Vị trí X",
  },
  en: {
    title: "Two Viewports, One Canvas — Plus a createPortal HUD",
    x: "X position",
  },
} as const;

const RANGE = 3;
const CLEAR_COLOR = "#0b1120";

// Same JSX driven by the same `values` in both Views below — View doesn't
// share one Three.js scene between viewports, so "the same scene twice"
// means "the same content, kept in sync from one external source" (§ theory).
function SceneContent() {
  const { values } = useDemoContext();
  const meshRef = useRef<THREE.Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    meshRef.current?.position.setX(numberOf(values, "x", 0));
    invalidate();
  }, [values, invalidate]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1} />
      <gridHelper args={[8, 8, "#64748b", "#334155"]} />
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
    </>
  );
}

// Priority 0 (default) — sorts before the Views (1, 2) and the Hud (3), so it
// always runs first: one full-canvas clear before anything scissored draws.
function ClearFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.setClearColor(CLEAR_COLOR, 1);
    gl.clear(true, true, true);
  });
  return null;
}

// The raw createPortal primitive View wraps: a second Scene + camera, drawn
// into an explicit scissor rect via a manual gl.render() every pumped frame.
function Hud({ trackRef }: { trackRef: RefObject<HTMLDivElement | null> }) {
  const { values } = useDemoContext();
  const [hudScene] = useState(() => new THREE.Scene());
  const camRef = useRef<THREE.OrthographicCamera>(null);
  const markerRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const t = numberOf(values, "x", 0) / RANGE; // -1..1
    markerRef.current?.position.setX(t * 0.75);
  }, [values]);

  // Priority 3: runs after both Views, so the HUD paints on top of them.
  useFrame(({ gl, size }) => {
    const el = trackRef.current;
    const cam = camRef.current;
    if (!el || !cam) return;
    const rect = el.getBoundingClientRect();
    // DOM rect (origin top-left) -> WebGL scissor rect (origin bottom-left).
    const left = Math.round(rect.left - size.left);
    const bottom = Math.round(size.top + size.height - rect.bottom);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    const autoClear = gl.autoClear;
    gl.autoClear = false;
    gl.setScissorTest(true);
    gl.setViewport(left, bottom, width, height);
    gl.setScissor(left, bottom, width, height);
    gl.clearDepth();
    gl.render(hudScene, cam);
    gl.setScissorTest(false);
    gl.autoClear = autoClear;
  }, 3);

  return createPortal(
    <>
      <orthographicCamera ref={camRef} args={[-1, 1, 1, -1, 0.1, 10]} position={[0, 0, 1]} />
      <mesh>
        <planeGeometry args={[1.7, 0.08]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh ref={markerRef}>
        <circleGeometry args={[0.09, 24]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
    </>,
    hudScene,
  );
}

function Viewports() {
  const mainRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  // drei's View types `track` as a non-null RefObject; ours starts null until
  // mount (React 19's useRef(null) contract) — safe here since View only
  // reads `.current` inside useFrame, well after these divs exist. Cast as a
  // plain expression (not a function call) so no ref is "passed into" a
  // function during render.
  const mainTrack = mainRef as unknown as RefObject<HTMLElement>;
  const mapTrack = mapRef as unknown as RefObject<HTMLElement>;

  return (
    <div className="relative size-full">
      <div ref={mainRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-2 flex flex-col items-end justify-between gap-2">
        <div ref={mapRef} className="size-24 rounded outline outline-white/40" />
        <div ref={hudRef} className="h-8 w-40 rounded outline outline-white/40" />
      </div>
      <DemoCanvas style={{ position: "absolute", inset: 0 }}>
        <ClearFrame />
        <View track={mainTrack} index={1}>
          <PerspectiveCamera
            makeDefault
            position={[4, 3, 5]}
            fov={45}
            onUpdate={(cam) => cam.lookAt(0, 0.5, 0)}
          />
          <SceneContent />
        </View>
        <View track={mapTrack} index={2}>
          <OrthographicCamera
            makeDefault
            manual
            position={[0, 6, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            left={-4}
            right={4}
            top={4}
            bottom={-4}
            near={0.1}
            far={20}
          />
          <SceneContent />
        </View>
        <Hud trackRef={hudRef} />
      </DemoCanvas>
    </div>
  );
}

export default function PortalsViewsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "x", label: L.x, min: -RANGE, max: RANGE, step: 0.1, defaultValue: 0 },
      ]}
    >
      <Viewports />
    </Demo>
  );
}
