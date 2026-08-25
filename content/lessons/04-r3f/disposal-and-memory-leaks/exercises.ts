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
      vi: `Component \`LeakyRing\` bên dưới dựng \`geometry\` và \`material\` bằng \`new THREE.X()\` rồi gắn vào scene qua \`<primitive object={mesh} />\` — đúng trường hợp R3F không tự dispose được. Sửa lại bằng \`createDisposableRegistry\` (từ file hook nhà của nền tảng, \`lib/hooks/use-disposable.ts\`): tạo VÀ đăng ký object bên trong một \`useEffect\`, cleanup gọi \`registry.disposeAll()\` — như vậy \`geometry\` và \`material\` được dispose đúng lúc unmount, và chu kỳ unmount/remount giả lập của Strict Mode sẽ dựng bộ object mới thay vì dùng lại object đã bị dispose. Không đổi hình dạng hay màu sắc hiển thị.`,
      en: `The \`LeakyRing\` component below builds \`geometry\` and \`material\` with \`new THREE.X()\` and attaches them to the scene via \`<primitive object={mesh} />\` — exactly the case R3F can't auto-dispose. Fix it with \`createDisposableRegistry\` (from this platform's house hook file, \`lib/hooks/use-disposable.ts\`): create AND register the objects inside a \`useEffect\` whose cleanup calls \`registry.disposeAll()\` — that way \`geometry\` and \`material\` are disposed the moment the component unmounts, and Strict Mode's simulated unmount/remount cycle builds a fresh set of objects instead of reusing disposed ones. Don't change the rendered shape or color.`,
    },
    starterCode: `import { useMemo } from "react";
import * as THREE from "three";
import { createDisposableRegistry } from "@/lib/hooks/use-disposable";

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

  // TODO: move the \`new\` calls into a useEffect that owns its own
  // createDisposableRegistry() — register both objects there and dispose
  // them in the effect cleanup.

  return <primitive object={mesh} />;
}`,
    solutionCode: `import { useEffect, useState } from "react";
import * as THREE from "three";
import { createDisposableRegistry } from "@/lib/hooks/use-disposable";

function CleanRing() {
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);

  // Each effect run owns its registry: Strict Mode's simulated unmount
  // disposes one set, the re-run builds a fresh one — nothing dead survives.
  useEffect(() => {
    const registry = createDisposableRegistry();
    const geometry = registry.register(new THREE.RingGeometry(0.5, 1, 32));
    const material = registry.register(
      new THREE.MeshBasicMaterial({ color: "#f97316" }),
    );
    setMesh(new THREE.Mesh(geometry, material));
    return () => {
      registry.disposeAll();
      setMesh(null);
    };
  }, []);

  if (!mesh) return null;
  return <primitive object={mesh} />;
}`,
    hints: [
      {
        vi: "Chuyển các lệnh `new THREE.X()` vào trong một `useEffect([])`: mỗi lần effect chạy tự tạo `createDisposableRegistry()` riêng, `registry.register(obj)` trả lại chính `obj` nguyên vẹn, và cleanup gọi `registry.disposeAll()`.",
        en: "Move the `new THREE.X()` calls inside a `useEffect([])`: each effect run creates its own `createDisposableRegistry()`, `registry.register(obj)` hands `obj` straight back unchanged, and the cleanup calls `registry.disposeAll()`.",
      },
      {
        vi: "Mesh giờ sinh ra trong effect nên phải đi qua state (`useState<THREE.Mesh | null>`) để tới được JSX — render `null` cho tới khi mesh tồn tại.",
        en: "The mesh is now born inside the effect, so it must travel through state (`useState<THREE.Mesh | null>`) to reach JSX — render `null` until it exists.",
      },
    ],
    checklist: [
      {
        vi: "Cả `geometry` và `material` đều được tạo và `register(...)` bên trong effect, cleanup gọi `registry.disposeAll()`",
        en: "Both `geometry` and `material` are created and `register(...)`-ed inside the effect, with the cleanup calling `registry.disposeAll()`",
      },
      {
        vi: "Không còn `useMemo` nào giữ object disposable — dưới Strict Mode object memo hoá sẽ quay lại ở trạng thái đã bị dispose",
        en: "No `useMemo` holds a disposable object anymore — under Strict Mode a memoized object would come back already disposed",
      },
      {
        vi: "Component vẫn render đúng chiếc nhẫn màu cam như trước khi sửa, chỉ khác ở việc dispose khi unmount",
        en: "The component still renders the same orange ring as before the fix, differing only in disposing on unmount",
      },
    ],
  },
];
