"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { createSkyTexture, type SkyKind } from "./equirect-environment";

const LABELS = {
  vi: {
    title: "HDRI, Exposure & Tone Mapping",
    environment: "Môi trường (HDRI)",
    envSun: "Nắng ngoài trời (key gắt)",
    envOvercast: "Trời âm u (softbox khổng lồ)",
    envStudio: "Studio (phản chiếu kiểm soát)",
    exposure: "Exposure (stops)",
    toneMapping: "Tone mapping",
    toneReinhard: "Reinhard",
    toneAces: "ACES Filmic",
    toneAgx: "AgX",
    postBrightness: "Hậu kỳ 'brightness' (naive, để đối chứng)",
    hint: "Exposure vặn TRƯỚC tone map — đĩa mặt trời còn giữ hình dạng. Kéo 'hậu kỳ brightness' lên cao: mọi thứ bẹt về trắng cùng lúc, không còn phân biệt được sky và sun.",
  },
  en: {
    title: "HDRI, Exposure & Tone Mapping",
    environment: "Environment (HDRI)",
    envSun: "Outdoor sun (hard key)",
    envOvercast: "Overcast (giant softbox)",
    envStudio: "Studio (controlled reflections)",
    exposure: "Exposure (stops)",
    toneMapping: "Tone mapping",
    toneReinhard: "Reinhard",
    toneAces: "ACES Filmic",
    toneAgx: "AgX",
    postBrightness: "Naive post 'brightness' (for contrast)",
    hint: "Exposure multiplies BEFORE tone mapping -- the sun disk keeps its shape. Push the naive post-brightness slider instead: everything flattens toward white together, and sky vs sun stop being distinguishable.",
  },
} as const;

const TONE_MAPPINGS: Record<string, THREE.ToneMapping> = {
  reinhard: THREE.ReinhardToneMapping,
  aces: THREE.ACESFilmicToneMapping,
  agx: THREE.AgXToneMapping,
};

// stops -> multiplier: +1 stop doubles the light, matching a camera's stop.
function exposureFromStops(stops: number): number {
  return Math.pow(2, stops);
}

function Subjects() {
  return (
    <>
      {/* Reflective: bounces the environment straight back, including the sun disk shape */}
      <mesh position={[-0.85, 0.05, 0]}>
        <sphereGeometry args={[0.85, 64, 48]} />
        <meshStandardMaterial metalness={1} roughness={0.05} color="#d9dce1" />
      </mesh>
      {/* Diffuse: only reacts to integrated irradiance, no sharp sun reflection */}
      <mesh position={[1.0, -0.05, 0.35]}>
        <sphereGeometry args={[0.75, 48, 32]} />
        <meshStandardMaterial metalness={0} roughness={0.95} color="#a89f8f" />
      </mesh>
    </>
  );
}

interface RendererSnapshot {
  toneMapping: THREE.ToneMapping;
  toneMappingExposure: number;
  background: THREE.Scene["background"];
  environment: THREE.Scene["environment"];
}

// Owns scene.environment/background (via PMREM) + gl.toneMapping/exposure +
// a CSS filter on the canvas standing in for "naive post brightness". The
// renderer is reused across demos on the page, so every mutated field is
// snapshotted on mount and restored on unmount (spec: never leak cross-demo
// renderer state).
function EnvironmentRig() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();

  const pmrem = useMemo(
    () => disposables.register(new THREE.PMREMGenerator(gl)),
    [gl, disposables],
  );
  const envTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  useEffect(() => {
    const snapshot: RendererSnapshot = {
      toneMapping: gl.toneMapping,
      toneMappingExposure: gl.toneMappingExposure,
      background: scene.background,
      environment: scene.environment,
    };
    disposables.registerFn(() => {
      gl.toneMapping = snapshot.toneMapping;
      gl.toneMappingExposure = snapshot.toneMappingExposure;
      scene.background = snapshot.background;
      scene.environment = snapshot.environment;
      gl.domElement.style.filter = "";
    });
  }, [gl, scene, disposables]);

  useEffect(() => {
    disposables.registerFn(() => envTargetRef.current?.dispose());
  }, [disposables]);

  const envKind = stringOf(values, "environment", "sun") as SkyKind;
  useEffect(() => {
    const raw = createSkyTexture(envKind);
    const target = pmrem.fromEquirectangular(raw);
    raw.dispose(); // converted into the PMREM target already; the source is no longer needed

    const previous = envTargetRef.current;
    envTargetRef.current = target;
    scene.environment = target.texture;
    scene.background = target.texture;
    previous?.dispose(); // free the PREVIOUS preset now that the new one is live

    invalidate();
  }, [envKind, pmrem, scene, invalidate]);

  const toneKind = stringOf(values, "toneMapping", "aces");
  const exposureStops = numberOf(values, "exposureStops", 0);
  useEffect(() => {
    gl.toneMapping = TONE_MAPPINGS[toneKind] ?? THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposureFromStops(exposureStops);
    invalidate();
  }, [gl, toneKind, exposureStops, invalidate]);

  const postBrightness = numberOf(values, "postBrightness", 1);
  useEffect(() => {
    // Deliberately naive: a filter applied to the already-rendered, already
    // tone-mapped, already sRGB-encoded canvas pixels -- the "post" in
    // "post brightness", to contrast with toneMappingExposure above (which
    // multiplies BEFORE tone mapping ever runs).
    gl.domElement.style.filter = postBrightness === 1 ? "" : `brightness(${postBrightness})`;
  }, [gl, postBrightness]);

  return <Subjects />;
}

export default function HdriExposureTonemappingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "environment",
          label: L.environment,
          defaultValue: "sun",
          options: [
            { value: "sun", label: L.envSun },
            { value: "overcast", label: L.envOvercast },
            { value: "studio", label: L.envStudio },
          ],
        },
        {
          kind: "number",
          key: "exposureStops",
          label: L.exposure,
          min: -4,
          max: 4,
          step: 0.25,
          defaultValue: 0,
        },
        {
          kind: "select",
          key: "toneMapping",
          label: L.toneMapping,
          defaultValue: "aces",
          options: [
            { value: "reinhard", label: L.toneReinhard },
            { value: "aces", label: L.toneAces },
            { value: "agx", label: L.toneAgx },
          ],
        },
        {
          kind: "number",
          key: "postBrightness",
          label: L.postBrightness,
          min: 1,
          max: 4,
          step: 0.1,
          defaultValue: 1,
        },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 0.3, 3.4], fov: 45 }}>
          <EnvironmentRig />
        </DemoCanvas>
        <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/85 px-3 py-1.5 text-xs">
          {L.hint}
        </div>
      </div>
    </Demo>
  );
}
