import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import fragmentShader from "./camera-motion-blur.frag";
import vertexShader from "./camera-motion-blur.vert";

export interface CameraMotionBlurOptions {
  velocityScale?: number;
}

interface MotionBlurUniforms {
  tDiffuse: { value: THREE.Texture | null };
  tDepth: { value: THREE.Texture | null };
  currentViewProjectionInverse: { value: THREE.Matrix4 };
  previousViewProjectionMatrix: { value: THREE.Matrix4 };
  velocityScale: { value: number };
}

// Camera-only motion blur (theory: "cost/quality ladder"): rebuilds each
// pixel's screen-space velocity from depth + the delta between this frame's
// and the previous frame's camera matrices, with no per-vertex velocity
// buffer. Runs its own depth pre-pass (same MeshDepthMaterial/RGBADepthPacking
// trick BokehPass uses) since BokehPass keeps its depth target private.
export class CameraMotionBlurPass extends Pass {
  scene: THREE.Scene;
  camera: THREE.Camera;
  velocityScale: number;

  private _depthMaterial: THREE.MeshDepthMaterial;
  private _depthTarget: THREE.WebGLRenderTarget;
  private _material: THREE.ShaderMaterial;
  private _fsQuad: FullScreenQuad;
  // Holds last frame's (non-inverted) view-projection matrix, updated at the
  // END of render() — so it is always exactly one frame behind "current".
  private _previousViewProjection = new THREE.Matrix4();
  private _oldClearColor = new THREE.Color();

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    options: CameraMotionBlurOptions = {},
  ) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.velocityScale = options.velocityScale ?? 1;

    this._depthMaterial = new THREE.MeshDepthMaterial();
    this._depthMaterial.depthPacking = THREE.RGBADepthPacking;
    this._depthMaterial.blending = THREE.NoBlending;

    this._depthTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    // Inline literal (not a pre-typed MotionBlurUniforms variable) so TS checks
    // it structurally against ShaderMaterial's index-signature uniforms type.
    this._material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: this._depthTarget.texture },
        currentViewProjectionInverse: { value: new THREE.Matrix4() },
        previousViewProjectionMatrix: { value: new THREE.Matrix4() },
        velocityScale: { value: this.velocityScale },
      },
      vertexShader,
      fragmentShader,
    });
    this._fsQuad = new FullScreenQuad(this._material);

    this._previousViewProjection.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
  }

  setSize(width: number, height: number) {
    this._depthTarget.setSize(width, height);
  }

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
  ) {
    // 1. Depth pre-pass — identical technique to BokehPass's internal one.
    this.scene.overrideMaterial = this._depthMaterial;
    renderer.getClearColor(this._oldClearColor);
    const oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setClearColor(0xffffff, 1);
    renderer.setRenderTarget(this._depthTarget);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = null;
    renderer.autoClear = oldAutoClear;
    renderer.setClearColor(this._oldClearColor, oldClearAlpha);

    // 2. Reconstruct velocity from depth + the two camera matrices, blur.
    const uniforms = this._material.uniforms as unknown as MotionBlurUniforms;
    uniforms.tDiffuse.value = readBuffer.texture;
    uniforms.currentViewProjectionInverse.value.multiplyMatrices(
      this.camera.matrixWorld,
      this.camera.projectionMatrixInverse,
    );
    uniforms.previousViewProjectionMatrix.value.copy(this._previousViewProjection);
    uniforms.velocityScale.value = this.velocityScale;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this._fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this._fsQuad.render(renderer);
    }

    // 3. This frame's VP becomes "previous" for the NEXT render() call —
    // must happen after step 2 read the old value above.
    this._previousViewProjection.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse,
    );
  }

  dispose() {
    this._depthTarget.dispose();
    this._depthMaterial.dispose();
    this._material.dispose();
    this._fsQuad.dispose();
  }
}
