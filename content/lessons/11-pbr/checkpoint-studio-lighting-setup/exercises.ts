import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-studio-lighting-setup",
    kind: "build",
    prompt: {
      vi: `Hoàn thành component \`StudioLightingSetup\`: một cảnh trình bày sản phẩm ba điểm sáng — key (\`RectAreaLight\`), fill (cường độ IBL), rim (\`RectAreaLight\` nhỏ phía sau) — cộng một đèn phụ CHỈ để đổ bóng mềm đúng hướng key, trên một sàn bệ bóng phản chiếu đúng hình dạng panel.

Skeleton (JSX ba đèn, sàn, vật thể trưng bày) đã đầy đủ — việc của bạn là lấp 6 TODO trong effect thiết lập: (1) bật shadow map trên renderer với \`PCFSoftShadowMap\`, (2) hướng key và rim vào vật thể, (3) cấu hình đèn đổ bóng phụ (cùng hướng key, cường độ gần như 0, \`castShadow\`, mapSize + bias hợp lý), (4) dựng \`RoomEnvironment\` qua \`PMREMGenerator\` làm \`scene.environment\` với \`environmentIntensity\` đóng vai trò fill (~1/4 so với key, ước lượng), (5) chỉnh \`toneMappingExposure\`, (6) dispose sạch mọi tài nguyên tạo ra khi unmount.`,
      en: `Complete the \`StudioLightingSetup\` component: a three-point product-presentation scene — key (\`RectAreaLight\`), fill (the IBL's own strength), rim (a small \`RectAreaLight\` behind the subject) — plus a dedicated light that ONLY casts a soft shadow in the key's direction, on a glossy pedestal floor that reflects the panel's shape correctly.

The skeleton (the three lights' JSX, the floor, the showcased object) is complete — your job is filling 6 TODOs in the setup effect: (1) enable the renderer's shadow map with \`PCFSoftShadowMap\`, (2) aim the key and rim at the subject, (3) configure the dedicated shadow light (same direction as the key, near-zero intensity, \`castShadow\`, sensible mapSize + bias), (4) build a \`RoomEnvironment\` through \`PMREMGenerator\` as \`scene.environment\` with \`environmentIntensity\` acting as the fill (~1/4 of the key, estimated), (5) tune \`toneMappingExposure\`, (6) dispose every resource you created on unmount.`,
    },
    starterCode: `"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Once, before any RectAreaLight renders (spec: RectAreaLight.js doc comment).
RectAreaLightUniformsLib.init();

const SUBJECT = new THREE.Vector3(0, 0.55, 0);

export function StudioLightingSetup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const keyRef = useRef<THREE.RectAreaLight>(null!);
  const rimRef = useRef<THREE.RectAreaLight>(null!);
  const shadowLightRef = useRef<THREE.DirectionalLight>(null!);

  useEffect(() => {
    // TODO 1: renderer shadow setup — gl.shadowMap.enabled = true,
    // gl.shadowMap.type = THREE.PCFSoftShadowMap.

    // TODO 2: point the key and rim RectAreaLights at SUBJECT (.lookAt).

    // TODO 3: the key has NO shadow support (area-lights-and-probes lesson) —
    // configure shadowLightRef.current instead: same direction as the key,
    // intensity near 0 (it must NOT visibly light the scene, only shadow it),
    // castShadow = true, shadow.mapSize set, shadow.bias tuned to avoid acne.

    // TODO 4: build the PMREM environment (RoomEnvironment + PMREMGenerator),
    // assign scene.environment, and set scene.environmentIntensity as the
    // FILL — well below the key's contribution.

    // TODO 5: tune gl.toneMapping (ACESFilmicToneMapping) and
    // gl.toneMappingExposure so highlights keep detail.

    return () => {
      // TODO 6: dispose the env texture (and anything else you created here).
    };
  }, [gl, scene]);

  return (
    <>
      <rectAreaLight
        ref={keyRef}
        color="#fff4e0"
        position={[2.4, 2.6, 2.0]}
        width={2.4}
        height={1.4}
        intensity={9}
      />
      <rectAreaLight
        ref={rimRef}
        color="#bcd4ff"
        position={[-0.8, 2.2, -2.6]}
        width={1.0}
        height={1.6}
        intensity={14}
      />
      <directionalLight ref={shadowLightRef} position={[2.4, 2.6, 2.0]} intensity={0} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#1b1c20" roughness={0.18} metalness={0.5} />
      </mesh>

      {/* the showcased object — purely parameter-driven, no textures/assets */}
      <mesh position={[SUBJECT.x, SUBJECT.y, SUBJECT.z]} castShadow receiveShadow>
        <torusKnotGeometry args={[0.4, 0.14, 160, 32]} />
        <meshStandardMaterial color="#8a6a3f" roughness={0.22} metalness={0.75} />
      </mesh>
    </>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Once, before any RectAreaLight renders (spec: RectAreaLight.js doc comment).
RectAreaLightUniformsLib.init();

const SUBJECT = new THREE.Vector3(0, 0.55, 0);

export function StudioLightingSetup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const keyRef = useRef<THREE.RectAreaLight>(null!);
  const rimRef = useRef<THREE.RectAreaLight>(null!);
  const shadowLightRef = useRef<THREE.DirectionalLight>(null!);

  useEffect(() => {
    // 1. PCFSoftShadowMap — the softest built-in filter, matches a softbox key.
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Aim both RectAreaLights at the subject — RectAreaLight has no target
    // object like SpotLight/DirectionalLight, orientation comes from lookAt.
    keyRef.current.lookAt(SUBJECT);
    rimRef.current.lookAt(SUBJECT);

    // 3. Shadow-only proxy for the key: RectAreaLight cannot cast shadows at
    // all (three.js has no shadow-map path for it), so a DirectionalLight
    // aimed the SAME direction as the key stands in purely for its shadow.
    // intensity is kept near 0 so it never visibly re-lights the scene —
    // the key's RectAreaLight remains the only thing actually shading it.
    const shadowLight = shadowLightRef.current;
    shadowLight.position.copy(keyRef.current.position);
    shadowLight.target.position.copy(SUBJECT);
    scene.add(shadowLight.target);
    shadowLight.intensity = 0.02; // negligible direct contribution, shadow only
    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.set(1024, 1024);
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 8;
    shadowLight.shadow.camera.left = -2;
    shadowLight.shadow.camera.right = 2;
    shadowLight.shadow.camera.top = 2;
    shadowLight.shadow.camera.bottom = -2;
    // Small negative bias fights acne without visible peter-panning at this
    // scene scale — a typical starting range for a 1024 map, tuned by eye.
    shadowLight.shadow.bias = -0.0015;
    shadowLight.shadow.radius = 3;

    // 4. RoomEnvironment through PMREMGenerator = the reflection bed AND the
    // fill light. Key intensity is 9; classic studio key:fill is roughly
    // 4:1, so environmentIntensity is kept low enough that the environment
    // reads as fill, not as a second key (0.28 is an eyeballed estimate,
    // not derived — RoomEnvironment's own brightness doesn't map linearly
    // to RectAreaLight intensity units).
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    scene.environment = envTexture;
    scene.background = new THREE.Color("#0c0d10");
    scene.environmentIntensity = 0.28;

    // 5. ACES + a touch over 1.0 exposure: opens shadow detail slightly
    // without letting the key's highlight on the torus knot clip to white.
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;

    return () => {
      // 6. Every GPU resource created in this effect must go — this canvas
      // is reused by other demos/checkpoints on the same page.
      scene.environment = null;
      envTexture.dispose();
      scene.remove(shadowLight.target);
    };
  }, [gl, scene]);

  return (
    <>
      <rectAreaLight
        ref={keyRef}
        color="#fff4e0"
        position={[2.4, 2.6, 2.0]}
        width={2.4}
        height={1.4}
        intensity={9}
      />
      <rectAreaLight
        ref={rimRef}
        color="#bcd4ff"
        position={[-0.8, 2.2, -2.6]}
        width={1.0}
        height={1.6}
        intensity={14}
      />
      <directionalLight ref={shadowLightRef} position={[2.4, 2.6, 2.0]} intensity={0} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#1b1c20" roughness={0.18} metalness={0.5} />
      </mesh>

      {/* the showcased object — purely parameter-driven, no textures/assets */}
      <mesh position={[SUBJECT.x, SUBJECT.y, SUBJECT.z]} castShadow receiveShadow>
        <torusKnotGeometry args={[0.4, 0.14, 160, 32]} />
        <meshStandardMaterial color="#8a6a3f" roughness={0.22} metalness={0.75} />
      </mesh>
    </>
  );
}`,
    hints: [
      {
        vi: "Góc key 45°/45° là quy ước studio: đủ xiên để tạo bóng đổ có chiều sâu, nhưng không quá xiên tới mức làm mất hẳn ánh sáng ở mặt còn lại của vật thể — bắt đầu từ đó rồi tinh chỉnh bằng mắt, không có công thức chính xác duy nhất.",
        en: "The 45°/45° key angle is a studio convention: oblique enough to create shadows with real depth, but not so oblique that the subject's far side goes completely unlit — start there and tune by eye, there's no single exact formula.",
      },
      {
        vi: "Rim light chỉ cần đủ sáng để tạo một viền mảnh dọc theo silhouette phía đối diện camera — nếu nó chiếu cả vào phần mặt vật thể quay về camera, nó sẽ cạnh tranh với key thay vì tách nền.",
        en: "The rim only needs to be bright enough to draw a thin edge along the silhouette on the side facing away from the camera — if it spills onto the face the camera sees, it competes with the key instead of separating the subject from the background.",
      },
      {
        vi: "Phản chiếu trên sàn bóng cần đúng cả key VÀ environment — tắt environment mà chỉ để key, sàn sẽ có một vệt sáng hình chữ nhật nhưng phần còn lại đen kịt vì không còn gì để phản chiếu; đây chính là nguyên nhân #4 của bài why-assets-look-like-plastic.",
        en: "The glossy floor's reflection needs BOTH the key AND the environment — disable the environment and keep only the key, and the floor gets one rectangular bright streak while everything else reads black, because there's nothing else to reflect; this is exactly cause #4 from the why-assets-look-like-plastic lesson.",
      },
    ],
    checklist: [
      {
        vi: "Tỉ lệ ba điểm sáng đọc được bằng mắt: key rõ rệt nhất, fill (IBL) chỉ nâng nhẹ vùng tối, rim tách viền khỏi nền",
        en: "The three-point ratio reads clearly by eye: key is dominant, fill (IBL) only lifts shadows slightly, rim separates the edge from the background",
      },
      {
        vi: "Phản chiếu trên sàn có HÌNH DẠNG đúng theo panel key (chữ nhật/dải sáng nhận ra được, không phải một chấm)",
        en: "The floor's reflection is correctly SHAPED by the key panel (a recognizable rectangle/streak, not a single dot)",
      },
      {
        vi: "Bóng đổ mềm, không răng cưa (acne) và không bị peter-panning (tách khỏi vật thể)",
        en: "The shadow is soft, free of acne, and not peter-panning (detached from the object)",
      },
      {
        vi: "Exposure giữ được chi tiết highlight trên vật thể — không mảng nào cháy trắng hoàn toàn",
        en: "Exposure keeps highlight detail on the subject — no region blown fully white",
      },
      {
        vi: "Silhouette phía sau vật thể tách rõ khỏi nền nhờ rim, không bị chìm vào bóng tối",
        en: "The subject's back silhouette is clearly separated from the background by the rim, not lost in darkness",
      },
      {
        vi: "Đèn đổ bóng phụ không làm sáng cảnh rõ rệt — che nó đi (intensity=0) chỉ làm mất bóng, không làm tối cảnh đi thấy rõ",
        en: "The dedicated shadow light doesn't visibly re-light the scene — zeroing its intensity only removes the shadow, without noticeably darkening the scene",
      },
      {
        vi: "Mọi tài nguyên GPU tạo trong effect (env texture, shadow target) được dispose/remove đúng khi unmount, không rò rỉ qua nhiều lần mount lại",
        en: "Every GPU resource created in the effect (env texture, shadow target) is disposed/removed correctly on unmount, with no leak across repeated remounts",
      },
    ],
  },
];
