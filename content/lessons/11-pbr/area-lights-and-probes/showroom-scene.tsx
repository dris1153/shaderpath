"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useDisposable } from "@/lib/hooks/use-disposable";

// Module-level, once: the LTC LUT textures must be registered in UniformsLib
// before any RectAreaLight renders (spec: RectAreaLight.js doc comment).
// Calling init() again on Strict Mode remount just re-assigns the same
// static tables — harmless.
RectAreaLightUniformsLib.init();

// Plain (non-hook) helpers so the mutation of scene.environment/* lives
// outside the component body — mutating a useThree() return value directly
// inline trips the react-hooks/immutability rule.
function setEnvironment(scene: THREE.Scene, texture: THREE.Texture | null, intensity = 1) {
  scene.environment = texture;
  scene.environmentIntensity = intensity;
}

// A dim PMREM environment as base fill so the floor/objects aren't pitch
// black outside the RectAreaLight's throw, and so metal surfaces have
// something to reflect besides the panel itself. Kept dim on purpose — the
// panel should read as the dominant, shape-giving light source.
function Environment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();

    setEnvironment(scene, envTexture, 0.3);

    disposables.registerFn(() => {
      setEnvironment(scene, null);
      envTexture.dispose();
    });
    invalidate();
  }, [gl, scene, disposables, invalidate]);

  return null;
}

// No castShadow/receiveShadow anywhere in this scene — the RectAreaLight
// key has NO shadow support at all (see theory), and nothing else here
// casts one, so enabling shadow maps would only add cost for zero effect.
function Floor({ roughness }: { roughness: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#23262c" roughness={roughness} metalness={0.55} />
    </mesh>
  );
}

// Two showpieces positioned to sit inside the panel's reflection throw —
// the sphere (near-mirror) reads the panel's rectangular shape directly,
// the torus knot (rougher) shows the same reflection blurred by roughness.
function Showpieces() {
  return (
    <>
      <mesh position={[-0.9, 0.55, -0.2]}>
        <sphereGeometry args={[0.55, 48, 32]} />
        <meshStandardMaterial color="#c8ccd4" roughness={0.06} metalness={0.9} />
      </mesh>
      <mesh position={[1.1, 0.42, 0.3]} rotation={[0.4, 0.6, 0]}>
        <torusKnotGeometry args={[0.32, 0.11, 128, 24]} />
        <meshStandardMaterial color="#8a5a3b" roughness={0.28} metalness={0.35} />
      </mesh>
    </>
  );
}

// The key light: a RectAreaLight standing in for a studio softbox. Width and
// height are REAL world-unit dimensions — they directly shape the streak the
// sphere reflects, which is the whole point of this lesson's demo.
export function KeyAreaLight({
  width,
  height,
  intensity,
}: {
  width: number;
  height: number;
  intensity: number;
}) {
  const lightRef = useRef<THREE.RectAreaLight>(null!);

  useEffect(() => {
    const light = lightRef.current;
    light.lookAt(0, 0.2, -0.3);
    const helper = new RectAreaLightHelper(light);
    light.add(helper);
    return () => {
      light.remove(helper);
      helper.dispose();
    };
  }, []);

  return (
    <rectAreaLight
      ref={lightRef}
      color="#fff4e0"
      position={[0, 2.9, 2.6]}
      width={width}
      height={height}
      intensity={intensity}
    />
  );
}

// Aims the static camera once — R3F's Canvas `camera` prop only sets
// position/fov, not orientation, so this fills the gap (matches the
// lookAt-in-an-effect pattern used across the Track 3/10 demos).
function CameraRig() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.position.set(0, 2.7, 6.6);
    camera.lookAt(0, 0.4, -0.8);
  }, [camera]);
  return null;
}

export function Showroom({
  lightWidth,
  lightHeight,
  lightIntensity,
  floorRoughness,
}: {
  lightWidth: number;
  lightHeight: number;
  lightIntensity: number;
  floorRoughness: number;
}) {
  return (
    <>
      <CameraRig />
      <Environment />
      <Floor roughness={floorRoughness} />
      <Showpieces />
      <KeyAreaLight width={lightWidth} height={lightHeight} intensity={lightIntensity} />
    </>
  );
}
