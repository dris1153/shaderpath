import * as THREE from "three";
import fullscreenVertexShader from "./fullscreen.vert";
import passthroughFragmentShader from "./passthrough.frag";
import positionUpdateFragmentShader from "./position-update.frag";
import velocityUpdateFragmentShader from "./velocity-update.frag";

export const STATE_SIZE = 128;
export const PARTICLE_COUNT = STATE_SIZE * STATE_SIZE;
export const BOUNDS = 1.5;
export const GRAVITY = 2.2;
export const BOUNCE = 0.55;

function makeStateTarget(): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(STATE_SIZE, STATE_SIZE, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

// Seed data lives in a plain FloatType DataTexture — an upload, never a
// render target, so it needs no float-render extension (see theory).
function makePositionSeed(): THREE.DataTexture {
  const data = new Float32Array(PARTICLE_COUNT * 4);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const o = i * 4;
    data[o] = (Math.random() * 2 - 1) * BOUNDS * 0.8;
    data[o + 1] = (Math.random() * 2 - 1) * BOUNDS * 0.8;
    data[o + 2] = (Math.random() * 2 - 1) * BOUNDS * 0.8;
    data[o + 3] = Math.random(); // life/seed channel — colors the particle
  }
  const texture = new THREE.DataTexture(data, STATE_SIZE, STATE_SIZE, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;
  return texture;
}

function makeVelocitySeed(): THREE.DataTexture {
  const data = new Float32Array(PARTICLE_COUNT * 4);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const o = i * 4;
    data[o] = (Math.random() * 2 - 1) * 0.4;
    data[o + 1] = (Math.random() * 2 - 1) * 0.4;
    data[o + 2] = (Math.random() * 2 - 1) * 0.4;
    data[o + 3] = 0;
  }
  const texture = new THREE.DataTexture(data, STATE_SIZE, STATE_SIZE, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Manual ping-pong GPGPU simulation: two render targets per state variable
 * (position, velocity), a shared compute scene, and a swap-only frame step.
 * Owns every GPU resource it creates — call dispose() on unmount.
 */
export class PingPongSimulation {
  private readonly posTargets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private readonly velTargets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private index = 0;

  private readonly positionSeed: THREE.DataTexture;
  private readonly velocitySeed: THREE.DataTexture;

  private readonly computeScene: THREE.Scene;
  private readonly computeCamera: THREE.OrthographicCamera;
  private readonly quadGeometry: THREE.PlaneGeometry;
  private readonly quad: THREE.Mesh;

  private readonly passthroughMaterial: THREE.ShaderMaterial;
  private readonly velocityMaterial: THREE.ShaderMaterial;
  private readonly positionMaterial: THREE.ShaderMaterial;

  constructor(private readonly gl: THREE.WebGLRenderer) {
    this.posTargets = [makeStateTarget(), makeStateTarget()];
    this.velTargets = [makeStateTarget(), makeStateTarget()];

    this.positionSeed = makePositionSeed();
    this.velocitySeed = makeVelocitySeed();

    this.computeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quadGeometry = new THREE.PlaneGeometry(2, 2);
    this.passthroughMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: passthroughFragmentShader,
      uniforms: { uSource: { value: null as THREE.Texture | null } },
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new THREE.Mesh(this.quadGeometry, this.passthroughMaterial);
    this.computeScene = new THREE.Scene();
    this.computeScene.add(this.quad);

    this.velocityMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: velocityUpdateFragmentShader,
      uniforms: {
        uPosition: { value: null as THREE.Texture | null },
        uVelocity: { value: null as THREE.Texture | null },
        uDelta: { value: 0 },
        uGravity: { value: GRAVITY },
        uBounce: { value: BOUNCE },
        uBounds: { value: BOUNDS },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.positionMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: positionUpdateFragmentShader,
      uniforms: {
        uPosition: { value: null as THREE.Texture | null },
        uVelocity: { value: null as THREE.Texture | null },
        uDelta: { value: 0 },
        uBounds: { value: BOUNDS },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.reset();
  }

  private blit(source: THREE.Texture, target: THREE.WebGLRenderTarget) {
    this.quad.material = this.passthroughMaterial;
    this.passthroughMaterial.uniforms.uSource!.value = source;
    this.gl.setRenderTarget(target);
    this.gl.render(this.computeScene, this.computeCamera);
    this.gl.setRenderTarget(null);
  }

  /** Reseeds both buffers of both ping-pong pairs and resets the read index. */
  reset() {
    for (const target of this.posTargets) this.blit(this.positionSeed, target);
    for (const target of this.velTargets) this.blit(this.velocitySeed, target);
    this.index = 0;
  }

  /** Advances the simulation by one frame: velocity pass, then position pass, then swap. */
  step(delta: number) {
    const dt = Math.min(delta, 1 / 30); // clamp: a hidden-tab spike must not blow up integration
    const readIndex = this.index;
    const writeIndex = 1 - this.index;

    const posRead = this.posTargets[readIndex]!;
    const velRead = this.velTargets[readIndex]!;
    const velWrite = this.velTargets[writeIndex]!;
    const posWrite = this.posTargets[writeIndex]!;

    this.quad.material = this.velocityMaterial;
    this.velocityMaterial.uniforms.uPosition!.value = posRead.texture;
    this.velocityMaterial.uniforms.uVelocity!.value = velRead.texture;
    this.velocityMaterial.uniforms.uDelta!.value = dt;
    this.gl.setRenderTarget(velWrite);
    this.gl.render(this.computeScene, this.computeCamera);

    this.quad.material = this.positionMaterial;
    this.positionMaterial.uniforms.uPosition!.value = posRead.texture;
    this.positionMaterial.uniforms.uVelocity!.value = velWrite.texture;
    this.positionMaterial.uniforms.uDelta!.value = dt;
    this.gl.setRenderTarget(posWrite);
    this.gl.render(this.computeScene, this.computeCamera);

    this.gl.setRenderTarget(null);
    this.index = writeIndex;
  }

  get positionTexture(): THREE.Texture {
    return this.posTargets[this.index]!.texture;
  }

  dispose() {
    for (const target of this.posTargets) target.dispose();
    for (const target of this.velTargets) target.dispose();
    this.positionSeed.dispose();
    this.velocitySeed.dispose();
    this.quadGeometry.dispose();
    this.passthroughMaterial.dispose();
    this.velocityMaterial.dispose();
    this.positionMaterial.dispose();
  }
}
