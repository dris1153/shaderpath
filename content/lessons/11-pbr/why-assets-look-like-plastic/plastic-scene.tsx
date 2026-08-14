"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useDisposable } from "@/lib/hooks/use-disposable";
import {
  createContactShadowTexture,
  createNormalMapTexture,
  createRoughnessVariationTexture,
} from "./procedural-maps";

export interface PlasticToggles {
  roughnessFix: boolean;
  albedoFix: boolean;
  metalnessFix: boolean;
  iblFix: boolean;
  aoFix: boolean;
  normalFix: boolean;
  tonemapFix: boolean;
}

// Plain (non-hook) helpers so the actual gl.*/scene.* mutation lives outside
// the component body — assigning to a useThree() return value's property
// directly inline trips the react-hooks/immutability rule.
function setToneMapping(gl: THREE.WebGLRenderer, mapping: THREE.ToneMapping) {
  gl.toneMapping = mapping;
}

function setSceneBackdrop(scene: THREE.Scene, environment: THREE.Texture | null) {
  scene.environment = environment;
  scene.background = new THREE.Color("#101114");
}

// Cause #7 ("tone mapping off"): mutates the SHARED renderer, so it MUST
// restore the previous value on unmount — this canvas is reused by every
// demo on the lesson page. ACESFilmicToneMapping is R3F Canvas's own default.
function ToneMappingSwitch({ enabled }: { enabled: boolean }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const previous = gl.toneMapping;
    setToneMapping(gl, enabled ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping);
    invalidate();
    return () => {
      setToneMapping(gl, previous);
    };
  }, [gl, enabled, invalidate]);

  return null;
}

// Cause #4 ("IBL absent or exposure-mismatched"): the PMREM env texture is
// generated ONCE and cheaply swapped in/out of scene.environment — no need
// to regenerate it every toggle.
function useStudioEnvironment(enabled: boolean) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();
  const envTextureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    envTextureRef.current = envTexture;
    disposables.registerFn(() => envTexture.dispose());
  }, [gl, disposables]);

  useEffect(() => {
    setSceneBackdrop(scene, enabled ? envTextureRef.current : null);
    invalidate();
  }, [enabled, scene, invalidate]);
}

function useProceduralMaps() {
  const disposables = useDisposable();
  return useMemo(
    () => ({
      roughnessMap: disposables.register(createRoughnessVariationTexture()),
      normalMap: disposables.register(createNormalMapTexture()),
      contactShadowMap: disposables.register(createContactShadowTexture()),
    }),
    [disposables],
  );
}

// Causes #1, #2, #3, #6 all live on this one material — each toggle flips
// exactly one PBR parameter, independent of the others.
function ProductMaterial({
  toggles,
  maps,
}: {
  toggles: PlasticToggles;
  maps: { roughnessMap: THREE.Texture; normalMap: THREE.Texture };
}) {
  return (
    <meshStandardMaterial
      color={toggles.albedoFix ? "#8a5340" : "#0a0705"}
      metalness={toggles.metalnessFix ? 0 : 0.5}
      roughness={toggles.roughnessFix ? 0.35 : 0.06}
      roughnessMap={toggles.roughnessFix ? maps.roughnessMap : null}
      normalMap={toggles.normalFix ? maps.normalMap : null}
      normalScale={toggles.normalFix ? [1, 1] : [0, 0]}
    />
  );
}

function ContactShadow({
  position,
  radius,
  texture,
  visible,
}: {
  position: [number, number, number];
  radius: number;
  texture: THREE.Texture;
  visible: boolean;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} visible={visible}>
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.position.set(2.1, 1.5, 3.4);
    camera.lookAt(0.2, 0.7, 0.1);
  }, [camera]);
  return null;
}

// THE plastic scene: a deliberately bad product shot, one boolean per cause.
export function PlasticScene({ toggles }: { toggles: PlasticToggles }) {
  useStudioEnvironment(toggles.iblFix);
  const maps = useProceduralMaps();

  return (
    <>
      <CameraRig />
      <ToneMappingSwitch enabled={toggles.tonemapFix} />
      {/* Deliberately weak baseline light — with IBL off, this alone should
          never be enough to make the product read as "real". */}
      <ambientLight intensity={0.05} />
      <directionalLight position={[3, 4, 2]} intensity={1.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#15161a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.4, 1.0, 8, 24]} />
        <ProductMaterial toggles={toggles} maps={maps} />
      </mesh>
      <mesh position={[1.0, 0.35, 0.6]}>
        <sphereGeometry args={[0.35, 48, 32]} />
        <ProductMaterial toggles={toggles} maps={maps} />
      </mesh>

      <ContactShadow
        position={[0, 0.011, 0]}
        radius={0.55}
        texture={maps.contactShadowMap}
        visible={toggles.aoFix}
      />
      <ContactShadow
        position={[1.0, 0.011, 0.6]}
        radius={0.42}
        texture={maps.contactShadowMap}
        visible={toggles.aoFix}
      />
    </>
  );
}
