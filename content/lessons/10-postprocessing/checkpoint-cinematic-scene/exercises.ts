import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-cinematic-scene",
    kind: "build",
    prompt: {
      vi: `Dựng một component \`CinematicScene\` bằng React Three Fiber: một cảnh still-life có sẵn (bình gốm, quả cam, chồng sách, và một "bóng đèn" phát sáng) trong starter — việc của bạn là hoàn thành chuỗi \`EffectComposer\` gồm đúng năm pass, theo đúng thứ tự: \`RenderPass → SSAOPass → UnrealBloomPass → BokehPass → OutputPass\`.

SSAO phải làm cảnh "bám đất" (bóng tiếp xúc dưới bình/sách) mà không quầng viền ở rìa mặt đất. Bloom chỉ được nở ở bóng đèn — threshold trên $1.0$ để chỉ giá trị HDR chưa tonemap của bóng đèn vượt ngưỡng, còn mọi bề mặt chiếu sáng bình thường thì không. DOF (Bokeh) phải lấy nét đúng cái bình (chủ thể), làm mờ nền phía sau — \`focus\` tính từ khoảng cách camera thật tới chủ thể, không phải một số cố định.

Đo frame time của \`composer.render()\` bằng \`performance.now()\`, EMA-smoothed, khi \`passChainEnabled\` bật (chạy cả chuỗi) và tắt (chỉ \`gl.render(scene, camera)\` làm baseline) — log ra định kỳ để so sánh chênh lệch.

Phần cảnh JSX (still-life + ánh sáng) và khung component đã đầy đủ trong starter — việc của bạn là hoàn thành đúng 8 TODO bên trong \`PostFx\`.`,
      en: `Build a \`CinematicScene\` component with React Three Fiber: a provided still-life scene (a ceramic vase, an orange, a stack of books, and a glowing "lamp") is already in the starter — your job is to complete an \`EffectComposer\` chain of exactly five passes, in this exact order: \`RenderPass → SSAOPass → UnrealBloomPass → BokehPass → OutputPass\`.

SSAO must ground the scene (contact shadows under the vase/books) without a visible halo at the ground plane's edge. Bloom must bloom ONLY the lamp — a threshold above $1.0$ so only the lamp's un-tonemapped HDR value crosses it, while every normally-lit surface stays under it. DOF (Bokeh) must keep the vase (the subject) sharp and melt the background behind it — \`focus\` computed from the camera's real distance to the subject, not a hardcoded number.

Measure \`composer.render()\`'s frame time with \`performance.now()\`, EMA-smoothed, with \`passChainEnabled\` on (the full chain runs) and off (a plain \`gl.render(scene, camera)\` baseline) — log it periodically to compare the delta.

The scene JSX (still-life + lighting) and the component scaffold are already complete in the starter — your job is to finish exactly 8 TODOs inside \`PostFx\`.`,
    },
    starterCode: `"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// Shared between the JSX scene below and the composer setup — BokehPass
// needs the subject's world position to compute a focus distance.
const SUBJECT = new THREE.Vector3(0, 0.55, 0); // the vase, DOF's focus target
const LAMP_POSITION: [number, number, number] = [-1.15, 1.25, -0.35];

// --- given: the still-life scene, complete, nothing to change here -------
function StillLife() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#4a3b32" roughness={0.95} />
      </mesh>

      {/* the vase — DOF's focus subject */}
      <mesh position={SUBJECT.toArray()}>
        <cylinderGeometry args={[0.35, 0.45, 1.1, 24]} />
        <meshStandardMaterial color="#b5623a" roughness={0.6} />
      </mesh>

      <mesh position={[0.7, 0.28, 0.45]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#d97a2b" roughness={0.4} />
      </mesh>

      <mesh position={[-0.65, 0.06, 0.35]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.65]} />
        <meshStandardMaterial color="#7a2c2c" roughness={0.7} />
      </mesh>

      {/* the lamp — the ONLY thing meant to bloom */}
      <mesh position={LAMP_POSITION}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fff1d0" emissive="#ffb35c" emissiveIntensity={3.2} />
      </mesh>
      <pointLight position={LAMP_POSITION} color="#ffb35c" intensity={4} decay={2} distance={6} />
      <hemisphereLight args={["#3a2c22", "#241b16", 0.25]} />
    </>
  );
}
// --- end given scene -------------------------------------------------------

interface FxState {
  composer: EffectComposer;
  ssao: SSAOPass;
  bloom: UnrealBloomPass;
  bokeh: BokehPass;
  output: OutputPass;
}

function PostFx({ passChainEnabled = true }: { passChainEnabled?: boolean }) {
  const { gl, scene, camera, size } = useThree();
  const stateRef = useRef<FxState | null>(null);
  const emaRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    // TODO 1: tone mapping matters here — set it on \`gl\` BEFORE building the
    // passes below. Read three/addons/postprocessing/OutputPass.js's
    // docblock in node_modules for why THIS pass must be the last one added.

    // TODO 2: build the chain in this exact order: RenderPass, SSAOPass,
    // UnrealBloomPass, BokehPass, OutputPass. Use \`size.width\`/\`size.height\`
    // for every pass constructor that takes a width/height, then call
    // composer.setSize(size.width, size.height) once at the end.

    // TODO 3: tune ssao.kernelRadius / minDistance / maxDistance so contact
    // shadows read under the vase and the book, without a visible halo at
    // the ground plane's silhouette.

    // TODO 4: tune the bloom pass's threshold ABOVE 1.0 (its 4th
    // constructor argument) — cross-check against UnrealBloomPass.js in
    // node_modules that only pixels brighter than 1.0 in the composer's
    // linear (un-tonemapped) buffer contribute to the glow.

    // TODO 5: compute the Bokeh pass's \`focus\` from
    // camera.position.distanceTo(SUBJECT) instead of a hardcoded number —
    // move the camera and focus should track the subject automatically.

    return () => {
      // TODO 6: dispose ssao/bloom/bokeh/output individually, THEN
      // composer.dispose() — read EffectComposer.js's dispose() method in
      // node_modules first; it does NOT walk composer.passes for you.
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    // TODO 7: on size change, call composer.setSize(size.width, size.height)
    // — this internally resizes EVERY pass's buffers — and separately
    // resync bokeh.materialBokeh.uniforms.aspect.value to the camera's
    // current aspect (BokehPass reads camera.aspect once at construction,
    // never again on its own).
  }, [size, camera]);

  useFrame(() => {
    const st = stateRef.current;
    if (!st) return;

    // TODO 8: wrap either st.composer.render() (when passChainEnabled) or a
    // plain gl.render(scene, camera) baseline (otherwise) in
    // performance.now() timestamps. EMA-smooth the delta into
    // emaRef.current (e.g. ema = ema * 0.9 + dt * 0.1) and log it roughly
    // every 60 frames — this is the number the checklist below asks for.
  }, 1);

  return null;
}

export function CinematicScene({ passChainEnabled = true }: { passChainEnabled?: boolean }) {
  return (
    <>
      <StillLife />
      <PostFx passChainEnabled={passChainEnabled} />
    </>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const SUBJECT = new THREE.Vector3(0, 0.55, 0); // the vase, DOF's focus target
const LAMP_POSITION: [number, number, number] = [-1.15, 1.25, -0.35];

function StillLife() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#4a3b32" roughness={0.95} />
      </mesh>

      {/* the vase — DOF's focus subject */}
      <mesh position={SUBJECT.toArray()}>
        <cylinderGeometry args={[0.35, 0.45, 1.1, 24]} />
        <meshStandardMaterial color="#b5623a" roughness={0.6} />
      </mesh>

      <mesh position={[0.7, 0.28, 0.45]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#d97a2b" roughness={0.4} />
      </mesh>

      <mesh position={[-0.65, 0.06, 0.35]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.65]} />
        <meshStandardMaterial color="#7a2c2c" roughness={0.7} />
      </mesh>

      {/* the lamp — the ONLY thing meant to bloom */}
      <mesh position={LAMP_POSITION}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fff1d0" emissive="#ffb35c" emissiveIntensity={3.2} />
      </mesh>
      <pointLight position={LAMP_POSITION} color="#ffb35c" intensity={4} decay={2} distance={6} />
      <hemisphereLight args={["#3a2c22", "#241b16", 0.25]} />
    </>
  );
}

interface FxState {
  composer: EffectComposer;
  ssao: SSAOPass;
  bloom: UnrealBloomPass;
  bokeh: BokehPass;
  output: OutputPass;
}

function PostFx({ passChainEnabled = true }: { passChainEnabled?: boolean }) {
  const { gl, scene, camera, size } = useThree();
  const stateRef = useRef<FxState | null>(null);
  const emaRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    // Every pass renders into the composer's OFFSCREEN buffer except the
    // last one, and Three skips tone mapping/color-space conversion
    // whenever the active render target isn't the screen — so tone mapping
    // only actually happens inside OutputPass. Setting it here just
    // configures WHAT that final pass will do.
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;

    const composer = new EffectComposer(gl); // defaults to a HalfFloat internal buffer — required for emissiveIntensity > 1 to survive into the bloom threshold test below
    composer.addPass(new RenderPass(scene, camera));

    // SSAO right after the beauty pass: it darkens creases in whatever is
    // CURRENTLY in the buffer, so it must run before bloom adds a glow on
    // top — reverse the order and the lamp's halo gets partially eaten.
    const ssao = new SSAOPass(scene, camera, size.width, size.height);
    ssao.kernelRadius = 0.22; // scene is ~2 units across — wide enough to catch contact shadows under the vase/book, tight enough to avoid a halo at the ground's silhouette (estimate, tuned by eye)
    ssao.minDistance = 0.002;
    ssao.maxDistance = 0.05;
    composer.addPass(ssao);

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.55, // strength — a restrained glow, not a blowout
      0.35, // radius
      1.15, // threshold ABOVE 1.0: only the lamp's raw linear emissive value crosses it, every lit diffuse surface in this scene stays under 1
    );
    composer.addPass(bloom);

    const bokeh = new BokehPass(scene, camera, {
      focus: camera.position.distanceTo(SUBJECT), // ties focus to the actual subject instead of a magic number that breaks the moment the camera moves
      aperture: 0.0018, // small aperture: a slight background melt, not a lens-blur gimmick
      maxblur: 0.008,
    });
    composer.addPass(bokeh);

    const output = new OutputPass(); // must be last — reads gl.toneMapping/toneMappingExposure and does the sRGB conversion
    composer.addPass(output);

    composer.setSize(size.width, size.height); // normalizes every pass above to the composer's actual (DPR-multiplied) resolution in one call

    stateRef.current = { composer, ssao, bloom, bokeh, output };

    return () => {
      // composer.dispose() only frees ITS OWN read/write buffers + internal
      // copy pass (see EffectComposer.js) — it never walks composer.passes,
      // so every pass with its own render targets needs an explicit dispose.
      ssao.dispose();
      bloom.dispose();
      bokeh.dispose();
      output.dispose();
      composer.dispose();
      stateRef.current = null;
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    st.composer.setSize(size.width, size.height);
    // BokehPass reads camera.aspect once at construction time and never
    // again — resizing without this resync leaves DOF using a stale aspect
    // ratio after a container resize or orientation change.
    st.bokeh.materialBokeh.uniforms.aspect.value = (camera as THREE.PerspectiveCamera).aspect;
  }, [size, camera]);

  useFrame(() => {
    const st = stateRef.current;
    if (!st) return;

    const t0 = performance.now();
    if (passChainEnabled) {
      st.composer.render();
    } else {
      gl.render(scene, camera); // baseline: same scene, zero postprocessing passes
    }
    const dt = performance.now() - t0;
    emaRef.current = emaRef.current === 0 ? dt : emaRef.current * 0.9 + dt * 0.1;

    frameRef.current++;
    if (frameRef.current % 60 === 0) {
      console.log(
        \`\${passChainEnabled ? "composer.render()" : "gl.render() baseline"} EMA: \${emaRef.current.toFixed(2)}ms\`,
      );
    }
  }, 1);

  return null;
}

export function CinematicScene({ passChainEnabled = true }: { passChainEnabled?: boolean }) {
  return (
    <>
      <StillLife />
      <PostFx passChainEnabled={passChainEnabled} />
    </>
  );
}`,
    hints: [
      {
        vi: "Thứ tự pass: SSAO phải chạy TRƯỚC bloom. SSAO nhân bóng tiếp xúc lên đúng ảnh đang có trong buffer composer tại thời điểm nó chạy — nếu bloom chạy trước, glow của bóng đèn đã nằm sẵn trong buffer đó và bị SSAO ăn tối một phần.",
        en: "Pass order: SSAO must run BEFORE bloom. SSAO multiplies contact shadows onto whatever is currently in the composer's buffer at the moment it runs — run bloom first and the lamp's glow is already sitting in that buffer, partially darkened by SSAO.",
      },
      {
        vi: "Threshold của UnrealBloomPass phải lớn hơn $1.0$. Buffer bên trong composer giữ giá trị linear HDR chưa tonemap (Three tự tắt tonemapping khi render target khác null — xem WebGLRenderer.js), nên chỉ bóng đèn (emissiveIntensity > 1) mới vượt ngưỡng, còn mọi bề mặt chiếu sáng bình thường thì không.",
        en: "UnrealBloomPass's threshold must be greater than $1.0$. The composer's internal buffer holds linear, un-tonemapped HDR values (Three automatically skips tone mapping whenever the active render target isn't null — see WebGLRenderer.js), so only the lamp (emissiveIntensity > 1) crosses that threshold, while every normally-lit surface stays under it.",
      },
      {
        vi: "focus của BokehPass phải bằng khoảng cách thật từ camera đến chủ thể — \`camera.position.distanceTo(SUBJECT)\` — chứ không phải một số cố định đoán mò. Đổi vị trí camera, focus phải tự đổi theo.",
        en: "BokehPass's focus must equal the real distance from the camera to the subject — \`camera.position.distanceTo(SUBJECT)\` — not a guessed hardcoded number. Move the camera and focus should track it automatically.",
      },
    ],
    checklist: [
      {
        vi: "Cảnh đọc là \"tĩnh vật điện ảnh\" — ấm, có chiều sâu — chứ không phải một mớ hiệu ứng chồng lên nhau",
        en: "The scene reads as a \"cinematic still\" — warm, with depth — not a pile of effects stacked on top of each other",
      },
      {
        vi: "Chỉ bóng đèn phát bloom — không bề mặt chiếu sáng bình thường nào phát sáng ké",
        en: "Only the lamp blooms — no normally-lit surface glows along with it",
      },
      {
        vi: "Bóng tiếp xúc (AO) bám đúng chân bình/sách trên mặt đất, không có quầng viền lộ rõ ở rìa mặt đất",
        en: "Contact shadows (AO) sit correctly under the vase/books on the ground, with no visible halo at the ground plane's edge",
      },
      {
        vi: "Nền phía sau chủ thể mờ đi mượt mà, trong khi chủ thể (bình) vẫn giữ nét",
        en: "The background behind the subject melts smoothly out of focus, while the subject (the vase) stays sharp",
      },
      {
        vi: "Đo được số ms cụ thể cho composer.render() khi bật và khi tắt cả chuỗi pass, và chênh lệch nằm trong khoảng ước lượng ~4ms trên máy tầm trung",
        en: "Concrete ms numbers are measured for composer.render() with the pass chain on and off, and the delta sits within a ~4ms estimate on a midrange machine",
      },
      {
        vi: "Unmount không để lại render target nào sống sót — ssao/bloom/bokeh/output tự dispose, composer.dispose() gọi sau cùng",
        en: "Unmounting leaves no render target alive — ssao/bloom/bokeh/output each dispose themselves, with composer.dispose() called last",
      },
      {
        vi: "Thứ tự 5 pass đúng: RenderPass → SSAOPass → UnrealBloomPass → BokehPass → OutputPass",
        en: "The 5-pass order is correct: RenderPass → SSAOPass → UnrealBloomPass → BokehPass → OutputPass",
      },
    ],
  },
];
