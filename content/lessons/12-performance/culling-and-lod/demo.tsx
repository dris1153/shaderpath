"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { OrthographicCamera, PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { LABELS, type Labels } from "./demo-labels";
import {
  buildFrustumWedgeGeometry,
  buildLodStation,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_HEIGHT,
  CAMERA_NEAR,
  disposeLodStation,
  DOLLY_RANGE,
  setStationHysteresis,
  setStationWireframe,
  STATIONS,
  testStationsCulled,
  type LodStationHandle,
} from "./lod-station";

const CLEAR_COLOR = "#0b1120";
const DRAWN_COLOR = "#4ade80";
const CULLED_COLOR = "#f87171";

// Same low-level scissor pattern as portals-views-multi-canvas (Track 4):
// one full clear before either View draws, priority 0 so it always runs first.
function ClearFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.setClearColor(CLEAR_COLOR, 1);
    gl.clear(true, true, true);
  });
  return null;
}

// Imperative build/dispose inside the mount effect (not useMemo/useState) —
// under Strict Mode's simulated unmount->remount, a memoized THREE.LOD would
// get disposed once and then reused dead on the second mount (see the
// disposal-and-memory-leaks lesson). Building fresh inside the effect avoids that.
function LodStation({
  x,
  z,
  wireframe,
  hysteresis,
}: {
  x: number;
  z: number;
  wireframe: boolean;
  hysteresis: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const handleRef = useRef<LodStationHandle | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const handle = buildLodStation();
    handleRef.current = handle;
    group.add(handle.lod);
    invalidate();
    return () => {
      group.remove(handle.lod);
      disposeLodStation(handle);
      handleRef.current = null;
    };
  }, [invalidate]);

  useEffect(() => {
    if (handleRef.current) setStationWireframe(handleRef.current, wireframe);
    invalidate();
  }, [wireframe, invalidate]);

  useEffect(() => {
    if (handleRef.current) setStationHysteresis(handleRef.current, hysteresis);
    invalidate();
  }, [hysteresis, invalidate]);

  return <group ref={groupRef} position={[x, 0, z]} />;
}

function MainScene({
  dollyZ,
  wireframe,
  hysteresis,
}: {
  dollyZ: number;
  wireframe: boolean;
  hysteresis: boolean;
}) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, CAMERA_HEIGHT, dollyZ]}
        fov={CAMERA_FOV}
        near={CAMERA_NEAR}
        far={CAMERA_FAR}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <gridHelper args={[60, 30, "#334155", "#1e293b"]} />
      {STATIONS.map(([x, z], i) => (
        <LodStation key={i} x={x} z={z} wireframe={wireframe} hysteresis={hysteresis} />
      ))}
    </>
  );
}

interface OverviewHandle {
  markerMaterials: THREE.MeshBasicMaterial[];
  markerGeometry: THREE.SphereGeometry;
  wedgeGeometry: THREE.BufferGeometry;
  wedgeMaterial: THREE.LineBasicMaterial;
  wedge: THREE.LineLoop;
}

// Doesn't render the real LOD meshes at all — two cameras auto-calling
// lod.update(camera) on the SAME LOD objects in one frame would fight over
// which camera's distance "wins" the visible level. Markers + a math-only
// frustum test sidestep that entirely (see testStationsCulled).
function Overview({
  dollyZ,
  onCounts,
}: {
  dollyZ: number;
  onCounts: (c: { drawn: number; culled: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const handleRef = useRef<OverviewHandle | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const markerGeometry = new THREE.SphereGeometry(0.35, 12, 12);
    const markerMaterials = STATIONS.map(() => new THREE.MeshBasicMaterial({ color: DRAWN_COLOR }));
    for (const [i, [x, z]] of STATIONS.entries()) {
      const mesh = new THREE.Mesh(markerGeometry, markerMaterials[i]);
      mesh.position.set(x, 0.2, z);
      group.add(mesh);
    }

    const wedgeGeometry = buildFrustumWedgeGeometry();
    const wedgeMaterial = new THREE.LineBasicMaterial({
      color: "#e2e8f0",
      transparent: true,
      opacity: 0.6,
    });
    const wedge = new THREE.LineLoop(wedgeGeometry, wedgeMaterial);
    group.add(wedge);

    handleRef.current = { markerMaterials, markerGeometry, wedgeGeometry, wedgeMaterial, wedge };

    return () => {
      group.clear();
      markerGeometry.dispose();
      for (const m of markerMaterials) m.dispose();
      wedgeGeometry.dispose();
      wedgeMaterial.dispose();
      handleRef.current = null;
    };
  }, []);

  useFrame(() => {
    const handle = handleRef.current;
    if (!handle) return;
    handle.wedge.position.z = dollyZ;

    const culled = testStationsCulled(dollyZ);
    let drawn = 0;
    culled.forEach((isCulled, i) => {
      handle.markerMaterials[i]!.color.set(isCulled ? CULLED_COLOR : DRAWN_COLOR);
      if (!isCulled) drawn++;
    });
    onCounts({ drawn, culled: STATIONS.length - drawn });
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <group ref={groupRef} />
    </>
  );
}

function Viewports({
  dollyZ,
  wireframe,
  hysteresis,
  onCounts,
}: {
  dollyZ: number;
  wireframe: boolean;
  hysteresis: boolean;
  onCounts: (c: { drawn: number; culled: number }) => void;
}) {
  const mainRef = useRef<HTMLDivElement>(null);
  const insetRef = useRef<HTMLDivElement>(null);

  // See portals-views-multi-canvas (Track 4): View expects a non-null
  // RefObject; ours starts null until mount (React 19's useRef(null)
  // contract). Safe here since View only reads `.current` inside useFrame.
  const mainTrack = mainRef as unknown as RefObject<HTMLElement>;
  const insetTrack = insetRef as unknown as RefObject<HTMLElement>;

  return (
    <div className="relative size-full">
      <div ref={mainRef} className="absolute inset-0" />
      <div
        ref={insetRef}
        className="absolute top-2 right-2 h-48 w-20 rounded outline outline-white/40"
      />
      <DemoCanvas style={{ position: "absolute", inset: 0 }}>
        <ClearFrame />
        <View track={mainTrack} index={1}>
          <MainScene dollyZ={dollyZ} wireframe={wireframe} hysteresis={hysteresis} />
        </View>
        <View track={insetTrack} index={2}>
          {/* manual — without it View would overwrite left/right/top/bottom
              with the inset div's raw pixel size every frame (Track 4 callout). */}
          <OrthographicCamera
            makeDefault
            manual
            position={[0, 40, -12]}
            rotation={[-Math.PI / 2, 0, 0]}
            left={-10}
            right={10}
            top={32}
            bottom={-20}
            near={0.1}
            far={100}
          />
          <Overview dollyZ={dollyZ} onCounts={onCounts} />
        </View>
      </DemoCanvas>
    </div>
  );
}

function CullingLodBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const dollyZ = numberOf(values, "dolly", DOLLY_RANGE.default);
  const wireframe = booleanOf(values, "wireframe", false);
  const hysteresis = booleanOf(values, "hysteresis", false);
  const [counts, setCounts] = useState({ drawn: STATIONS.length, culled: 0 });

  return (
    <div className="relative size-full">
      <Viewports
        dollyZ={dollyZ}
        wireframe={wireframe}
        hysteresis={hysteresis}
        onCounts={setCounts}
      />
      <div className="text-muted-foreground pointer-events-none absolute top-2 right-24 max-w-24 text-right text-[10px]">
        {L.overview}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
        {L.readout(counts.drawn, counts.culled)}
      </div>
    </div>
  );
}

export default function CullingAndLodDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "number",
          key: "dolly",
          label: L.dolly,
          min: DOLLY_RANGE.min,
          max: DOLLY_RANGE.max,
          step: DOLLY_RANGE.step,
          defaultValue: DOLLY_RANGE.default,
        },
        { kind: "boolean", key: "wireframe", label: L.wireframe, defaultValue: false },
        { kind: "boolean", key: "hysteresis", label: L.hysteresis, defaultValue: false },
      ]}
    >
      <CullingLodBody L={L} />
    </Demo>
  );
}
