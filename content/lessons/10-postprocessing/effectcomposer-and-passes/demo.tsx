"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import tintFragmentShader from "./tint-pass.frag";
import tintVertexShader from "./tint-pass.vert";

const LABELS = {
  vi: {
    title: "EffectComposer: RenderPass → ShaderPass → OutputPass",
    effectEnabled: "Bật pass tint",
    mix: "Cường độ tint",
    readout: (ms: number) => `composer.render(): ${ms.toFixed(2)} ms/frame`,
  },
  en: {
    title: "EffectComposer: RenderPass → ShaderPass → OutputPass",
    effectEnabled: "Enable tint pass",
    mix: "Tint mix",
    readout: (ms: number) => `composer.render(): ${ms.toFixed(2)} ms/frame`,
  },
} as const;

interface ComposerState {
  composer: EffectComposer;
  tintPass: ShaderPass;
}

// Lit scene contents as plain JSX — R3F auto-disposes geometries/materials
// on unmount (§8.2). The composer below reads this same scene via useThree.
function LitScene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 4, 2]} intensity={40} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1f2430" />
      </mesh>
      <mesh position={[-1.3, 0.1, 0]}>
        <torusKnotGeometry args={[0.7, 0.24, 128, 24]} />
        <meshStandardMaterial color="#4e7cff" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[1.4, -0.3, 0.4]}>
        <sphereGeometry args={[0.8, 48, 32]} />
        <meshStandardMaterial color="#e0522f" roughness={0.5} />
      </mesh>
    </>
  );
}

// Manual composer rig — not JSX-representable, so it's built/disposed by
// hand (spec: "takeover" pattern) instead of relying on R3F's reconciler.
function PostFxRig({ onSample }: { onSample: (ms: number) => void }) {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const disposables = useDisposable();
  const stateRef = useRef<ComposerState | null>(null);

  const paramsRef = useRef({ enabled: true, mix: 1 });
  useEffect(() => {
    paramsRef.current.enabled = booleanOf(values, "effectEnabled", true);
    paramsRef.current.mix = numberOf(values, "mix", 1);
  }, [values]);

  // Built once: RenderPass -> tint ShaderPass -> OutputPass, the same
  // three-pass skeleton the theory walks through.
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const tintPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uMix: { value: 1 },
        uTexel: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: tintVertexShader,
      fragmentShader: tintFragmentShader,
    });
    composer.addPass(tintPass);
    composer.addPass(new OutputPass());

    stateRef.current = { composer, tintPass };

    // composer.dispose() only frees its OWN two render targets + copyPass
    // (verified in EffectComposer.js) — passes we added need their own
    // dispose() call, or their GPU resources leak on remount.
    disposables.registerFn(() => {
      stateRef.current = null;
      tintPass.dispose();
      composer.dispose();
    });
  }, [gl, scene, camera, disposables]);

  // R3F resizes the canvas/camera on its own but NOT the composer's
  // internal buffers — that's this demo's responsibility.
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const dpr = gl.getPixelRatio();
    st.composer.setSize(size.width, size.height);
    const texel = st.tintPass.uniforms.uTexel;
    if (texel) {
      (texel.value as THREE.Vector2).set(
        1 / (size.width * dpr),
        1 / (size.height * dpr),
      );
    }
  }, [gl, size]);

  const avgMs = useRef(2);
  const sinceReport = useRef(0);

  // priority=1: R3F skips its own default gl.render(scene,camera) this
  // frame and lets composer.render() drive the screen instead.
  useFrame((_state, delta) => {
    const st = stateRef.current;
    if (!st) return;
    st.tintPass.enabled = paramsRef.current.enabled;
    const mixUniform = st.tintPass.uniforms.uMix;
    if (mixUniform) mixUniform.value = paramsRef.current.mix;

    const t0 = performance.now();
    st.composer.render();
    const ms = performance.now() - t0;
    avgMs.current += (ms - avgMs.current) * 0.1; // rolling average (EMA)

    sinceReport.current += delta;
    if (sinceReport.current > 0.2) {
      sinceReport.current = 0;
      onSample(avgMs.current);
    }
  }, 1);

  return null;
}

export default function EffectcomposerAndPassesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const [frameMs, setFrameMs] = useState(2);

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "boolean",
          key: "effectEnabled",
          label: L.effectEnabled,
          defaultValue: true,
        },
        {
          kind: "number",
          key: "mix",
          label: L.mix,
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 1,
        },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 1, 4.6], fov: 50 }}>
          <LitScene />
          <PostFxRig onSample={setFrameMs} />
        </DemoCanvas>
        <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
          {L.readout(frameMs)}
        </div>
      </div>
    </Demo>
  );
}
