"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { LightProbeGenerator } from "three/addons/lights/LightProbeGenerator.js";

const BOUNCE_CARD_Z = -2.6;
const WARM_X = -2.6;
const COOL_X = 2.6;
const CAPTURE_A = new THREE.Vector3(-1.6, 0.4, -2.3);
const CAPTURE_B = new THREE.Vector3(1.6, 0.4, -2.3);
const SPHERE_XS = [-1.6, 0, 1.6];

interface ProbePair {
  probeA: THREE.LightProbe;
  probeB: THREE.LightProbe;
}

// Two colored "bounce cards" standing in for two visually distinct lit zones
// of a room (a warm-lit alcove vs a cool-lit one) — the corner's only light
// source. Matte on purpose: their own diffuse bounce is exactly what the
// cube camera below captures and LightProbeGenerator bakes into SH.
function BounceCards() {
  return (
    <>
      <mesh position={[WARM_X, 0.6, BOUNCE_CARD_Z]} rotation={[0, Math.PI / 3, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial color="#140a04" emissive="#ff8a3d" emissiveIntensity={3.2} roughness={1} />
      </mesh>
      <mesh position={[COOL_X, 0.6, BOUNCE_CARD_Z]} rotation={[0, -Math.PI / 3, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial color="#040a14" emissive="#3d9dff" emissiveIntensity={3.2} roughness={1} />
      </mesh>
    </>
  );
}

// Three plain spheres between the two bounce cards. Each one's tint below
// comes from a baked light probe, NOT from three's normal light pipeline —
// WebGLRenderer merges every LightProbe present in a scene into ONE shared
// response (there is no per-object probe scoping), so to show each sphere
// picking up a DIFFERENT probe we evaluate SH irradiance on the CPU per
// sphere and paint it on as emissive — the same number a per-object probe
// blend would produce in an engine that does support it natively.
function ProbeSpheres({ probes, useProbes }: { probes: ProbePair | null; useProbes: boolean }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!probes) return;
    const { probeA, probeB } = probes;
    const up = new THREE.Vector3(0, 1, 0);
    const tint = new THREE.Vector3();
    const flat = probeA.sh.clone().lerp(probeB.sh, 0.5);

    SPHERE_XS.forEach((x, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      const t = THREE.MathUtils.clamp((x - CAPTURE_A.x) / (CAPTURE_B.x - CAPTURE_A.x), 0, 1);
      const sh = useProbes ? probeA.sh.clone().lerp(probeB.sh, t) : flat;
      sh.getIrradianceAt(up, tint);
      material.emissive.setRGB(
        Math.max(0, tint.x) * 0.18,
        Math.max(0, tint.y) * 0.18,
        Math.max(0, tint.z) * 0.18,
      );
    });
    invalidate();
  }, [probes, useProbes, invalidate]);

  return (
    <>
      {SPHERE_XS.map((x, i) => (
        <mesh
          key={x}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          position={[x, 0.3, -2.2]}
        >
          <sphereGeometry args={[0.26, 32, 24]} />
          <meshStandardMaterial color="#26282d" roughness={0.85} metalness={0} />
        </mesh>
      ))}
    </>
  );
}

// Bakes two light probes ONCE (a 32px HalfFloat cubemap each — cheap) at the
// two capture points near each bounce card via LightProbeGenerator, the
// exact addon API the theory covers — not a hardcoded stand-in for it.
export function ProbeCorner({ useProbes }: { useProbes: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const [probes, setProbes] = useState<ProbePair | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cubeTarget = new THREE.WebGLCubeRenderTarget(32, { type: THREE.HalfFloatType });
    const cubeCamera = new THREE.CubeCamera(0.05, 20, cubeTarget);
    scene.add(cubeCamera);

    async function bake() {
      cubeCamera.position.copy(CAPTURE_A);
      cubeCamera.updateMatrixWorld();
      cubeCamera.update(gl, scene);
      const probeA = await LightProbeGenerator.fromCubeRenderTarget(gl, cubeTarget);

      cubeCamera.position.copy(CAPTURE_B);
      cubeCamera.updateMatrixWorld();
      cubeCamera.update(gl, scene);
      const probeB = await LightProbeGenerator.fromCubeRenderTarget(gl, cubeTarget);

      if (!cancelled) setProbes({ probeA, probeB });
    }
    void bake();

    return () => {
      cancelled = true;
      scene.remove(cubeCamera);
      cubeTarget.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      <BounceCards />
      <ProbeSpheres probes={probes} useProbes={useProbes} />
    </>
  );
}
