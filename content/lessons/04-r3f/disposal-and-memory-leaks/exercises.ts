import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "leak-growth-arithmetic",
    kind: "concept",
    prompt: {
      vi: `Component \`Particles\` mount 8 mesh mỗi lần — mỗi mesh dựng bằng \`new THREE.SphereGeometry(...)\` rồi gắn qua \`<primitive object={mesh} />\`, không có cleanup nào. Người dùng bấm nút mount/unmount component này đúng 6 chu kỳ trọn vẹn trong một phiên (giả sử trước đó \`renderer.info.memory.geometries\` bằng 0).

Không chạy code: tính \`renderer.info.memory.geometries\` sau 6 chu kỳ đó. Sau đó trả lời: nếu đổi \`<primitive object={mesh}>\` thành JSX thuần \`<mesh><sphereGeometry args={[...]} /></mesh>\` mà KHÔNG thêm cleanup nào khác, con số cuối cùng (sau chu kỳ thứ 6, ở trạng thái đã unmount) có đổi không — vì sao?`,
      en: `The \`Particles\` component mounts 8 meshes each time — each built with \`new THREE.SphereGeometry(...)\` and attached via \`<primitive object={mesh} />\`, with no cleanup at all. A user clicks its mount/unmount button through exactly 6 full cycles in one session (assume \`renderer.info.memory.geometries\` starts at 0).

Without running code: compute \`renderer.info.memory.geometries\` after those 6 cycles. Then answer: if \`<primitive object={mesh}>\` were replaced with plain JSX \`<mesh><sphereGeometry args={[...]} /></mesh>\` with no other cleanup added, would the final number (after cycle 6, in the unmounted state) change — and why?`,
    },
    hints: [
      {
        vi: "Công thức $G(n) = k \\cdot n$ chỉ áp dụng khi component không dispose gì cả giữa các lần mount — không có số hạng giảm nào để trừ đi.",
        en: "The formula $G(n) = k \\cdot n$ only holds when the component disposes nothing between mounts — there's no decreasing term to subtract.",
      },
      {
        vi: "Object được reconciler R3F tự khởi tạo từ JSX (không đi qua <primitive>) nằm trong sổ sách auto-dispose của nó — khác hẳn object bạn `new` tay rồi truyền vào.",
        en: "Objects the R3F reconciler itself instantiates from JSX (not routed through <primitive>) are on its auto-dispose books — unlike an object you `new`'d by hand and merely passed in.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng: sau 6 chu kỳ với bản primitive không cleanup, geometries = 48",
        en: "I correctly computed: after 6 cycles with the uncleaned primitive version, geometries = 48",
      },
      {
        vi: "Tôi giải thích được vì sao bản JSX thuần trả số geometries về 0 sau mỗi lần unmount",
        en: "I can explain why the plain-JSX version brings the geometries count back to 0 after every unmount",
      },
      {
        vi: "Tôi phân biệt được 'auto-dispose vì R3F tự tạo từ JSX' với 'phải tự dispose vì object được truyền vào qua primitive'",
        en: "I can distinguish 'auto-disposed because R3F itself created it from JSX' from 'needs manual disposal because the object was merely passed in via primitive'",
      },
    ],
    solutionNote: {
      vi: `Bản \`<primitive>\`, không cleanup: mỗi chu kỳ mount cộng thêm 8 geometry, unmount không trừ đi gì cả, nên $G(n) = 8n$. Vậy $G(6) = 8 \\times 6 = 48$.

Bản JSX thuần (\`<mesh><sphereGeometry/></mesh>\`): R3F tự tạo geometry từ tag \`<sphereGeometry>\`, nên nó nằm trong cây instance mà reconciler theo dõi — mỗi lần unmount tự gọi \`.dispose()\` cho đúng 8 geometry vừa mount. Sau chu kỳ thứ 6 (kết thúc ở trạng thái đã unmount), số geometries quay lại đúng 0 — không tích luỹ qua các chu kỳ, vì đây thuộc đúng trường hợp "R3F tự lo".`,
      en: `The \`<primitive>\` version, with no cleanup: each cycle's mount adds 8 geometries, and unmount subtracts nothing, so $G(n) = 8n$. That gives $G(6) = 8 \\times 6 = 48$.

The plain-JSX version (\`<mesh><sphereGeometry/></mesh>\`): R3F itself creates the geometry from the \`<sphereGeometry>\` tag, so it lives in the instance tree the reconciler tracks — every unmount automatically calls \`.dispose()\` on the exact 8 geometries that were just mounted. After cycle 6 (ending in the unmounted state), the geometries count returns to exactly 0 — it never accumulates across cycles, because this is precisely the "R3F handles it" case.`,
    },
  },
  {
    id: "fix-leaky-ring-with-use-disposable",
    kind: "code",
    prompt: {
      vi: `Component \`LeakyRing\` bên dưới dựng \`geometry\` và \`material\` bằng \`new THREE.X()\` rồi gắn vào scene qua \`<primitive object={mesh} />\` — đúng trường hợp R3F không tự dispose được. Sửa lại bằng \`useDisposable\` (hook nhà của nền tảng này, \`lib/hooks/use-disposable.ts\`) để \`geometry\` và \`material\` được dispose đúng lúc component unmount — không đổi hình dạng hay màu sắc hiển thị.`,
      en: `The \`LeakyRing\` component below builds \`geometry\` and \`material\` with \`new THREE.X()\` and attaches them to the scene via \`<primitive object={mesh} />\` — exactly the case R3F can't auto-dispose. Fix it with \`useDisposable\` (this platform's house hook, \`lib/hooks/use-disposable.ts\`) so \`geometry\` and \`material\` get disposed the moment the component unmounts — without changing the rendered shape or color.`,
    },
    starterCode: `import { useMemo } from "react";
import * as THREE from "three";
import { useDisposable } from "@/lib/hooks/use-disposable";

// BUG: geometry/material built with \`new\`, never disposed — every mount
// leaks one geometry + one material forever.
function LeakyRing() {
  const geometry = useMemo(() => new THREE.RingGeometry(0.5, 1, 32), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#f97316" }),
    [],
  );
  const mesh = useMemo(
    () => new THREE.Mesh(geometry, material),
    [geometry, material],
  );

  // TODO: use useDisposable() to register \`geometry\` and \`material\` so
  // they get disposed automatically when LeakyRing unmounts.

  return <primitive object={mesh} />;
}`,
    solutionCode: `import { useMemo } from "react";
import * as THREE from "three";
import { useDisposable } from "@/lib/hooks/use-disposable";

function CleanRing() {
  const disposables = useDisposable();

  const geometry = useMemo(
    () => disposables.register(new THREE.RingGeometry(0.5, 1, 32)),
    [disposables],
  );
  const material = useMemo(
    () =>
      disposables.register(new THREE.MeshBasicMaterial({ color: "#f97316" })),
    [disposables],
  );
  const mesh = useMemo(
    () => new THREE.Mesh(geometry, material),
    [geometry, material],
  );

  return <primitive object={mesh} />;
}`,
    hints: [
      {
        vi: "`useDisposable()` trả về một registry ổn định qua re-render — gọi `registry.register(obj)` ngay chỗ bạn `new` ra `obj`, nó trả lại chính `obj` đó nguyên vẹn.",
        en: "`useDisposable()` returns a registry that's stable across re-renders — call `registry.register(obj)` right where you `new` up `obj`; it hands `obj` straight back unchanged.",
      },
      {
        vi: "Thêm `disposables` vào dependency array của mỗi `useMemo` liên quan — registry ổn định nên không gây tạo lại geometry/material mỗi lần render.",
        en: "Add `disposables` to the dependency array of each relevant `useMemo` — the registry is stable, so this doesn't cause geometry/material to be recreated on every render.",
      },
    ],
    checklist: [
      {
        vi: "Cả `geometry` và `material` đều được bọc qua `disposables.register(...)`",
        en: "Both `geometry` and `material` are wrapped through `disposables.register(...)`",
      },
      {
        vi: "`disposables` nằm trong dependency array của cả hai `useMemo` liên quan",
        en: "`disposables` is included in the dependency array of both relevant `useMemo` calls",
      },
      {
        vi: "Component vẫn render đúng chiếc nhẫn màu cam như trước khi sửa, chỉ khác ở việc dispose khi unmount",
        en: "The component still renders the same orange ring as before the fix, differing only in disposing on unmount",
      },
    ],
  },
];
