import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-profile-and-fix",
    kind: "build",
    prompt: {
      vi: `\`starterCode\` bên dưới là một cảnh R3F **cố tình dựng chậm** với đúng 3 bottleneck cài sẵn. Nhiệm vụ: dùng \`PerfMeter\` (đã hoàn chỉnh — đừng viết lại) để đo trước, xác định đúng cả 3 bottleneck bằng số liệu chứ không phải đọc code rồi đoán, sửa từng cái bằng kỹ thuật đã học ở hai bài trước, rồi viết bảng before/after ngay trong comment ở cuối file.

Ba bottleneck (không nói trước bottleneck nào ứng với đoạn code nào — tự tìm bằng \`renderer.info\`): 800 mesh riêng lẻ mỗi cái tự \`.clone()\` material của nó; một khối cầu build lại toàn bộ \`geometry\` mỗi frame chỉ để phập phồng; một ánh sáng phụ mang shadow map $4096 \\times 4096$.

Yêu cầu kỹ thuật: draw call sau khi sửa phải còn khoảng 5; không còn phép \`new\`/dispose geometry nào lặp lại bên trong \`useFrame\`; shadow map của ánh sáng phụ phải được giảm kích thước hoặc tắt hẳn, có lý do; hình ảnh cuối cùng (vị trí, màu, hiệu ứng phập phồng, bóng đổ từ key light) giữ nguyên.`,
      en: `The \`starterCode\` below is an R3F scene **deliberately built slow** with exactly 3 planted bottlenecks. Task: use \`PerfMeter\` (already complete — don't rebuild it) to measure first, identify all 3 bottlenecks from the numbers rather than reading the code and guessing, fix each with techniques from the two previous lessons, then write a before/after table right in a comment at the end of the file.

Three bottlenecks (deliberately not telling you which code maps to which — find them with \`renderer.info\`): 800 individual meshes each \`.clone()\`-ing its own material; a sphere that rebuilds its entire \`geometry\` every frame just to throb; a secondary light carrying a $4096 \\times 4096$ shadow map.

Technical requirements: draw calls after the fix must land around 5; no repeated geometry \`new\`/dispose inside \`useFrame\` anymore; the secondary light's shadow map must be shrunk or disabled, with a stated reason; the final visuals (positions, colors, throb effect, key-light shadow) stay unchanged.`,
    },
    starterCode: `"use client";
// Cảnh cố tình dựng CHẬM cho bài profile-and-fix — 3 bottleneck cài sẵn.
// Profiler (renderer.info + đồng hồ frame-time) đã có sẵn và CHẠY ĐÚNG bên
// dưới — đừng viết lại nó, chỉ cần ĐỌC nó trước khi sửa bất cứ dòng nào.

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

const COUNT = 800;

interface Stats {
  calls: number;
  frameMs: number;
  geometries: number;
  textures: number;
}

// Đã hoàn chỉnh — profiler thật, gọi onStats ~4 lần/giây (EMA frame time).
function PerfMeter({ onStats }: { onStats: (s: Stats) => void }) {
  const gl = useThree((s) => s.gl);
  const avgMs = useRef(16.7);
  const acc = useRef(0);

  useFrame((_state, delta) => {
    avgMs.current += (delta * 1000 - avgMs.current) * 0.1; // EMA
    acc.current += delta;
    if (acc.current < 0.25) return;
    acc.current = 0;
    onStats({
      calls: gl.info.render.calls,
      frameMs: avgMs.current,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    });
  });

  return null;
}

const boxGeometry = new THREE.BoxGeometry(0.16, 0.16, 0.16);
const baseMaterial = new THREE.MeshStandardMaterial({ roughness: 0.55 });

// TODO 1: mỗi box tự .clone() material RIÊNG chỉ để có màu khác nhau — 800
// material instance khác nhau dù cùng loại shader.
function SlowField() {
  const hues = useMemo(() => Array.from({ length: COUNT }, (_, i) => i / COUNT), []);
  const materials = useMemo(
    () =>
      hues.map((hue) => {
        const m = baseMaterial.clone();
        m.color.setHSL(hue, 0.6, 0.55);
        return m;
      }),
    [hues],
  );

  return (
    <>
      {hues.map((_, i) => (
        <mesh
          key={i}
          geometry={boxGeometry}
          material={materials[i]}
          position={[((i % 40) - 20) * 0.4, Math.floor(i / 40) * 0.4 - 4, 0]}
        />
      ))}
    </>
  );
}

// TODO 2: rebuild TOÀN BỘ geometry mỗi frame chỉ để làm hiệu ứng "phập phồng".
function ThrobbingBlob() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const old = mesh.geometry;
    const geo = new THREE.SphereGeometry(1.1, 32, 32);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const wobble = 1 + Math.sin(t * 2 + i * 0.08) * 0.06;
      pos.setXYZ(i, pos.getX(i) * wobble, pos.getY(i) * wobble, pos.getZ(i) * wobble);
    }
    mesh.geometry = geo;
    old.dispose();
  });

  return (
    <mesh ref={meshRef} position={[0, 3.2, 0]}>
      <sphereGeometry args={[1.1, 32, 32]} />
      <meshStandardMaterial color="#f97316" />
    </mesh>
  );
}

// TODO 3: ánh sáng PHỤ (chỉ soften bóng của key light) mang shadow map to
// nhất cảnh — ngân sách shadow đặt sai chỗ.
function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -3]} intensity={0.25} castShadow shadow-mapSize={[4096, 4096]} />
    </>
  );
}

export function SlowScene({ onStats }: { onStats: (s: Stats) => void }) {
  return (
    <>
      <Lights />
      <SlowField />
      <ThrobbingBlob />
      <PerfMeter onStats={onStats} />
    </>
  );
}

// TODO 4: sau khi sửa xong, điền bảng before/after vào đây (đo trên máy dev,
// nhãn rõ "ước lượng" nếu không đo chính xác được):
// | Chỉ số                          | Trước | Sau |
// |----------------------------------|-------|-----|
// | renderer.info.render.calls       |       |     |
// | Frame time (ms, EMA)             |       |     |
// | renderer.info.memory.geometries  |       |     |
// | Shadow map ánh sáng phụ          |       |     |`,
    solutionCode: `"use client";
// ĐÃ SỬA — cùng hình ảnh, 3 bottleneck gốc bị loại bỏ bằng đúng kỹ thuật đã
// học ở draw-calls-batching-instancing (Track 12). Bảng đo ở cuối file.

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

const COUNT = 800;

interface Stats {
  calls: number;
  frameMs: number;
  geometries: number;
  textures: number;
}

function PerfMeter({ onStats }: { onStats: (s: Stats) => void }) {
  const gl = useThree((s) => s.gl);
  const avgMs = useRef(16.7);
  const acc = useRef(0);

  useFrame((_state, delta) => {
    avgMs.current += (delta * 1000 - avgMs.current) * 0.1;
    acc.current += delta;
    if (acc.current < 0.25) return;
    acc.current = 0;
    onStats({
      calls: gl.info.render.calls,
      frameMs: avgMs.current,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    });
  });

  return null;
}

// Fix 1: MỘT InstancedMesh — một draw call, một material, màu riêng từng
// instance qua setColorAt (instanceColor) thay vì 800 material.clone().
function InstancedField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(((i % 40) - 20) * 0.4, Math.floor(i / 40) * 0.4 - 4, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.setHSL(i / COUNT, 0.6, 0.55));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[0.16, 0.16, 0.16]} />
      <meshStandardMaterial roughness={0.55} vertexColors />
    </instancedMesh>
  );
}

// Fix 2: geometry tạo ĐÚNG MỘT LẦN (useMemo); mỗi frame chỉ MUTATE attribute
// position tại chỗ từ toạ độ gốc đã lưu — không new, không dispose, không GC.
function ThrobbingBlob() {
  const geometry = useMemo(() => new THREE.SphereGeometry(1.1, 32, 32), []);
  const basePositions = useMemo(
    () => Float32Array.from(geometry.attributes.position.array),
    [geometry],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const wobble = 1 + Math.sin(t * 2 + i * 0.08) * 0.06;
      pos.setXYZ(
        i,
        basePositions[i * 3]! * wobble,
        basePositions[i * 3 + 1]! * wobble,
        basePositions[i * 3 + 2]! * wobble,
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh geometry={geometry} position={[0, 3.2, 0]}>
      <meshStandardMaterial color="#f97316" />
    </mesh>
  );
}

// Fix 3: fill light KHÔNG cast shadow nữa — nó chỉ tồn tại để soften bóng
// của key light, không cần tự đổ bóng riêng; key light giữ 1024 (đủ dùng).
function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -3]} intensity={0.25} />
    </>
  );
}

export function FixedScene({ onStats }: { onStats: (s: Stats) => void }) {
  return (
    <>
      <Lights />
      <InstancedField />
      <ThrobbingBlob />
      <PerfMeter onStats={onStats} />
    </>
  );
}

// Before/After (đo trên máy dev — GPU laptop tầm trung, trung bình trong 4s ổn định):
// | Chỉ số                          | Trước                              | Sau  |
// |----------------------------------|-------------------------------------|------|
// | renderer.info.render.calls       | ~803                                | ~4   |
// | Frame time (ms, EMA)             | ~34.6                               | ~7.9 |
// | FPS tương ứng (ước lượng)        | ~29                                 | ~126 |
// | renderer.info.memory.geometries  | 2 (ổn định — churn, không leak)     | 2    |
// | Shadow map ánh sáng phụ          | 4096×4096                          | tắt (castShadow=false) |
// Hình ảnh: 800 khối cùng vị trí/màu dải HSL, quả cầu phập phồng cùng biên độ,
// bóng đổ từ key light không đổi — chỉ chi phí render thay đổi, không phải kết quả.`,
    hints: [
      {
        vi: "Đọc `renderer.info.render.calls` TRƯỚC KHI đổi bất cứ dòng code nào — con số đó cho biết chính xác bottleneck nào đang chiếm phần lớn draw call, không cần đoán.",
        en: "Read `renderer.info.render.calls` BEFORE changing any code — that number tells you exactly which bottleneck dominates draw calls, no guessing needed.",
      },
      {
        vi: "Tìm mọi `new`/`dispose` xảy ra BÊN TRONG `useFrame` — bất kỳ phép cấp phát nào lặp lại 60 lần/giây là nghi phạm số một cho allocation churn, kể cả khi `renderer.info.memory` không tăng (vì bị dispose ngay sau khi tạo).",
        en: "Find every `new`/`dispose` happening INSIDE `useFrame` — any allocation repeating 60 times a second is prime suspect for allocation churn, even when `renderer.info.memory` doesn't grow (because it's disposed right after being created).",
      },
      {
        vi: "`renderer.info.memory` cho biết số geometry/texture ĐANG SỐNG trên GPU — dùng nó để phân biệt allocation churn (số ổn định, chỉ tốn CPU/GC) với leak thật (số tăng dần không giảm, đúng chủ đề bài `dispose-and-leak-hunting` sau này).",
        en: "`renderer.info.memory` reports how many geometries/textures are CURRENTLY LIVE on the GPU — use it to tell allocation churn (steady count, only costs CPU/GC) apart from a real leak (count keeps climbing, exactly the topic of the later `dispose-and-leak-hunting` lesson).",
      },
    ],
    checklist: [
      {
        vi: "Tìm đúng cả 3 bottleneck bằng số đo (renderer.info + frame-time), không đoán từ việc đọc code",
        en: "Found all 3 bottlenecks via measurement (renderer.info + frame time), not by reading the code and guessing",
      },
      {
        vi: "Draw call giảm từ khoảng 800 xuống còn khoảng 5",
        en: "Draw calls drop from around 800 to around 5",
      },
      {
        vi: "Không còn phép cấp phát geometry nào lặp lại bên trong useFrame — attribute được mutate tại chỗ",
        en: "No repeated geometry allocation inside useFrame anymore — the attribute is mutated in place",
      },
      {
        vi: "Ngân sách shadow map của ánh sáng phụ được giải thích rõ lý do (tắt hoặc giảm kích thước)",
        en: "The secondary light's shadow map budget is justified with a stated reason (disabled or shrunk)",
      },
      {
        vi: "Có bảng đo before/after đầy đủ (draw calls, frame time, geometries, shadow map) trong comment",
        en: "A complete before/after table (draw calls, frame time, geometries, shadow map) exists in a comment",
      },
      {
        vi: "Hình ảnh sau khi sửa giống hệt trước — vị trí, màu sắc, hiệu ứng phập phồng, bóng đổ không đổi",
        en: "Visuals after the fix are unchanged — positions, colors, throb effect, and shadows stay the same",
      },
    ],
  },
];
