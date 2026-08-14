import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import vertexShader from "./heat-shimmer.vert";
import fragmentShader from "./heat-shimmer.frag";

/**
 * Hand-written Pass subclass — not ShaderPass — to expose the contract a
 * production ShaderPass hides: own uniforms, own FullScreenQuad, explicit
 * render()/setSize()/dispose(). A single texture-in/texture-out effect like
 * this would normally just be `new ShaderPass(heatShimmerShaderObject)`; this
 * class exists to teach what ShaderPass builds for you under the hood.
 */
export class HeatShimmerPass extends Pass {
  readonly uniforms = {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uStrength: { value: 1 },
    uScale: { value: 12 },
    uSpeed: { value: 1 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  };

  private readonly material: THREE.ShaderMaterial;
  private readonly fsQuad: FullScreenQuad;

  constructor() {
    super();
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
    this.fsQuad = new FullScreenQuad(this.material);
  }

  // Resolution feeds the aspect-ratio correction in the fragment shader —
  // skip wiring this up and the shimmer stretches unevenly on non-square
  // canvases (a "resolution uniform never updated" bug you'd only notice
  // by resizing the window, not on first load).
  override setSize(width: number, height: number) {
    this.uniforms.uResolution.value.set(width, height);
  }

  override render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
  ) {
    this.uniforms.tDiffuse.value = readBuffer.texture;
    this.uniforms.uTime.value += deltaTime * this.uniforms.uSpeed.value;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) {
        renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      }
    }
    this.fsQuad.render(renderer);
    // needsSwap stays at Pass's default (true): this pass writes a full
    // frame into writeBuffer, so the composer must swap read/write before
    // the next pass — clearing it here would leave every later pass
    // reading last frame's buffer instead of ours.
  }

  // Only the material is uniquely ours: fsQuad's geometry is Pass.js's
  // module-level shared triangle, reused by every pass in the app.
  override dispose() {
    this.material.dispose();
  }
}
