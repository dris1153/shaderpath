import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import fullscreenVertex from "./fullscreen.vert";
import aoFragment from "./ao-approx.frag";
import gradeFragment from "./grade.frag";
import stylisticFragment from "./stylistic.frag";

export interface MainChainToggles {
  ao: boolean;
  bloom: boolean;
  toneMap: boolean;
  grade: boolean;
  stylistic: boolean;
}

export interface MainChain {
  composer: EffectComposer;
  setToggles: (toggles: MainChainToggles) => void;
  setOrder: (bloomBeforeToneMap: boolean) => void;
  setSize: (width: number, height: number, dpr: number) => void;
  setStylisticTime: (t: number) => void;
  dispose: () => void;
}

// The 5 toggleable passes, always built in the canonical order:
// scene(HDR) -> AO -> bloom -> tone map -> grade -> stylistic -> screen.
// "order" only ever swaps bloom <-> tone map, the pair this lesson's demo
// is built to demonstrate (see theory's "order changes MEANING" section).
export function createMainChain(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
): MainChain {
  const composer = new EffectComposer(gl); // defaults to a HalfFloatType target — HDR-safe out of the box

  const renderPass = new RenderPass(scene, camera);

  const aoPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
      uStrength: { value: 6 },
    },
    vertexShader: fullscreenVertex,
    fragmentShader: aoFragment,
  });

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.1, 0.5, 0.85);

  const outputPass = new OutputPass();

  const gradePass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uContrast: { value: 1.15 },
      uTint: { value: new THREE.Color(1.05, 0.98, 0.92) },
    },
    vertexShader: fullscreenVertex,
    fragmentShader: gradeFragment,
  });

  const stylisticPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uVignette: { value: 1.4 },
      uGrain: { value: 0.05 },
    },
    vertexShader: fullscreenVertex,
    fragmentShader: stylisticFragment,
  });

  composer.addPass(renderPass);
  composer.addPass(aoPass);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);
  composer.addPass(gradePass);
  composer.addPass(stylisticPass);

  const correctOrder = [renderPass, aoPass, bloomPass, outputPass, gradePass, stylisticPass];
  const swappedOrder = [renderPass, aoPass, outputPass, bloomPass, gradePass, stylisticPass];

  return {
    composer,
    setToggles(toggles) {
      aoPass.enabled = toggles.ao;
      bloomPass.enabled = toggles.bloom;
      outputPass.enabled = toggles.toneMap;
      // OutputPass reads renderer.toneMapping LIVE every render() call — this
      // is what actually applies the ACES curve; disabling it (above) skips
      // both the curve AND the sRGB encode, deliberately breaking the image.
      gl.toneMapping = toggles.toneMap ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
      gradePass.enabled = toggles.grade;
      stylisticPass.enabled = toggles.stylistic;
    },
    setOrder(bloomBeforeToneMap) {
      composer.passes = bloomBeforeToneMap ? [...correctOrder] : [...swappedOrder];
    },
    setSize(width, height, dpr) {
      composer.setSize(width, height);
      composer.setPixelRatio(dpr);
      aoPass.uniforms.uTexel!.value.set(1 / (width * dpr), 1 / (height * dpr));
    },
    setStylisticTime(t) {
      stylisticPass.uniforms.uTime!.value = t;
    },
    dispose() {
      composer.dispose(); // frees only the composer's own read/write buffers
      aoPass.dispose();
      bloomPass.dispose(); // frees bloom's ~11 internal mip render targets
      outputPass.dispose();
      gradePass.dispose();
      stylisticPass.dispose();
    },
  };
}

export interface CompareChain {
  composer: EffectComposer;
  setSize: (width: number, height: number, dpr: number) => void;
  dispose: () => void;
}

// Minimal 3-pass chain (RenderPass -> Bloom -> OutputPass, or swapped) used
// by the two side-by-side order-comparison thumbnails.
export function createCompareChain(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  bloomFirst: boolean,
): CompareChain {
  const composer = new EffectComposer(gl);
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 1.2, 0.55, 0.8);
  const outputPass = new OutputPass();

  composer.addPass(renderPass);
  if (bloomFirst) {
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
  } else {
    composer.addPass(outputPass);
    composer.addPass(bloomPass);
  }

  gl.toneMapping = THREE.ACESFilmicToneMapping;

  return {
    composer,
    setSize(width, height, dpr) {
      composer.setSize(width, height);
      composer.setPixelRatio(dpr);
    },
    dispose() {
      composer.dispose();
      bloomPass.dispose();
      outputPass.dispose();
    },
  };
}
