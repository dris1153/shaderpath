"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";
import fragmentShader from "./sdf-object.frag";
import vertexShader from "./sdf-object.vert";

const LABELS = {
  vi: {
    title: "Raymarch + rasterized depth: occlusion hai chiều",
    naive: "Naive overlay (bỏ qua depth mesh)",
    writeDepth: "Ghi gl_FragDepth từ điểm chạm SDF",
  },
  en: {
    title: "Raymarch + Rasterized Depth: Two-Way Occlusion",
    naive: "Naive overlay (ignore mesh depth)",
    writeDepth: "Write gl_FragDepth from the SDF hit",
  },
} as const;

function Scene() {
  const { values } = useDemoContext();
  const paramsRef = useRef({ naive: false, writeDepth: true });
  const torusRef = useRef<THREE.Mesh>(null!);
  const proxyRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Mesh-only pass target: a sample-able depth texture used to bound the SDF
  // march (§ theory) — separate from the real screen depth buffer, since a
  // shader can't read the attachment it's currently writing to.
  const meshTarget = useFBO({ depthBuffer: true });

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMeshDepth: { value: null as THREE.Texture | null },
      uCameraNear: { value: 0.5 },
      uCameraFar: { value: 20 },
      uBlobCenter: { value: new THREE.Vector3() },
      uBlobPulse: { value: 0 },
      uNaive: { value: 0 },
      uWriteDepth: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    const naive = booleanOf(values, "naive", false);
    paramsRef.current.naive = naive;
    paramsRef.current.writeDepth = booleanOf(values, "writeDepth", true);
    // depthTest is a material-level GL state, not per-fragment — naive mode
    // disables it entirely, reproducing "SDF always draws on top" (§ theory).
    if (materialRef.current) materialRef.current.depthTest = !naive;
  }, [values]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cam = state.camera as THREE.PerspectiveCamera;

    // Slow relative motion: the torus orbits, the blob drifts the other way,
    // so their bounds interpenetrate and occlusion direction flips over time.
    torusRef.current.position.set(Math.sin(t * 0.35) * 1.3, 0, Math.cos(t * 0.35) * 0.4);
    uniforms.uBlobCenter.value.set(Math.sin(t * 0.35 + Math.PI) * 1.0, 0.1, 0);
    uniforms.uBlobPulse.value = Math.sin(t * 1.6);

    uniforms.uResolution.value.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr,
    );
    uniforms.uCameraNear.value = cam.near;
    uniforms.uCameraFar.value = cam.far;
    uniforms.uNaive.value = paramsRef.current.naive ? 1 : 0;
    uniforms.uWriteDepth.value = paramsRef.current.writeDepth ? 1 : 0;

    // Pass 1: mesh only, into the offscreen target — feeds the march bound.
    proxyRef.current.visible = false;
    state.gl.setRenderTarget(meshTarget);
    state.gl.render(state.scene, state.camera);

    // Pass 2: mesh + SDF proxy together, to the screen — real hardware depth
    // test decides final occlusion between the two (§ theory: two-way fix).
    uniforms.uMeshDepth.value = meshTarget.depthTexture;
    proxyRef.current.visible = true;
    state.gl.setRenderTarget(null);
    state.gl.render(state.scene, state.camera);
  }, 1);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <mesh ref={torusRef}>
        <torusKnotGeometry args={[0.7, 0.22, 160, 20]} />
        <meshStandardMaterial color="#f97316" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh ref={proxyRef}>
        <sphereGeometry args={[2.6, 48, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
}

export default function RaymarchRasterDepthIntegrationDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "boolean", key: "naive", label: L.naive, defaultValue: false },
        { kind: "boolean", key: "writeDepth", label: L.writeDepth, defaultValue: true },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 1.2, 5], fov: 45, near: 0.5, far: 20 }}>
        <Scene />
      </DemoCanvas>
    </Demo>
  );
}
