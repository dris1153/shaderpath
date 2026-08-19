"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { Scene } from "./scene";

const LABELS = {
  vi: {
    title: "SSAO: bậc thang & mái vòm — bóng tiếp xúc từ depth buffer",
    radius: "kernelRadius (view-space)",
    bias: "minDistance (bias chống acne)",
    output: "Chế độ hiển thị",
    final: "Ảnh cuối",
    ao: "Chỉ AO (trước blur)",
    enabled: "Bật SSAO",
  },
  en: {
    title: "SSAO: Steps & Arches — Contact Shadows From a Depth Buffer",
    radius: "kernelRadius (view-space)",
    bias: "minDistance (anti-acne bias)",
    output: "Display mode",
    final: "Final image",
    ao: "AO only (pre-blur)",
    enabled: "SSAO enabled",
  },
} as const;

interface PostFxState {
  composer: EffectComposer;
  renderPass: RenderPass;
  ssaoPass: SSAOPass;
}

// Manual EffectComposer in R3F (same rig as the DOF/motion-blur lesson):
// build once from gl/scene/camera, take over rendering via useFrame(...,1),
// dispose every pass + the composer's own render targets on unmount.
function PostFx() {
  const { values } = useDemoContext();
  const { gl, scene, camera, size } = useThree();
  const stateRef = useRef<PostFxState | null>(null);

  useEffect(() => {
    const renderPass = new RenderPass(scene, camera);
    // Half-resolution AO — the standard optimization (theory: "Half
    // Resolution"): SSAOPass takes its own width/height independent of the
    // composer's main buffer.
    const pr = gl.getPixelRatio();
    const aoWidth = Math.max(1, Math.round((size.width * pr) / 2));
    const aoHeight = Math.max(1, Math.round((size.height * pr) / 2));
    const ssaoPass = new SSAOPass(scene, camera, aoWidth, aoHeight);

    const composer = new EffectComposer(gl);
    composer.addPass(renderPass);
    composer.addPass(ssaoPass);
    // SSAOPass must not be last. Its Default output draws ONLY the occlusion
    // term and multiplies it (CustomBlending) onto its target, assuming the lit
    // image is already there. As the final pass it targets the screen instead,
    // which never received one, and the whole canvas comes out black.
    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(pr);

    stateRef.current = { composer, renderPass, ssaoPass };

    return () => {
      composer.dispose();
      renderPass.dispose();
      ssaoPass.dispose();
      outputPass.dispose();
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- size read once at construction, resized separately below
  }, [gl, scene, camera]);

  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const pr = gl.getPixelRatio();
    // EffectComposer.setSize() resizes EVERY pass to the SAME full
    // resolution (see its source: `passes[i].setSize(effectiveWidth,
    // effectiveHeight)`), which would silently undo the half-res AO target
    // set up above — re-apply the half size right after.
    s.composer.setSize(size.width, size.height);
    s.ssaoPass.setSize(Math.max(1, Math.round((size.width * pr) / 2)), Math.max(1, Math.round((size.height * pr) / 2)));
  }, [size, gl]);

  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    s.ssaoPass.kernelRadius = numberOf(values, "radius", 0.6);
    s.ssaoPass.minDistance = numberOf(values, "bias", 0.005);
    s.ssaoPass.enabled = booleanOf(values, "enabled", true);
    // "AO only" shows the RAW pre-blur buffer on purpose — it's the noisy
    // output the random kernel rotation produces before SSAOBlurShader runs.
    s.ssaoPass.output =
      stringOf(values, "output", "final") === "ao" ? SSAOPass.OUTPUT.SSAO : SSAOPass.OUTPUT.Default;
  }, [values]);

  useFrame(() => {
    stateRef.current?.composer.render();
  }, 1);

  return <Scene />;
}

export default function SsaoDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "radius", label: L.radius, min: 0.05, max: 2, step: 0.05, defaultValue: 0.6 },
        { kind: "number", key: "bias", label: L.bias, min: 0, max: 0.05, step: 0.001, defaultValue: 0.005 },
        {
          kind: "select",
          key: "output",
          label: L.output,
          defaultValue: "final",
          options: [
            { value: "final", label: L.final },
            { value: "ao", label: L.ao },
          ],
        },
        { kind: "boolean", key: "enabled", label: L.enabled, defaultValue: true },
      ]}
    >
      <DemoCanvas camera={{ position: [6, 4, 7], fov: 50, near: 0.1, far: 60 }}>
        <OrbitControls target={[0, 1, 0]} enablePan={false} />
        <PostFx />
      </DemoCanvas>
    </Demo>
  );
}
