import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-material-study-grid",
    kind: "build",
    prompt: {
      vi: `Dựng lưới sweep vật liệu kinh điển bằng React Three Fiber: 6×6 quả cầu, trục \`metalness\` chạy 0 -> 1 theo cột, trục \`roughness\` chạy 0 -> 1 theo hàng, đặt dưới một environment procedural (\`RoomEnvironment\` qua \`PMREMGenerator\`) cộng đúng một key light — không HDRI thật, không thêm light nào khác.

Yêu cầu: đúng 36 quả cầu dùng chung MỘT \`SphereGeometry\`; mỗi quả cầu có material riêng với \`metalness\`/\`roughness\` tính từ chỉ số hàng/cột; nhãn hai trục bằng \`Text\` hoặc \`Html\` của drei; environment dispose đầy đủ (render target + PMREMGenerator + scene nguồn) khi unmount hoặc rebuild.

Sau khi lưới chạy đúng, viết một khối comment ngay trong code đối chiếu ba quan sát với lý thuyết Fresnel/microfacet đã học: vì sao hàng dielectric ($metalness=0$) sáng lên ở góc xiên, vì sao hàng kim loại ($metalness=1$) nhuốm màu albedo, và vì sao hàng giữa ($metalness \\approx 0.5$) trông sai vật lý so với hai đầu.`,
      en: `Build the classic material-sweep grid in React Three Fiber: 6×6 spheres, \`metalness\` running 0 -> 1 across columns, \`roughness\` running 0 -> 1 across rows, sitting under a procedural environment (\`RoomEnvironment\` via \`PMREMGenerator\`) plus exactly one key light — no real HDRI, no other lights added.

Requirements: exactly 36 spheres sharing ONE \`SphereGeometry\`; each sphere gets its own material with \`metalness\`/\`roughness\` computed from its row/column index; both axes labeled with drei's \`Text\` or \`Html\`; the environment fully disposed (render target + PMREMGenerator + source scene) on unmount or rebuild.

Once the grid runs correctly, write a comment block right in the code cross-checking three observations against the Fresnel/microfacet theory you learned: why the dielectric row ($metalness=0$) brightens at grazing angles, why the metal row ($metalness=1$) tints with the albedo color, and why the middle row ($metalness \\approx 0.5$) looks physically wrong compared to both ends.`,
    },
    starterCode: `"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const GRID_SIZE = 6;
const SPACING = 1.3;
const RADIUS = 0.5;
// Kim loại "màu" (không trắng) — hàng metalness=1 phải nhuốm đúng màu này,
// hàng metalness=0 phải KHÔNG nhuốm màu (F0 dielectric trung tính ~0.04).
const BASE_COLOR = "#b8813a";

function levelAt(i: number) {
  return i / (GRID_SIZE - 1); // 0, 0.2, 0.4, 0.6, 0.8, 1.0
}

function gridOffset(i: number) {
  return (i - (GRID_SIZE - 1) / 2) * SPACING;
}

function MaterialGrid() {
  // TODO 1: MỘT SphereGeometry dùng chung, tạo bằng useMemo (Track 4 pattern)
  // — dispose trong cleanup effect vì geometry tạo bằng \`new\` ngoài JSX
  // không được R3F tự dispose.

  // TODO 2: nested loop row (roughness) x col (metalness), GRID_SIZE x
  // GRID_SIZE. metalness = levelAt(col), roughness = levelAt(row), vị trí =
  // [gridOffset(col), gridOffset(row), 0]. Mỗi quả cầu dùng chung geometry
  // (qua prop geometry=) nhưng có MeshStandardMaterial RIÊNG.

  return <group />;
}

function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    // TODO 3: new THREE.PMREMGenerator(gl) + new RoomEnvironment(), rồi
    // pmrem.fromScene(room).texture -> scene.environment. Dispose room ngay
    // sau khi build xong PMREM. Return cleanup: scene.environment = null,
    // dispose render target + pmrem.
  }, [gl, scene]);
  return null;
}

function AxisLabels() {
  // TODO 4: hai <Text> của drei — "metalness: 0 -> 1" dọc theo cạnh dưới,
  // "roughness: 0 -> 1" dọc theo cạnh trái (xoay 90 độ).
  return null;
}

export default function MaterialStudyGrid() {
  const half = ((GRID_SIZE - 1) / 2) * SPACING;
  return (
    <Canvas camera={{ position: [0, 0, half * 2.6 + 4], fov: 45 }}>
      <StudioEnvironment />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <MaterialGrid />
      <AxisLabels />
      <OrbitControls />
    </Canvas>
  );
}

// TODO 5: sau khi lưới chạy đúng, viết observation ở đây đối chiếu với lý
// thuyết Fresnel/microfacet (xem yêu cầu ở phần prompt).`,
    solutionCode: `"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const GRID_SIZE = 6;
const SPACING = 1.3;
const RADIUS = 0.5;
const BASE_COLOR = "#b8813a";

function levelAt(i: number) {
  return i / (GRID_SIZE - 1);
}

function gridOffset(i: number) {
  return (i - (GRID_SIZE - 1) / 2) * SPACING;
}

function MaterialGrid() {
  const geometry = useMemo(() => new THREE.SphereGeometry(RADIUS, 48, 48), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const rows = Array.from({ length: GRID_SIZE }, (_, i) => i);
  const cols = Array.from({ length: GRID_SIZE }, (_, i) => i);

  return (
    <group>
      {rows.map((row) =>
        cols.map((col) => (
          <mesh
            key={\`\${row}-\${col}\`}
            geometry={geometry}
            position={[gridOffset(col), gridOffset(row), 0]}
          >
            <meshStandardMaterial
              color={BASE_COLOR}
              metalness={levelAt(col)}
              roughness={levelAt(row)}
            />
          </mesh>
        )),
      )}
    </group>
  );
}

function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envRT = pmrem.fromScene(room);
    scene.environment = envRT.texture;
    room.dispose();

    return () => {
      scene.environment = null;
      envRT.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function AxisLabels() {
  const half = ((GRID_SIZE - 1) / 2) * SPACING;
  return (
    <>
      <Text
        position={[0, -half - 1, 0]}
        fontSize={0.35}
        color="#e5e7eb"
        anchorX="center"
        anchorY="middle"
      >
        metalness: 0 -&gt; 1
      </Text>
      <Text
        position={[-half - 1, 0, 0]}
        fontSize={0.35}
        color="#e5e7eb"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        roughness: 0 -&gt; 1
      </Text>
    </>
  );
}

export default function MaterialStudyGrid() {
  const half = ((GRID_SIZE - 1) / 2) * SPACING;
  return (
    <Canvas camera={{ position: [0, 0, half * 2.6 + 4], fov: 45 }}>
      <StudioEnvironment />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <MaterialGrid />
      <AxisLabels />
      <OrbitControls />
    </Canvas>
  );
}

// Observations vs. theory:
//
// 1. Dielectric row (metalness=0, bottom-left to bottom-right along
//    roughness=0): orbiting the camera to a grazing angle brightens the
//    specular rim on every sphere in this row even though BASE_COLOR is a
//    warm copper tone — exactly the Schlick prediction F(theta) rising
//    toward 1 as theta->90 degrees, independent of the low F0~=0.04 base.
//
// 2. Metal row (metalness=1, top row): reflections are tinted the same
//    copper color as BASE_COLOR, because F0 = albedo when metalness=1 (no
//    diffuse term survives) — the env reflection literally IS the material
//    color modulated by the room's lighting.
//
// 3. Middle row (metalness=0.5): looks physically wrong because real-world
//    materials are essentially never partially metallic at the microfacet
//    level (a surface is either bare metal or it isn't) — this row is a
//    blend Three.js happily computes (diffuseColor scaled by 1-metalness,
//    F0 lerped toward albedo) but that blend has no physical referent,
//    which is why production textures paint metalness as a near-binary
//    mask instead of a smooth gradient.`,
    hints: [
      {
        vi: "Dùng nested loop (hoặc nested .map) qua row/col từ 0 đến GRID_SIZE-1 rồi suy ra vị trí bằng gridOffset(index) — mỗi quả cầu chỉ khác nhau ở position và ở cặp metalness/roughness lấy từ levelAt(row)/levelAt(col).",
        en: "Use a nested loop (or nested .map) over row/col from 0 to GRID_SIZE-1, then derive position with gridOffset(index) — each sphere differs only in position and in the metalness/roughness pair taken from levelAt(row)/levelAt(col).",
      },
      {
        vi: "Chỉ MỘT SphereGeometry cho cả lưới (tạo bằng useMemo, gắn qua prop geometry=), nhưng MỖI quả cầu phải có MeshStandardMaterial của riêng nó — dùng chung geometry là tiết kiệm bộ nhớ hợp lý (đúng pattern Track 4), dùng chung material thì cả 36 quả cầu sẽ đổi cùng lúc khi bạn định để mỗi ô có metalness/roughness riêng.",
        en: "Only ONE SphereGeometry for the whole grid (built with useMemo, attached via the geometry= prop), but EVERY sphere needs its OWN MeshStandardMaterial — sharing the geometry is the sensible memory-saving move (the Track 4 pattern), but sharing the material would make all 36 spheres change together when each cell is meant to carry its own metalness/roughness.",
      },
      {
        vi: "Environment dựng bằng new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment()).texture, gán cho scene.environment trong một useEffect lấy gl/scene từ useThree() — dispose CẢ BA thứ khi unmount: render target trả về, PMREMGenerator, và đặt lại scene.environment = null (RoomEnvironment tự dispose ngay sau khi build xong, không cần giữ lại).",
        en: "Build the environment with new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment()).texture, assign it to scene.environment inside a useEffect that reads gl/scene from useThree() — dispose ALL THREE things on unmount: the returned render target, the PMREMGenerator, and reset scene.environment = null (RoomEnvironment disposes itself right after the PMREM build, no need to keep it around).",
      },
    ],
    checklist: [
      {
        vi: "Lưới đúng cả hai trục: 6 mức metalness theo cột (0 -> 1), 6 mức roughness theo hàng (0 -> 1), đúng 36 quả cầu",
        en: "The grid is correct on both axes: 6 metalness levels across columns (0 -> 1), 6 roughness levels across rows (0 -> 1), exactly 36 spheres",
      },
      {
        vi: "Fresnel thấy rõ ở góc nhìn xiên trên hàng dielectric (metalness=0) — orbit camera ra góc thấp để kiểm tra viền sáng lên",
        en: "Fresnel is clearly visible at a grazing angle on the dielectric row (metalness=0) — orbit the camera to a low angle to confirm the rim brightens",
      },
      {
        vi: "Hàng kim loại (metalness=1) nhuốm đúng màu BASE_COLOR trong phản xạ, không phải màu trắng trung tính",
        en: "The metal row (metalness=1) tints its reflections with BASE_COLOR, not a neutral white",
      },
      {
        vi: "Hàng dielectric (metalness=0) giữ F0 trung tính — phản xạ specular KHÔNG nhuốm màu BASE_COLOR dù roughness thấp",
        en: "The dielectric row (metalness=0) keeps a neutral F0 — its specular reflection does NOT tint with BASE_COLOR even at low roughness",
      },
      {
        vi: "Environment (render target của PMREMGenerator, PMREMGenerator, và scene.environment) được dispose/reset đầy đủ khi component unmount — không rò rỉ GPU khi remount nhiều lần",
        en: "The environment (PMREMGenerator's render target, the PMREMGenerator, and scene.environment) is fully disposed/reset on unmount — no GPU leak across repeated remounts",
      },
      {
        vi: "Có một khối comment ghi lại quan sát về hàng metalness ~0.5 trông sai vật lý thế nào, đối chiếu với lý do microfacet/Fresnel đã học",
        en: "There is a comment block documenting the observation about why the metalness ~0.5 row looks physically wrong, cross-checked against the microfacet/Fresnel reasoning covered in theory",
      },
    ],
  },
];
