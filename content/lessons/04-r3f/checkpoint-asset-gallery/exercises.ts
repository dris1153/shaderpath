import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-asset-gallery",
    kind: "build",
    prompt: {
      vi: `Dựng một **gallery 3 khối trưng bày** bằng R3F — mỗi khối tự load "exhibit" riêng qua Suspense, bệ đỡ dùng chung.

Yêu cầu: 3 slot vị trí cố định (ví dụ \`x = -2, 0, 2\`); mỗi slot có Suspense boundary RIÊNG — không dùng chung một Suspense bọc cả 3, vì như vậy slot nhanh nhất cũng phải đợi slot chậm nhất mới hiện được gì; mỗi slot dùng một \`DelayedLoader\` riêng với độ trễ khác nhau (ví dụ 800ms / 1500ms / 2200ms, không asset thật); fallback của mỗi Suspense là một mesh, không phải DOM; bệ đỡ (pedestal) dùng MỘT geometry + MỘT material tạo Ở MODULE SCOPE cho cả 3 slot, gán qua prop \`geometry=\`/\`material=\` (không phải JSX con); có một prop/toggle \`active\` bật cả 3 exhibit cùng lúc.

Sau khi cả 3 tải xong, \`renderer.info.memory.geometries\` phải đúng bằng 4: 1 pedestal dùng chung + 3 exhibit riêng (exhibit không share vì mỗi slot có dữ liệu khác nhau).

Gợi ý cấu trúc: \`Slot({ index, active })\` chứa pedestal (gán qua prop) + \`<Suspense fallback={<PlaceholderMesh />}>{active && <Exhibit index={index} />}</Suspense>\`.`,
      en: `Build a **3-exhibit gallery** in R3F — each exhibit lazy-loads its own item through Suspense, pedestals are shared.

Requirements: 3 fixed-position slots (e.g. \`x = -2, 0, 2\`); each slot gets its OWN Suspense boundary — not one shared Suspense around all 3, since that would force the fastest slot to wait for the slowest before anything shows; each slot uses its own \`DelayedLoader\` with a different delay (e.g. 800ms / 1500ms / 2200ms, no real assets); every Suspense's fallback is a mesh, never DOM; the pedestal uses ONE geometry + ONE material created AT MODULE SCOPE shared by all 3 slots, assigned via the \`geometry=\`/\`material=\` prop (never a JSX child); include an \`active\` prop/toggle that activates all 3 exhibits at once.

Once all three finish loading, \`renderer.info.memory.geometries\` must equal exactly 4: 1 shared pedestal + 3 separate exhibits (exhibits aren't shared since each slot holds different data).

Structure hint: \`Slot({ index, active })\` containing a pedestal (prop-assigned) + \`<Suspense fallback={<PlaceholderMesh />}>{active && <Exhibit index={index} />}</Suspense>\`.`,
    },
    starterCode: `import { Suspense } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

// TODO 1: pedestal geometry + material AT MODULE SCOPE -- created exactly
// once, shared by all 3 slots (not created inside any component)

class DelayedLoader<T> extends THREE.Loader<T> {
  constructor(
    private readonly build: () => T,
    private readonly delayMs: number,
  ) {
    super();
  }

  load(
    url: string,
    onLoad: (data: T) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ) {
    // TODO 2: setTimeout(delayMs), try/catch quanh build(), onLoad/onError
  }
}

const EXHIBIT_DELAYS = [800, 1500, 2200];
const EXHIBIT_BUILDERS: (() => THREE.BufferGeometry)[] = [
  () => new THREE.BoxGeometry(0.7, 0.7, 0.7),
  () => new THREE.SphereGeometry(0.5, 32, 16),
  () => new THREE.TorusKnotGeometry(0.35, 0.14, 96, 12),
];
// TODO 3: create 3 loader instances AT MODULE SCOPE, one per slot (each
// DelayedLoader needs its own build+delayMs, so they CANNOT share 1 instance)

function Exhibit({ index }: { index: number }) {
  // TODO 4: useLoader(the loader for slot "index", \`exhibit://slot-\${index}\`)
  // then render <mesh geometry={...}><meshStandardMaterial .../></mesh>
  return null;
}

function PlaceholderMesh() {
  // TODO 5: a simple wireframe mesh as the fallback (no need to animate it)
  return null;
}

function Slot({ index, active }: { index: number; active: boolean }) {
  return (
    <group position={[(index - 1) * 2, 0, 0]}>
      {/* TODO 6: pedestal -- assign the module-scope geometry/material via
          PROP, not as JSX children */}
      <Suspense fallback={<PlaceholderMesh />}>
        {active && <Exhibit index={index} />}
      </Suspense>
    </group>
  );
}

export function AssetGallery({ active }: { active: boolean }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Slot key={i} index={i} active={active} />
      ))}
    </>
  );
}`,
    solutionCode: `import { Suspense } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

const PEDESTAL_GEOMETRY = new THREE.CylinderGeometry(0.5, 0.6, 0.25, 24);
const PEDESTAL_MATERIAL = new THREE.MeshStandardMaterial({ color: "#3f3f46" });

class DelayedLoader<T> extends THREE.Loader<T> {
  constructor(
    private readonly build: () => T,
    private readonly delayMs: number,
  ) {
    super();
  }

  load(
    url: string,
    onLoad: (data: T) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ) {
    setTimeout(() => {
      try {
        onLoad(this.build());
      } catch (err) {
        onError?.(err);
      }
    }, this.delayMs);
  }
}

const EXHIBIT_DELAYS = [800, 1500, 2200];
const EXHIBIT_BUILDERS: (() => THREE.BufferGeometry)[] = [
  () => new THREE.BoxGeometry(0.7, 0.7, 0.7),
  () => new THREE.SphereGeometry(0.5, 32, 16),
  () => new THREE.TorusKnotGeometry(0.35, 0.14, 96, 12),
];
// One loader instance PER slot — each needs its own build+delayMs, so unlike
// the pedestal, they can't share a single module-scope instance.
const EXHIBIT_LOADERS = EXHIBIT_DELAYS.map(
  (delay, i) => new DelayedLoader(EXHIBIT_BUILDERS[i], delay),
);

function Exhibit({ index }: { index: number }) {
  const geometry = useLoader(EXHIBIT_LOADERS[index], \`exhibit://slot-\${index}\`);
  return (
    <mesh geometry={geometry} position={[0, 0.55, 0]}>
      <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.15} />
    </mesh>
  );
}

function PlaceholderMesh() {
  return (
    <mesh position={[0, 0.55, 0]}>
      <icosahedronGeometry args={[0.4, 0]} />
      <meshBasicMaterial color="#52525b" wireframe />
    </mesh>
  );
}

function Slot({ index, active }: { index: number; active: boolean }) {
  return (
    <group position={[(index - 1) * 2, 0, 0]}>
      {/* Existing module-scope objects assigned via prop — R3F never owns
          or auto-disposes them, so all 3 slots can safely share them. */}
      <mesh geometry={PEDESTAL_GEOMETRY} material={PEDESTAL_MATERIAL} />
      <Suspense fallback={<PlaceholderMesh />}>
        {active && <Exhibit index={index} />}
      </Suspense>
    </group>
  );
}

export function AssetGallery({ active }: { active: boolean }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Slot key={i} index={i} active={active} />
      ))}
    </>
  );
}`,
    hints: [
      {
        vi: "Mỗi slot cần Suspense RIÊNG — bọc chung 1 Suspense quanh cả 3 `<Exhibit>` khiến CẢ BA đợi slot chậm nhất (2200ms) mới hiện được bất kỳ cái nào, mất hết lợi ích tải riêng lẻ.",
        en: "Each slot needs its OWN Suspense — wrapping a single Suspense around all 3 `<Exhibit>`s forces ALL of them to wait for the slowest slot (2200ms) before any can show, losing the whole benefit of loading independently.",
      },
      {
        vi: "Pedestal geometry/material tạo Ở MODULE SCOPE, gán vào `<mesh>` qua prop `geometry=`/`material=` — không viết `<boxGeometry />`/`<meshStandardMaterial />` như JSX con, nếu không R3F sẽ coi đó là instance riêng của từng slot và tự dispose khi 1 slot unmount, ảnh hưởng các slot khác.",
        en: "Build pedestal geometry/material AT MODULE SCOPE, assign to `<mesh>` via the `geometry=`/`material=` prop — don't write `<boxGeometry />`/`<meshStandardMaterial />` as JSX children, or R3F will treat them as each slot's own instance and auto-dispose them when one slot unmounts, breaking the others.",
      },
      {
        vi: "`DelayedLoader` nhận tham số constructor (`build`, `delayMs`) nên không thể truyền dạng class trực tiếp cho `useLoader` như với `GLTFLoader` — phải tự tạo instance trước rồi truyền instance đó vào `useLoader`, đúng pattern ở bài `suspense-and-asset-loading`.",
        en: "`DelayedLoader` takes constructor parameters (`build`, `delayMs`), so it can't be passed as a bare class to `useLoader` the way `GLTFLoader` can — construct the instance yourself first, then pass that instance to `useLoader`, exactly the pattern from the `suspense-and-asset-loading` lesson.",
      },
    ],
    checklist: [
      {
        vi: "3 slot hiện fallback ĐỘC LẬP — slot delay 800ms hiện exhibit trước, slot 2200ms vẫn đang xoay placeholder, không đợi nhau",
        en: "The 3 slots show fallbacks INDEPENDENTLY — the 800ms slot's exhibit appears first while the 2200ms slot is still spinning its placeholder, neither waits on the other",
      },
      {
        vi: "Sau khi cả 3 tải xong, renderer.info.memory.geometries đúng bằng 4 (1 pedestal dùng chung + 3 exhibit riêng) — kiểm tra qua devtools hoặc console.log",
        en: "After all 3 finish loading, renderer.info.memory.geometries equals exactly 4 (1 shared pedestal + 3 separate exhibits) — verified via devtools or console.log",
      },
      {
        vi: "Tắt rồi bật lại \"tải tất cả\" nhiều lần không làm leak — pedestal KHÔNG bị dispose (vì gán qua prop, không phải JSX con)",
        en: "Toggling \"load all\" off and on repeatedly doesn't leak — the pedestal is NEVER disposed (since it's prop-assigned, not a JSX child)",
      },
      {
        vi: "Không có `<div>` DOM trần nào lọt vào bên trong Canvas làm fallback — fallback luôn là mesh hợp lệ",
        en: "No bare DOM `<div>` ever ends up inside Canvas as a fallback — every fallback is a valid mesh",
      },
      {
        vi: "Component `AssetGallery` chỉ nhận đúng 1 prop `active: boolean` điều khiển cả 3 slot cùng lúc, không tự viết thêm state loading thủ công",
        en: "The `AssetGallery` component takes exactly 1 prop, `active: boolean`, controlling all 3 slots at once, with no hand-rolled loading state on top",
      },
    ],
  },
];
