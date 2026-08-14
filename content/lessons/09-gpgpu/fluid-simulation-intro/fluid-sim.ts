import * as THREE from "three";
import fullscreenVert from "./fullscreen.vert";
import advectFrag from "./advect.frag";
import splatFrag from "./splat.frag";
import divergenceFrag from "./divergence.frag";
import pressureFrag from "./pressure.frag";
import projectFrag from "./project.frag";

// Fixed simulation timestep, decoupled from real frame delta (§ checkpoint
// hint on Track 9: variable dt makes semi-Lagrangian advection's step size
// unpredictable under frame hitches, even though it stays numerically stable).
const FLUID_DT = 1 / 60;
const SPLAT_RADIUS = 0.0012;

const CAMERA = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

class DoubleFBO {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;

  constructor(read: THREE.WebGLRenderTarget, write: THREE.WebGLRenderTarget) {
    this.read = read;
    this.write = write;
  }

  swap() {
    const tmp = this.read;
    this.read = this.write;
    this.write = tmp;
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
  }
}

function makeTarget(size: number, filter: THREE.MagnificationTextureFilter) {
  return new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: filter,
    magFilter: filter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

function makePair(size: number, filter: THREE.MagnificationTextureFilter) {
  return new DoubleFBO(makeTarget(size, filter), makeTarget(size, filter));
}

// A compact 2D Stable Fluids solver (Stam 1999 / GPU Gems ch.38): velocity +
// dye ping-pong FBOs, semi-Lagrangian advection, Jacobi pressure projection.
// One 128x128 grid — the sim IS the lesson here, not an aside.
export class FluidSim {
  private renderer: THREE.WebGLRenderer;
  private size: number;
  private quad: THREE.Mesh;
  private velocity: DoubleFBO;
  private dye: DoubleFBO;
  private pressure: DoubleFBO;
  private divergenceTarget: THREE.WebGLRenderTarget;
  private advectMaterial: THREE.ShaderMaterial;
  private splatMaterial: THREE.ShaderMaterial;
  private divergenceMaterial: THREE.ShaderMaterial;
  private pressureMaterial: THREE.ShaderMaterial;
  private projectMaterial: THREE.ShaderMaterial;

  constructor(renderer: THREE.WebGLRenderer, size = 128) {
    this.renderer = renderer;
    this.size = size;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));

    this.velocity = makePair(size, THREE.LinearFilter);
    this.dye = makePair(size, THREE.LinearFilter);
    this.pressure = makePair(size, THREE.NearestFilter);
    this.divergenceTarget = makeTarget(size, THREE.NearestFilter);

    const texel = new THREE.Vector2(1 / size, 1 / size);

    this.advectMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: advectFrag,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        uDt: { value: FLUID_DT },
        uDissipation: { value: 1 },
      },
    });
    this.splatMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: splatFrag,
      uniforms: {
        uTarget: { value: null },
        uPoint: { value: new THREE.Vector2() },
        uValue: { value: new THREE.Vector3() },
        uRadius: { value: SPLAT_RADIUS },
      },
    });
    this.divergenceMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: divergenceFrag,
      uniforms: { uVelocity: { value: null }, uTexelSize: { value: texel } },
    });
    this.pressureMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: pressureFrag,
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        uTexelSize: { value: texel },
      },
    });
    this.projectMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: projectFrag,
      uniforms: {
        uVelocity: { value: null },
        uPressure: { value: null },
        uTexelSize: { value: texel },
      },
    });
  }

  get texture(): THREE.Texture {
    return this.dye.read.texture;
  }

  private renderPass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.quad, CAMERA);
  }

  /** Impulse from a pointer drag: force into velocity, color into dye, both at (u, v). */
  splat(u: number, v: number, dx: number, dy: number, color: [number, number, number]) {
    const point = this.splatMaterial.uniforms.uPoint!.value as THREE.Vector2;
    const value = this.splatMaterial.uniforms.uValue!.value as THREE.Vector3;
    point.set(u, v);

    value.set(dx, dy, 0);
    this.splatMaterial.uniforms.uTarget!.value = this.velocity.read.texture;
    this.renderPass(this.splatMaterial, this.velocity.write);
    this.velocity.swap();

    value.set(color[0], color[1], color[2]);
    this.splatMaterial.uniforms.uTarget!.value = this.dye.read.texture;
    this.renderPass(this.splatMaterial, this.dye.write);
    this.dye.swap();
  }

  /** One full Stable Fluids step: self-advect velocity, project, advect dye. */
  step(dissipation: number, iterations: number) {
    // Self-advect velocity (semi-Lagrangian, unconditionally stable).
    this.advectMaterial.uniforms.uVelocity!.value = this.velocity.read.texture;
    this.advectMaterial.uniforms.uSource!.value = this.velocity.read.texture;
    this.advectMaterial.uniforms.uDissipation!.value = 1;
    this.renderPass(this.advectMaterial, this.velocity.write);
    this.velocity.swap();

    // Divergence of the freshly-advected field.
    this.divergenceMaterial.uniforms.uVelocity!.value = this.velocity.read.texture;
    this.renderPass(this.divergenceMaterial, this.divergenceTarget);

    // Pressure reset to 0 before each solve (GPU Gems ch.38 convention).
    this.renderer.setRenderTarget(this.pressure.read);
    this.renderer.clear(true, false, false);

    for (let i = 0; i < iterations; i++) {
      this.pressureMaterial.uniforms.uPressure!.value = this.pressure.read.texture;
      this.pressureMaterial.uniforms.uDivergence!.value = this.divergenceTarget.texture;
      this.renderPass(this.pressureMaterial, this.pressure.write);
      this.pressure.swap();
    }

    // Subtract the pressure gradient: velocity is now divergence-free.
    this.projectMaterial.uniforms.uVelocity!.value = this.velocity.read.texture;
    this.projectMaterial.uniforms.uPressure!.value = this.pressure.read.texture;
    this.renderPass(this.projectMaterial, this.velocity.write);
    this.velocity.swap();

    // Advect dye by the divergence-free velocity field.
    this.advectMaterial.uniforms.uVelocity!.value = this.velocity.read.texture;
    this.advectMaterial.uniforms.uSource!.value = this.dye.read.texture;
    this.advectMaterial.uniforms.uDissipation!.value = dissipation;
    this.renderPass(this.advectMaterial, this.dye.write);
    this.dye.swap();

    this.renderer.setRenderTarget(null);
  }

  reset() {
    for (const target of [
      this.velocity.read,
      this.velocity.write,
      this.dye.read,
      this.dye.write,
      this.pressure.read,
      this.pressure.write,
    ]) {
      this.renderer.setRenderTarget(target);
      this.renderer.clear(true, false, false);
    }
    this.renderer.setRenderTarget(null);
  }

  dispose() {
    this.quad.geometry.dispose();
    this.velocity.dispose();
    this.dye.dispose();
    this.pressure.dispose();
    this.divergenceTarget.dispose();
    this.advectMaterial.dispose();
    this.splatMaterial.dispose();
    this.divergenceMaterial.dispose();
    this.pressureMaterial.dispose();
    this.projectMaterial.dispose();
  }
}
