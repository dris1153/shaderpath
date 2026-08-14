import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-signature-effect-stack",
    kind: "build",
    prompt: {
      vi: `Dựng \`SignatureEffectStack\`, một component React Three Fiber độc lập bọc quanh nội dung cảnh của bạn và áp một chuỗi hậu kỳ mang phong cách riêng, đúng thứ tự chuẩn từ bài pass-order-and-fillrate: \`scene(HDR) → bloom → tone mapping → grade → hiệu ứng phong cách → màn hình\`.

Skeleton (wiring \`EffectComposer\`, \`RenderPass\`, \`UnrealBloomPass\`, \`OutputPass\`, khung sườn shader grade và custom pass \`NeonNoirLookPass\`) đã đầy đủ — việc của bạn là lấp 4 TODO: (1) công thức chỉnh màu teal-orange theo luma trong fragment shader grade, (2) công thức scanline trôi theo thời gian trong custom pass, (3) đảm bảo bloom chạy TRƯỚC tone mapping trong chuỗi, (4) thêm đủ 5 pass vào composer theo đúng thứ tự chuẩn.

Bạn được khuyến khích đổi \`uShadowTint\`/\`uHighlightTint\`, tham số scanline, hoặc thay hẳn \`NeonNoirLookPass\` bằng custom pass khác cho phong cách riêng — solution chỉ là MỘT ví dụ hoàn chỉnh, không phải đáp án duy nhất.`,
      en: `Build \`SignatureEffectStack\`, a standalone React Three Fiber component wrapping your scene content and applying a post-processing chain with a distinct signature, in the exact canonical order from the pass-order-and-fillrate lesson: \`scene(HDR) → bloom → tone mapping → grade → stylistic effect → screen\`.

The skeleton (wiring \`EffectComposer\`, \`RenderPass\`, \`UnrealBloomPass\`, \`OutputPass\`, the grade shader frame, and the custom \`NeonNoirLookPass\`) is complete — your job is filling 4 TODOs: (1) the luma-based teal-orange grade formula in the grade fragment shader, (2) the time-drifting scanline formula in the custom pass, (3) making sure bloom runs BEFORE tone mapping in the chain, (4) adding all 5 passes to the composer in the correct canonical order.

You're encouraged to swap \`uShadowTint\`/\`uHighlightTint\`, the scanline parameters, or replace \`NeonNoirLookPass\` entirely with your own custom pass for your own signature — the solution is ONE complete example, not the only correct answer.`,
    },
    starterCode: `"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";

// Budget: keep the postfx layer under ~4ms at 1080p on a mid-range GPU —
// that leaves >12ms of the 16.6ms/frame (60fps) budget for scene + JS.
const BUDGET_MS = 4;

const fullscreenVertexShader = /* glsl */ \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
\`;

// Teal-orange split-tone: shadows pull toward uShadowTint, highlights pull
// toward uHighlightTint. Runs AFTER OutputPass — a grade expects [0,1] input.
const gradeFragmentShader = /* glsl */ \`
  uniform sampler2D tDiffuse;
  uniform vec3 uShadowTint;
  uniform vec3 uHighlightTint;
  varying vec2 vUv;

  void main() {
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));

    // TODO 1: split-tone by luma — mix uShadowTint (at luma=0) toward
    // uHighlightTint (at luma=1), multiply the result into color.
    vec3 graded = color;

    gl_FragColor = vec4(clamp(graded, 0.0, 1.0), 1.0);
  }
\`;

// Custom Pass subclass: scanline drift + vignette + grain merged into ONE
// shader (the "merge single-input effects" move from pass-order-and-fillrate).
const lookFragmentShader = /* glsl */ \`
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uScanlineSpeed;
  uniform float uScanlineStrength;
  uniform float uVignette;
  uniform float uGrain;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec3 color = texture2D(tDiffuse, vUv).rgb;

    // TODO 2: scanline drift — a horizontal line pattern that slowly
    // scrolls over time: sin(vUv.y * 340.0 - uTime * uScanlineSpeed),
    // remapped from [-1,1] to [0,1] and raised to a power so lines stay thin.
    float line = 0.0;
    color *= 1.0 - line * uScanlineStrength;

    vec2 centered = vUv - 0.5;
    float vignette = 1.0 - dot(centered, centered) * uVignette;
    color *= clamp(vignette, 0.0, 1.0);

    float noise = hash(vUv * 3400.0 + uTime) - 0.5;
    color += noise * uGrain;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
\`;

class NeonNoirLookPass extends Pass {
  material: THREE.ShaderMaterial;
  private quad: FullScreenQuad;

  constructor() {
    super();
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uScanlineSpeed: { value: 0.6 },
        uScanlineStrength: { value: 0.18 },
        uVignette: { value: 1.7 },
        uGrain: { value: 0.06 },
      },
      vertexShader: fullscreenVertexShader,
      fragmentShader: lookFragmentShader,
    });
    this.quad = new FullScreenQuad(this.material);
  }

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
  ) {
    this.material.uniforms.tDiffuse!.value = readBuffer.texture;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
    }
    this.quad.render(renderer);
  }

  setTime(t: number) {
    this.material.uniforms.uTime!.value = t;
  }

  dispose() {
    this.material.dispose();
    this.quad.dispose();
  }
}

interface SignatureStackProps {
  measure?: boolean;
  onFrameMs?: (ms: number) => void;
  children?: ReactNode;
}

// Mount as a wrapper around your scene content:
// <SignatureEffectStack><NeonNoirAccents /></SignatureEffectStack>
export function SignatureEffectStack({ measure = true, onFrameMs, children }: SignatureStackProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const passes = useMemo(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);

    // TODO 3: bloom must run BEFORE tone mapping (see pass-order-and-fillrate)
    // so it extracts true HDR brightness from the emissive accents below,
    // not an already tone-mapped image.
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.3,
      0.6,
      0.7,
    );

    const outputPass = new OutputPass(); // tone map (ACES) + sRGB encode

    const gradePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uShadowTint: { value: new THREE.Color(0.55, 0.75, 0.85) },
        uHighlightTint: { value: new THREE.Color(1.15, 0.85, 0.55) },
      },
      vertexShader: fullscreenVertexShader,
      fragmentShader: gradeFragmentShader,
    });

    const lookPass = new NeonNoirLookPass();

    // TODO 4: add all 5 passes to the composer in canonical order:
    // scene -> bloom -> tone map -> grade -> stylistic look.

    return { composer, renderPass, bloomPass, outputPass, gradePass, lookPass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    passes.composer.setSize(size.width, size.height);
  }, [passes, size.width, size.height]);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
  }, [gl]);

  useEffect(() => {
    return () => {
      passes.composer.dispose();
      passes.bloomPass.dispose();
      passes.outputPass.dispose();
      passes.gradePass.dispose();
      passes.lookPass.dispose();
    };
  }, [passes]);

  const emaRef = useRef(0);
  useFrame((state) => {
    passes.lookPass.setTime(state.clock.elapsedTime);

    if (!measure) {
      passes.composer.render();
      return;
    }

    const t0 = performance.now();
    passes.composer.render();
    const dt = performance.now() - t0;
    emaRef.current = emaRef.current === 0 ? dt : emaRef.current * 0.9 + dt * 0.1;
    onFrameMs?.(emaRef.current);

    if (emaRef.current > BUDGET_MS) {
      console.warn(
        "SignatureEffectStack over budget: " + emaRef.current.toFixed(2) + "ms > " + BUDGET_MS + "ms",
      );
    }
  }, 1);

  return <>{children}</>;
}

// Example accents demonstrating the signature — swap colors/positions/count
// for your own look; that swap IS the point of this checkpoint.
export function NeonNoirAccents() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0c0e14" roughness={0.95} toneMapped={false} />
      </mesh>
      <mesh position={[-1, 0.4, 0]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#ff2e88" emissive="#ff2e88" emissiveIntensity={7} toneMapped={false} />
      </mesh>
      <mesh position={[1, 0.3, -0.4]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#21e6ff" emissive="#21e6ff" emissiveIntensity={9} toneMapped={false} />
      </mesh>
    </>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";

// Budget: keep the postfx layer under ~4ms at 1080p on a mid-range GPU —
// that leaves >12ms of the 16.6ms/frame (60fps) budget for scene + JS.
const BUDGET_MS = 4;

const fullscreenVertexShader = /* glsl */ \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
\`;

// Teal-orange split-tone: shadows pull toward uShadowTint, highlights pull
// toward uHighlightTint. Runs AFTER OutputPass — a grade expects [0,1] input.
const gradeFragmentShader = /* glsl */ \`
  uniform sampler2D tDiffuse;
  uniform vec3 uShadowTint;
  uniform vec3 uHighlightTint;
  varying vec2 vUv;

  void main() {
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));

    // Shadows lean uShadowTint, highlights lean uHighlightTint — the classic
    // teal-orange split-tone, done as one lerp driven by scene luminance.
    vec3 graded = color * mix(uShadowTint, uHighlightTint, luma);

    gl_FragColor = vec4(clamp(graded, 0.0, 1.0), 1.0);
  }
\`;

// Custom Pass subclass: scanline drift + vignette + grain merged into ONE
// shader (the "merge single-input effects" move from pass-order-and-fillrate).
const lookFragmentShader = /* glsl */ \`
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uScanlineSpeed;
  uniform float uScanlineStrength;
  uniform float uVignette;
  uniform float uGrain;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec3 color = texture2D(tDiffuse, vUv).rgb;

    // sin() driven by vUv.y and time drifts the line pattern downward;
    // remap [-1,1] -> [0,1] then raise to a power so each line stays thin
    // instead of a smooth 50%-duty sine wave.
    float wave = sin(vUv.y * 340.0 - uTime * uScanlineSpeed) * 0.5 + 0.5;
    float line = pow(wave, 8.0);
    color *= 1.0 - line * uScanlineStrength;

    vec2 centered = vUv - 0.5;
    float vignette = 1.0 - dot(centered, centered) * uVignette;
    color *= clamp(vignette, 0.0, 1.0);

    float noise = hash(vUv * 3400.0 + uTime) - 0.5;
    color += noise * uGrain;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
\`;

class NeonNoirLookPass extends Pass {
  material: THREE.ShaderMaterial;
  private quad: FullScreenQuad;

  constructor() {
    super();
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uScanlineSpeed: { value: 0.6 },
        uScanlineStrength: { value: 0.18 },
        uVignette: { value: 1.7 },
        uGrain: { value: 0.06 },
      },
      vertexShader: fullscreenVertexShader,
      fragmentShader: lookFragmentShader,
    });
    this.quad = new FullScreenQuad(this.material);
  }

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
  ) {
    this.material.uniforms.tDiffuse!.value = readBuffer.texture;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
    }
    this.quad.render(renderer);
  }

  setTime(t: number) {
    this.material.uniforms.uTime!.value = t;
  }

  dispose() {
    this.material.dispose();
    this.quad.dispose();
  }
}

interface SignatureStackProps {
  measure?: boolean;
  onFrameMs?: (ms: number) => void;
  children?: ReactNode;
}

// Mount as a wrapper around your scene content:
// <SignatureEffectStack><NeonNoirAccents /></SignatureEffectStack>
export function SignatureEffectStack({ measure = true, onFrameMs, children }: SignatureStackProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const passes = useMemo(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);

    // Bloom runs BEFORE tone mapping (see pass-order-and-fillrate) so it
    // extracts true HDR brightness from the emissive accents below, not an
    // already tone-mapped image.
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.3,
      0.6,
      0.7,
    );

    const outputPass = new OutputPass(); // tone map (ACES) + sRGB encode

    const gradePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uShadowTint: { value: new THREE.Color(0.55, 0.75, 0.85) },
        uHighlightTint: { value: new THREE.Color(1.15, 0.85, 0.55) },
      },
      vertexShader: fullscreenVertexShader,
      fragmentShader: gradeFragmentShader,
    });

    const lookPass = new NeonNoirLookPass();

    // Canonical order: scene -> bloom -> tone map -> grade -> stylistic look.
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    composer.addPass(gradePass);
    composer.addPass(lookPass);

    return { composer, renderPass, bloomPass, outputPass, gradePass, lookPass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    passes.composer.setSize(size.width, size.height);
  }, [passes, size.width, size.height]);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
  }, [gl]);

  useEffect(() => {
    return () => {
      passes.composer.dispose();
      passes.bloomPass.dispose();
      passes.outputPass.dispose();
      passes.gradePass.dispose();
      passes.lookPass.dispose();
    };
  }, [passes]);

  const emaRef = useRef(0);
  useFrame((state) => {
    passes.lookPass.setTime(state.clock.elapsedTime);

    if (!measure) {
      passes.composer.render();
      return;
    }

    const t0 = performance.now();
    passes.composer.render();
    const dt = performance.now() - t0;
    emaRef.current = emaRef.current === 0 ? dt : emaRef.current * 0.9 + dt * 0.1;
    onFrameMs?.(emaRef.current);

    if (emaRef.current > BUDGET_MS) {
      console.warn(
        "SignatureEffectStack over budget: " + emaRef.current.toFixed(2) + "ms > " + BUDGET_MS + "ms",
      );
    }
  }, 1);

  return <>{children}</>;
}

// Example accents demonstrating the signature — swap colors/positions/count
// for your own look; that swap IS the point of this checkpoint.
export function NeonNoirAccents() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0c0e14" roughness={0.95} toneMapped={false} />
      </mesh>
      <mesh position={[-1, 0.4, 0]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#ff2e88" emissive="#ff2e88" emissiveIntensity={7} toneMapped={false} />
      </mesh>
      <mesh position={[1, 0.3, -0.4]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#21e6ff" emissive="#21e6ff" emissiveIntensity={9} toneMapped={false} />
      </mesh>
    </>
  );
}`,
    hints: [
      {
        vi: "Học thuyết thứ tự: scene(HDR) → bloom → tone mapping → grade → hiệu ứng phong cách → màn hình. Bloom phải đọc buffer HDR còn nguyên (giá trị có thể > 1.0) để quầng sáng phản ánh đúng độ chói thật; tone mapping là bước DUY NHẤT nén HDR về [0,1]; grade và hiệu ứng phong cách đều giả định input đã nằm gọn trong [0,1].",
        en: "The order doctrine: scene(HDR) → bloom → tone mapping → grade → stylistic effect → screen. Bloom must read the still-intact HDR buffer (values can exceed 1.0) so its glow reflects true brightness; tone mapping is the ONE step compressing HDR into [0,1]; both grade and the stylistic effect assume input already sits inside [0,1].",
      },
      {
        vi: "Một custom pass chỉ cần 4 thứ: kế thừa `Pass`, giữ một `ShaderMaterial` + `FullScreenQuad(material)`, cài `render(renderer, writeBuffer, readBuffer)` đọc `readBuffer.texture` vào uniform `tDiffuse` rồi ghi ra `writeBuffer` (hoặc màn hình khi `this.renderToScreen`), và `dispose()` chính material của mình — xem lại bài writing-custom-passes nếu cần.",
        en: "A custom pass only needs 4 things: extend `Pass`, hold a `ShaderMaterial` + `FullScreenQuad(material)`, implement `render(renderer, writeBuffer, readBuffer)` reading `readBuffer.texture` into your `tDiffuse` uniform and writing to `writeBuffer` (or the screen when `this.renderToScreen`), and `dispose()` your own material — revisit the writing-custom-passes lesson if needed.",
      },
      {
        vi: "Đo bằng `const t0 = performance.now(); composer.render(); const dt = performance.now() - t0;` rồi làm mượt bằng EMA (`ema = ema*0.9 + dt*0.1`) để một frame chậm đột ngột không làm số đo giật — đúng kỹ thuật demo của bài pass-order-and-fillrate dùng.",
        en: "Measure with `const t0 = performance.now(); composer.render(); const dt = performance.now() - t0;` then smooth with an EMA (`ema = ema*0.9 + dt*0.1`) so one sudden slow frame doesn't spike the readout — the exact technique the pass-order-and-fillrate lesson's demo uses.",
      },
    ],
    checklist: [
      {
        vi: "Phong cách nhìn rõ ràng và có chủ đích (không phải nhiều hiệu ứng ngẫu nhiên chồng lên nhau)",
        en: "The look is visually distinct and intentional (not several random effects stacked with no direction)",
      },
      {
        vi: "Chuỗi có ít nhất 4 pass hậu kỳ đúng thứ tự chuẩn (bloom → tone mapping → grade → hiệu ứng phong cách)",
        en: "The chain has at least 4 post-processing passes in the correct canonical order (bloom → tone mapping → grade → stylistic effect)",
      },
      {
        vi: "Thứ tự pass giải trình được bằng lý do (bloom đọc HDR thật, grade/hiệu ứng phong cách đọc ảnh đã nén) — không chỉ chép đúng vị trí",
        en: "The pass order can be justified by reasoning (bloom reads true HDR, grade/stylistic read the compressed image) — not just copied into the right position",
      },
      {
        vi: "Custom pass (kế thừa `Pass`) chạy đúng khi test độc lập — tự nó tạo hiệu ứng nhìn thấy được, không phụ thuộc các pass khác có bật hay không",
        en: "The custom pass (extending `Pass`) works correctly when tested in isolation — it produces a visible effect on its own, regardless of whether other passes are enabled",
      },
      {
        vi: "Ngân sách được chứng minh bằng số đo thật: EMA frame time hiển thị/log ra, có cờ bật/tắt việc đo, và nêu rõ một con số ngân sách cụ thể",
        en: "The budget is proven with a real measurement: EMA frame time is displayed/logged, gated behind an on/off flag, with a concrete stated budget number",
      },
      {
        vi: "Không rò rỉ GPU qua nhiều lần mount/unmount lại — composer VÀ mọi pass tự tạo đều gọi `dispose()`",
        en: "No GPU leak across repeated mount/unmount cycles — the composer AND every self-created pass call `dispose()`",
      },
      {
        vi: "Các tham số then chốt của phong cách (màu tint, cường độ scanline, vignette, grain) đều là uniform chỉnh được, không hardcode cứng trong shader",
        en: "The key style parameters (tint colors, scanline strength, vignette, grain) are all tunable uniforms, not hardcoded inside the shader",
      },
    ],
  },
];
