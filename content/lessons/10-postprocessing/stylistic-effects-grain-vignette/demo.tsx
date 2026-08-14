"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import stylisticVertex from "./stylistic-pass.vert";
import stylisticFragment from "./stylistic-pass.frag";

const LABELS = {
  vi: {
    title: "Grain, Vignette & Chromatic Aberration — một pass duy nhất",
    grain: "Grain",
    animate: "Grain động theo thời gian",
    vignetteDarkness: "Độ tối vignette",
    vignetteRadius: "Bán kính vignette",
    aberration: "Chromatic aberration (px)",
    preset: "Preset (ghi đè slider)",
    presetCustom: "Tuỳ chỉnh",
    presetTasteful: "Tinh tế",
    presetOverdone: "Quá tay",
  },
  en: {
    title: "Grain, Vignette & Chromatic Aberration — a Single Pass",
    grain: "Grain",
    animate: "Animate grain over time",
    vignetteDarkness: "Vignette darkness",
    vignetteRadius: "Vignette radius",
    aberration: "Chromatic aberration (px)",
    preset: "Preset (overrides sliders)",
    presetCustom: "Custom",
    presetTasteful: "Tasteful",
    presetOverdone: "Overdone",
  },
} as const;

// Dosage numbers from the theory's "how much is too much" section — picking
// "tasteful" vs "overdone" here should make the same 3 sliders look
// dramatically different without touching a single number by hand.
const PRESETS = {
  tasteful: { grain: 0.045, vignetteDarkness: 0.35, vignetteRadius: 0.35, aberration: 1.0 },
  overdone: { grain: 0.22, vignetteDarkness: 0.75, vignetteRadius: 0.12, aberration: 6.0 },
} as const;

function ColorfulStillLife() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.25;
  });

  return (
    <>
      <group ref={groupRef}>
        <mesh position={[-0.8, 0.1, 0]}>
          <torusKnotGeometry args={[0.45, 0.15, 128, 24]} />
          <meshStandardMaterial color="#ff5470" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0.9, -0.2, 0.2]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#2dd4bf" roughness={0.5} />
        </mesh>
        <mesh position={[0.1, 0.9, -0.3]}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial color="#facc15" roughness={0.6} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#1c1330" roughness={0.9} />
      </mesh>
      <pointLight position={[2, 2, 2]} intensity={12} decay={2} color="#ffffff" />
      <hemisphereLight args={["#4a3d7a", "#0d0716", 0.5]} />
    </>
  );
}

// A plain object literal, not ShaderPass/ShaderMaterial's own `.uniforms`
// property (typed with a loose index signature) — constructing the
// ShaderMaterial ourselves and handing it to `new ShaderPass(material)`
// keeps this exact object as the live uniforms (see ShaderPass.js: passing
// an existing ShaderMaterial skips the internal UniformsUtils.clone() that
// a plain shader-object argument would otherwise go through).
function createStylisticUniforms(resolution: THREE.Vector2) {
  return {
    tDiffuse: { value: null as THREE.Texture | null },
    uResolution: { value: resolution },
    uTime: { value: 0 as number },
    uGrainAmount: { value: PRESETS.tasteful.grain as number },
    uAnimateGrain: { value: 1 as number },
    uVignetteDarkness: { value: PRESETS.tasteful.vignetteDarkness as number },
    uVignetteRadius: { value: PRESETS.tasteful.vignetteRadius as number },
    uAberrationPx: { value: PRESETS.tasteful.aberration as number },
  };
}
type StylisticUniforms = ReturnType<typeof createStylisticUniforms>;

interface FxState {
  composer: EffectComposer;
  pass: ShaderPass;
  uniforms: StylisticUniforms;
}

function StylisticComposer() {
  const { values } = useDemoContext();
  const { gl, scene, camera, size } = useThree();
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();
  const stateRef = useRef<FxState | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    // Grain + vignette + chromatic aberration combined into ONE ShaderPass
    // instead of three separate passes — a single full-screen sample chain,
    // the fillrate lesson this lesson foreshadows.
    const uniforms = createStylisticUniforms(gl.getSize(new THREE.Vector2()));
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: stylisticVertex,
      fragmentShader: stylisticFragment,
    });
    const pass = new ShaderPass(material);
    disposables.register(pass);
    composer.addPass(pass);

    const output = new OutputPass();
    disposables.register(output);
    composer.addPass(output);

    disposables.registerFn(() => composer.dispose());

    stateRef.current = { composer, pass, uniforms };
    // Sizing to the current canvas dims runs once here, then again on every
    // `size` change via the effect below — kept separate so a resize never
    // tears down and rebuilds the whole composer chain.
  }, [gl, scene, camera, disposables]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    st.composer.setSize(size.width, size.height);
    st.uniforms.uResolution.value.set(size.width, size.height);
  }, [size]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const uniforms = st.uniforms;

    const preset = stringOf(values, "preset", "custom");
    const custom = {
      grain: numberOf(values, "grain", PRESETS.tasteful.grain),
      vignetteDarkness: numberOf(values, "vignetteDarkness", PRESETS.tasteful.vignetteDarkness),
      vignetteRadius: numberOf(values, "vignetteRadius", PRESETS.tasteful.vignetteRadius),
      aberration: numberOf(values, "aberration", PRESETS.tasteful.aberration),
    };
    const applied = preset === "tasteful" || preset === "overdone" ? PRESETS[preset] : custom;

    uniforms.uGrainAmount.value = applied.grain;
    uniforms.uAnimateGrain.value = booleanOf(values, "animate", true) ? 1 : 0;
    uniforms.uVignetteDarkness.value = applied.vignetteDarkness;
    uniforms.uVignetteRadius.value = applied.vignetteRadius;
    uniforms.uAberrationPx.value = applied.aberration;
    invalidate();
  }, [values, invalidate]);

  useFrame((state) => {
    const st = stateRef.current;
    if (!st) return;
    st.uniforms.uTime.value = state.clock.elapsedTime;
    st.composer.render();
  }, 1);

  return null;
}

export default function StylisticEffectsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "number", key: "grain", label: L.grain, min: 0, max: 0.25, step: 0.005, defaultValue: PRESETS.tasteful.grain },
        { kind: "boolean", key: "animate", label: L.animate, defaultValue: true },
        { kind: "number", key: "vignetteDarkness", label: L.vignetteDarkness, min: 0, max: 0.9, step: 0.01, defaultValue: PRESETS.tasteful.vignetteDarkness },
        { kind: "number", key: "vignetteRadius", label: L.vignetteRadius, min: 0.05, max: 0.6, step: 0.01, defaultValue: PRESETS.tasteful.vignetteRadius },
        { kind: "number", key: "aberration", label: L.aberration, min: 0, max: 8, step: 0.1, defaultValue: PRESETS.tasteful.aberration },
        {
          kind: "select",
          key: "preset",
          label: L.preset,
          options: [
            { value: "custom", label: L.presetCustom },
            { value: "tasteful", label: L.presetTasteful },
            { value: "overdone", label: L.presetOverdone },
          ],
          defaultValue: "custom",
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0.4, 3.2], fov: 45 }}>
        <ColorfulStillLife />
        <StylisticComposer />
      </DemoCanvas>
    </Demo>
  );
}
