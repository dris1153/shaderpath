"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { CameraMotionBlurPass } from "./camera-motion-blur-pass";
import { Corridor } from "./corridor";

const LABELS = {
  vi: {
    title: "Hành lang: Depth of Field & Camera Motion Blur",
    focus: "Khoảng cách lấy nét",
    aperture: "Aperture (BokehPass)",
    maxblur: "Maxblur",
    orbit: "Camera tự xoay",
    blur: "Cường độ motion blur",
    hint: "Click vào một cột để lấy nét đúng tại đó",
  },
  en: {
    title: "Corridor: Depth of Field & Camera Motion Blur",
    focus: "Focus distance",
    aperture: "Aperture (BokehPass)",
    maxblur: "Maxblur",
    orbit: "Auto-orbit camera",
    blur: "Motion blur strength",
    hint: "Click a column to focus right on it",
  },
} as const;

// BokehPass types its `.uniforms` as a bare `object` — narrowed here to the
// three fields this demo drives, verified against BokehPass.js's own source.
interface BokehUniforms {
  focus: { value: number };
  aperture: { value: number };
  maxblur: { value: number };
}

const CAMERA_NEAR = 0.5;
const CAMERA_FAR = 40;
const STATIC_POS = new THREE.Vector3(0, 1.6, -2);
const STATIC_TARGET = new THREE.Vector3(0, 1.3, 20);
const ORBIT_CENTER = new THREE.Vector3(0, 1.6, -2);
const ORBIT_RADIUS = 1.4;
const ORBIT_SPEED = 0.6;

interface PostFxState {
  composer: EffectComposer;
  renderPass: RenderPass;
  bokehPass: BokehPass;
  bokehUniforms: BokehUniforms;
  motionBlurPass: CameraMotionBlurPass;
}

// Manual EffectComposer in R3F: build from gl/scene/camera, take over
// rendering with useFrame(..., 1) (priority 1 suppresses R3F's own render),
// resize on container size changes, dispose every pass + the composer's own
// render targets on unmount (composer.dispose() does NOT dispose passes).
function PostFx() {
  const { values } = useDemoContext();
  const { gl, scene, camera, size } = useThree();

  const stateRef = useRef<PostFxState | null>(null);
  const sliderFocusRef = useRef(8);
  const clickFocusRef = useRef<number | null>(null);
  const orbitRef = useRef(false);

  useEffect(() => {
    const renderPass = new RenderPass(scene, camera);
    const bokehPass = new BokehPass(scene, camera, {
      focus: 8,
      aperture: 0.012,
      maxblur: 0.01,
    });
    const bokehUniforms = bokehPass.uniforms as unknown as BokehUniforms;
    const motionBlurPass = new CameraMotionBlurPass(scene, camera, { velocityScale: 1.5 });

    const composer = new EffectComposer(gl);
    composer.addPass(renderPass);
    composer.addPass(bokehPass);
    composer.addPass(motionBlurPass);
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(gl.getPixelRatio());

    stateRef.current = { composer, renderPass, bokehPass, bokehUniforms, motionBlurPass };

    return () => {
      composer.dispose();
      renderPass.dispose();
      bokehPass.dispose();
      motionBlurPass.dispose();
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- size read once at construction, resized separately below
  }, [gl, scene, camera]);

  useEffect(() => {
    stateRef.current?.composer.setSize(size.width, size.height);
  }, [size]);

  useEffect(() => {
    sliderFocusRef.current = numberOf(values, "focus", 8);
    orbitRef.current = booleanOf(values, "orbit", false);
    const s = stateRef.current;
    if (!s) return;
    s.bokehUniforms.aperture.value = numberOf(values, "aperture", 0.012);
    s.bokehUniforms.maxblur.value = numberOf(values, "maxblur", 0.01);
    s.motionBlurPass.velocityScale = numberOf(values, "blur", 1.5);
  }, [values]);

  // Default priority (0): drives the camera pose, always before the render below.
  useFrame((state) => {
    const cam = state.camera;
    if (orbitRef.current) {
      const t = state.clock.elapsedTime * ORBIT_SPEED;
      cam.position.set(
        ORBIT_CENTER.x + Math.cos(t) * ORBIT_RADIUS,
        ORBIT_CENTER.y,
        ORBIT_CENTER.z + Math.sin(t) * ORBIT_RADIUS,
      );
    } else {
      cam.position.copy(STATIC_POS);
    }
    cam.lookAt(STATIC_TARGET);
  });

  // Priority 1: suppresses R3F's default render, composer.render() replaces it.
  useFrame(() => {
    const s = stateRef.current;
    if (!s) return;
    s.bokehUniforms.focus.value = clickFocusRef.current ?? sliderFocusRef.current;
    s.composer.render();
  }, 1);

  return (
    <Corridor
      onFocusPick={(d) => {
        clickFocusRef.current = d;
      }}
    />
  );
}

export default function DepthOfFieldMotionBlurDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "focus", label: L.focus, min: 2, max: 28, step: 0.5, defaultValue: 8 },
        { kind: "number", key: "aperture", label: L.aperture, min: 0, max: 0.05, step: 0.001, defaultValue: 0.012 },
        { kind: "number", key: "maxblur", label: L.maxblur, min: 0, max: 0.02, step: 0.001, defaultValue: 0.01 },
        { kind: "boolean", key: "orbit", label: L.orbit, defaultValue: false },
        { kind: "number", key: "blur", label: L.blur, min: 0, max: 4, step: 0.1, defaultValue: 1.5 },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 1.6, -2], fov: 55, near: CAMERA_NEAR, far: CAMERA_FAR }}>
          <PostFx />
        </DemoCanvas>
        <div className="text-muted-foreground pointer-events-none absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium">
          {L.hint}
        </div>
      </div>
    </Demo>
  );
}
