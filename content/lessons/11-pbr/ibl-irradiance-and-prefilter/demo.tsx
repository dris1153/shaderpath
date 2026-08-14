"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "IBL: từ prefiltered environment ra ánh sáng trên từng quả cầu",
    environment: "Environment",
    envRoom: "RoomEnvironment (PMREM.fromScene)",
    envGradient: "Gradient sky (PMREM.fromEquirectangular)",
    envSolid: "Màu đơn sắc (PMREM.fromEquirectangular)",
    intensity: "envMapIntensity",
    isolation: "Vật liệu",
    isoBoth: "Diffuse + specular (metalness=0.35)",
    isoDiffuse: "Nghiêng diffuse (metalness=0)",
    isoSpecular: "Chỉ specular (metalness=1)",
    caption:
      "Mỗi quả cầu đọc một mip khác trong CÙNG một prefiltered atlas — trái (roughness=0) đọc mip 0 sắc nét, phải (roughness=1) đọc mip mờ nhất, đúng mip mà getIBLIrradiance() cũng dùng cho diffuse.",
  },
  en: {
    title: "IBL: from a prefiltered environment to light on every sphere",
    environment: "Environment",
    envRoom: "RoomEnvironment (PMREM.fromScene)",
    envGradient: "Gradient sky (PMREM.fromEquirectangular)",
    envSolid: "Solid color (PMREM.fromEquirectangular)",
    intensity: "envMapIntensity",
    isolation: "Material",
    isoBoth: "Diffuse + specular (metalness=0.35)",
    isoDiffuse: "Diffuse-leaning (metalness=0)",
    isoSpecular: "Specular only (metalness=1)",
    caption:
      "Each sphere reads a different mip of the SAME prefiltered atlas — left (roughness=0) reads sharp mip 0, right (roughness=1) reads the blurriest mip, the exact mip getIBLIrradiance() also reuses for diffuse.",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];
type EnvKind = "room" | "gradient" | "solid";
type Isolation = "both" | "diffuse" | "specular";

const ROUGHNESS_STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1];
const SPHERE_COLOR = 0x4e7cff;

// Two small procedural equirect textures — no binary HDRI shipped with the
// repo, but the same fromEquirectangular() path a real HDRI would take.
function buildGradientSkyTexture(): THREE.DataTexture {
  const width = 64;
  const height = 32;
  const data = new Uint8Array(width * height * 4);
  const sky = new THREE.Color("#7ec8ff");
  const horizon = new THREE.Color("#ffd9a0");
  const ground = new THREE.Color("#3a2c20");
  for (let y = 0; y < height; y++) {
    const t = y / (height - 1); // 0 at the top of the sphere, 1 at the bottom
    const color =
      t < 0.5
        ? sky.clone().lerp(horizon, t / 0.5)
        : horizon.clone().lerp(ground, (t - 0.5) / 0.5);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = Math.round(color.r * 255);
      data[i + 1] = Math.round(color.g * 255);
      data[i + 2] = Math.round(color.b * 255);
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// A single-color environment has zero directional variation, so prefiltering
// has nothing to blur away — every roughness level looks identical. That's
// the point: it isolates envMapIntensity from the mip-blur effect.
function buildSolidTexture(): THREE.DataTexture {
  const data = new Uint8Array([210, 214, 224, 255]);
  const texture = new THREE.DataTexture(data, 1, 1);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// Builds scene.environment from the selected kind, walking either the
// fromScene (RoomEnvironment) or fromEquirectangular (procedural gradients)
// path — both return the same disposable WebGLRenderTarget shape.
function IblEnvironment({ kind }: { kind: EnvKind }) {
  const { gl, scene, invalidate } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    let sourceTexture: THREE.Texture | null = null;
    let renderTarget: THREE.WebGLRenderTarget;

    if (kind === "room") {
      const room = new RoomEnvironment();
      renderTarget = pmrem.fromScene(room);
      room.dispose();
    } else {
      sourceTexture =
        kind === "gradient" ? buildGradientSkyTexture() : buildSolidTexture();
      renderTarget = pmrem.fromEquirectangular(sourceTexture);
    }

    scene.environment = renderTarget.texture;
    invalidate();

    return () => {
      scene.environment = null;
      renderTarget.dispose();
      pmrem.dispose();
      sourceTexture?.dispose();
    };
  }, [gl, scene, kind, invalidate]);

  return null;
}

function SphereRow({
  isolation,
  envMapIntensity,
}: {
  isolation: Isolation;
  envMapIntensity: number;
}) {
  const geometry = useMemo(() => new THREE.SphereGeometry(0.7, 48, 48), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // "diffuse" (metalness=0) still keeps the real ~4% dielectric Fresnel
  // specular — MeshStandardMaterial has no way to zero that out, because
  // real dielectrics genuinely never have zero specular either.
  const metalness =
    isolation === "diffuse" ? 0 : isolation === "specular" ? 1 : 0.35;

  return (
    <group>
      {ROUGHNESS_STEPS.map((roughness, i) => (
        <mesh
          key={roughness}
          geometry={geometry}
          position={[(i - (ROUGHNESS_STEPS.length - 1) / 2) * 1.7, 0, 0]}
        >
          <meshStandardMaterial
            color={SPHERE_COLOR}
            metalness={metalness}
            roughness={roughness}
            envMapIntensity={envMapIntensity}
          />
        </mesh>
      ))}
    </group>
  );
}

function IblDemoBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const envKind = stringOf(values, "environment", "room") as EnvKind;
  const envMapIntensity = numberOf(values, "intensity", 1);
  const isolation = stringOf(values, "isolation", "both") as Isolation;

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [0, 0.4, 7], fov: 40 }}>
        <IblEnvironment kind={envKind} />
        <SphereRow isolation={isolation} envMapIntensity={envMapIntensity} />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={14} />
      </DemoCanvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2">
        <span className="bg-background/85 rounded border px-2 py-1 text-[11px] leading-snug">
          {L.caption}
        </span>
      </div>
    </div>
  );
}

export default function IblIrradianceAndPrefilterDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={2}
      controls={[
        {
          kind: "select",
          key: "environment",
          label: L.environment,
          defaultValue: "room",
          options: [
            { value: "room", label: L.envRoom },
            { value: "gradient", label: L.envGradient },
            { value: "solid", label: L.envSolid },
          ],
        },
        {
          kind: "number",
          key: "intensity",
          label: L.intensity,
          min: 0,
          max: 3,
          step: 0.1,
          defaultValue: 1,
        },
        {
          kind: "select",
          key: "isolation",
          label: L.isolation,
          defaultValue: "both",
          options: [
            { value: "both", label: L.isoBoth },
            { value: "diffuse", label: L.isoDiffuse },
            { value: "specular", label: L.isoSpecular },
          ],
        },
      ]}
    >
      <IblDemoBody L={L} />
    </Demo>
  );
}
