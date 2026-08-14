"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";

const LABELS = {
  vi: {
    title: "Shadow Lab: PCF, PCFSoft, VSM, Basic",
    shadowType: "shadow.type",
    typeBasic: "Basic (1 mẫu, cứng)",
    typePcf: "PCF (mặc định)",
    typePcfSoft: "PCFSoft (bản này = PCF, xem lỗi hay gặp)",
    typeVsm: "VSM",
    mapSize: "shadow.mapSize",
    bias: "shadow.bias",
    angle: "Góc sáng (độ)",
    vsmRadius: "shadow.radius (blur ở VSM, không tác dụng ở Basic)",
    hint: "Bias quá 0 lộ acne trên trụ; kéo quá tay sang âm gây peter-panning. Đổi sang VSM rồi kéo radius lên cao để thấy light bleeding lan quanh trụ gần.",
  },
  en: {
    title: "Shadow Lab: PCF, PCFSoft, VSM, Basic",
    shadowType: "shadow.type",
    typeBasic: "Basic (1 sample, hard)",
    typePcf: "PCF (default)",
    typePcfSoft: "PCFSoft (equals PCF here, see mistakes)",
    typeVsm: "VSM",
    mapSize: "shadow.mapSize",
    bias: "shadow.bias",
    angle: "Light angle (deg)",
    vsmRadius: "shadow.radius (blur in VSM, no effect on Basic)",
    hint: "Bias near 0 exposes acne on the pillars; push it too negative and peter-panning appears. Switch to VSM and raise radius to see light bleeding spread around the near pillar.",
  },
} as const;

const SHADOW_TYPES: Record<string, THREE.ShadowMapType> = {
  basic: THREE.BasicShadowMap,
  pcf: THREE.PCFShadowMap,
  pcfsoft: THREE.PCFSoftShadowMap,
  vsm: THREE.VSMShadowMap,
};

const LIGHT_DISTANCE = 16;
const AZIMUTH = 0.55;

const PILLARS: { x: number; z: number; height: number; color: string }[] = [
  { x: -9, z: 1.1, height: 1.8, color: "#c9622f" },
  { x: -4.5, z: -1.3, height: 2.6, color: "#3f7fa6" },
  { x: 0, z: 0.9, height: 2.0, color: "#c9622f" },
  { x: 4.5, z: -1.1, height: 3.1, color: "#3f7fa6" },
  { x: 9, z: 1.3, height: 2.2, color: "#c9622f" },
];

function Pillars() {
  return (
    <>
      {PILLARS.map((p, i) => (
        <mesh key={i} position={[p.x, p.height / 2, p.z]} castShadow receiveShadow>
          <boxGeometry args={[1.1, p.height, 1.1]} />
          <meshStandardMaterial color={p.color} roughness={0.65} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 8]} />
        <meshStandardMaterial color="#9aa0ab" roughness={0.95} />
      </mesh>
    </>
  );
}

interface ShadowMapSnapshot {
  enabled: boolean;
  type: THREE.ShadowMapType;
}

// Owns renderer.shadowMap.enabled/type (shared across demos on the page --
// snapshot + restore on unmount) and the directional light's shadow config.
// Split into separate effects by concern: type/enabled changes are cheap,
// but a mapSize change must manually dispose the stale shadow.map (three's
// WebGLShadowMap only auto-recreates it on a TYPE change or when null --
// verified against the installed WebGLShadowMap.js source).
function ShadowRig() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const lastMapSizeRef = useRef(1024);

  useEffect(() => {
    const snapshot: ShadowMapSnapshot = {
      enabled: gl.shadowMap.enabled,
      type: gl.shadowMap.type,
    };
    gl.shadowMap.enabled = true;
    disposables.registerFn(() => {
      gl.shadowMap.enabled = snapshot.enabled;
      gl.shadowMap.type = snapshot.type;
    });
  }, [gl, disposables]);

  useEffect(() => {
    const light = lightRef.current;
    const target = targetRef.current;
    if (!light || !target) return;
    light.target = target;
    // Default shadow camera frustum is +-5 (three's DirectionalLightShadow
    // default) -- too narrow for a 32-unit-wide ground plane, so pillars
    // near the edges would silently fall outside the shadow pass.
    light.shadow.camera.left = -17;
    light.shadow.camera.right = 17;
    light.shadow.camera.top = 6;
    light.shadow.camera.bottom = -6;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 40;
    light.shadow.camera.updateProjectionMatrix();
    light.shadow.mapSize.set(lastMapSizeRef.current, lastMapSizeRef.current);
    disposables.registerFn(() => light.shadow.map?.dispose());
  }, [disposables]);

  const shadowType = stringOf(values, "shadowType", "pcf");
  useEffect(() => {
    gl.shadowMap.type = SHADOW_TYPES[shadowType] ?? THREE.PCFShadowMap;
    invalidate();
  }, [gl, shadowType, invalidate]);

  const mapSize = Number(stringOf(values, "mapSize", "1024"));
  useEffect(() => {
    const light = lightRef.current;
    if (!light || mapSize === lastMapSizeRef.current) return;
    lastMapSizeRef.current = mapSize;
    light.shadow.mapSize.set(mapSize, mapSize);
    light.shadow.map?.dispose();
    light.shadow.map = null;
    invalidate();
  }, [mapSize, invalidate]);

  const bias = numberOf(values, "bias", -0.0015);
  const angleDeg = numberOf(values, "angle", 35);
  const vsmRadius = numberOf(values, "vsmRadius", 4);
  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    light.shadow.bias = bias;
    light.shadow.radius = vsmRadius;

    const elevRad = (angleDeg * Math.PI) / 180;
    light.position.set(
      LIGHT_DISTANCE * Math.cos(elevRad) * Math.cos(AZIMUTH),
      LIGHT_DISTANCE * Math.sin(elevRad) + 1,
      LIGHT_DISTANCE * Math.cos(elevRad) * Math.sin(AZIMUTH),
    );
    invalidate();
  }, [bias, angleDeg, vsmRadius, invalidate]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={lightRef} castShadow intensity={2.2} color="#fff3df" />
      <object3D ref={targetRef} position={[0, 0.4, 0]} />
      <Pillars />
    </>
  );
}

export default function ShadowTechniquesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "shadowType",
          label: L.shadowType,
          defaultValue: "pcf",
          options: [
            { value: "basic", label: L.typeBasic },
            { value: "pcf", label: L.typePcf },
            { value: "pcfsoft", label: L.typePcfSoft },
            { value: "vsm", label: L.typeVsm },
          ],
        },
        {
          kind: "select",
          key: "mapSize",
          label: L.mapSize,
          defaultValue: "1024",
          options: [
            { value: "512", label: "512" },
            { value: "1024", label: "1024" },
            { value: "2048", label: "2048" },
          ],
        },
        {
          kind: "number",
          key: "bias",
          label: L.bias,
          min: -0.01,
          max: 0.01,
          step: 0.0005,
          defaultValue: -0.0015,
        },
        {
          kind: "number",
          key: "angle",
          label: L.angle,
          min: 10,
          max: 75,
          step: 1,
          defaultValue: 35,
        },
        {
          kind: "number",
          key: "vsmRadius",
          label: L.vsmRadius,
          min: 1,
          max: 12,
          step: 0.5,
          defaultValue: 4,
        },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 4.5, 13], fov: 42 }}>
          <ShadowRig />
        </DemoCanvas>
        <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/85 px-3 py-1.5 text-xs">
          {L.hint}
        </div>
      </div>
    </Demo>
  );
}
