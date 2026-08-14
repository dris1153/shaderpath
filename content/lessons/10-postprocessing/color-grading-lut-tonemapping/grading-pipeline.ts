import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import gradingVertexShader from "./grading-pass.vert";
import gradingFragmentShader from "./grading-pass.frag";
import { generateLut, LUT_SIZE, type LutKind } from "./lut-generator";

const TONE_MAPPINGS: Record<string, THREE.ToneMapping> = {
  none: THREE.NoToneMapping,
  reinhard: THREE.ReinhardToneMapping,
  aces: THREE.ACESFilmicToneMapping,
  agx: THREE.AgXToneMapping,
};

const LUT_KINDS: LutKind[] = ["neutral", "teal-orange", "bleach-bypass"];

/**
 * RenderPass -> OutputPass -> grading ShaderPass. OutputPass must run BEFORE
 * grading: it's the pass that bakes renderer.toneMapping + sRGB encoding, and
 * a LUT built for display-referred footage expects that encoding already done
 * (see the theory's "order doctrine" section — sourced from OutputPass's own
 * doc comment: passes needing sRGB input must follow it in the chain).
 */
export class GradingPipeline {
  readonly composer: EffectComposer;
  private readonly outputPass: OutputPass;
  private readonly gradingPass: ShaderPass;
  private readonly luts: Record<LutKind, THREE.Data3DTexture>;

  constructor(
    private readonly gl: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) {
    this.composer = new EffectComposer(gl); // defaults to a HalfFloatType target — HDR-safe out of the box
    this.composer.addPass(new RenderPass(scene, camera));

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    this.luts = {
      neutral: generateLut("neutral"),
      "teal-orange": generateLut("teal-orange"),
      "bleach-bypass": generateLut("bleach-bypass"),
    };

    this.gradingPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uLut: { value: this.luts.neutral },
        uLutSize: { value: LUT_SIZE },
        uIntensity: { value: 1 },
        uSplit: { value: 0 },
      },
      vertexShader: gradingVertexShader,
      fragmentShader: gradingFragmentShader,
    });
    this.composer.addPass(this.gradingPass);
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  setToneMapping(kind: string) {
    this.gl.toneMapping = TONE_MAPPINGS[kind] ?? THREE.ACESFilmicToneMapping;
  }

  setExposure(value: number) {
    this.gl.toneMappingExposure = value;
  }

  setLut(kind: LutKind) {
    this.gradingPass.uniforms.uLut!.value = this.luts[kind] ?? this.luts.neutral;
  }

  setIntensity(value: number) {
    this.gradingPass.uniforms.uIntensity!.value = value;
  }

  setSplit(enabled: boolean) {
    this.gradingPass.uniforms.uSplit!.value = enabled ? 1 : 0;
  }

  render() {
    this.composer.render();
  }

  dispose() {
    // Frees its own render targets; its internal copyPass.dispose() also
    // touches FullScreenQuad's geometry (Pass.js) — a MODULE-LEVEL singleton
    // shared by every pass in the app. That single touch is harmless (the
    // GPU buffer just re-uploads next time any other mounted pass needs it).
    this.composer.dispose();
    // Disposing outputPass/gradingPass themselves would repeat that same
    // shared-geometry churn for no reason — only each pass's own material
    // is uniquely ours to free.
    this.outputPass.material.dispose();
    this.gradingPass.material.dispose();
    for (const kind of LUT_KINDS) this.luts[kind].dispose();
  }
}
