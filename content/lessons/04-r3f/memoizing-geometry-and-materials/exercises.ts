import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "args-diff-precision",
    kind: "concept",
    prompt: {
      vi: `Hai component sau đều re-render mỗi khi prop \`tick\` đổi (một giá trị không liên quan gì tới hình dạng):

\`\`\`tsx
function BoxA({ tick }: { tick: number }) {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}

function ShapeB({ tick, cx, cy }: { tick: number; cx: number; cy: number }) {
  return (
    <mesh>
      <circleGeometry args={[1, 32, 0, Math.PI * 2]} />
      <shapeGeometry args={[new THREE.Shape().absarc(cx, cy, 1, 0, Math.PI * 2, false)]} />
    </mesh>
  );
}
\`\`\`

Không chạy code — chỉ ra chính xác geometry nào trong \`ShapeB\` bị dựng lại ở MỌI lần re-render dù \`cx, cy\` không đổi, geometry nào KHÔNG bị dựng lại, và giải thích đúng cơ chế so sánh \`args\` khiến hai kết quả khác nhau (không phải "so sánh cả mảng bằng tham chiếu" — đó là giải thích sai phổ biến).`,
      en: `Both components below re-render whenever the \`tick\` prop changes (a value with nothing to do with shape):

\`\`\`tsx
function BoxA({ tick }: { tick: number }) {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}

function ShapeB({ tick, cx, cy }: { tick: number; cx: number; cy: number }) {
  return (
    <mesh>
      <circleGeometry args={[1, 32, 0, Math.PI * 2]} />
      <shapeGeometry args={[new THREE.Shape().absarc(cx, cy, 1, 0, Math.PI * 2, false)]} />
    </mesh>
  );
}
\`\`\`

Without running the code — identify exactly which geometry in \`ShapeB\` gets rebuilt on EVERY re-render even though \`cx, cy\` never change, which one does NOT, and explain the precise \`args\` comparison mechanism that causes the difference (not "the whole array is compared by reference" — that's the common wrong explanation).`,
    },
    hints: [
      {
        vi: "R3F so sánh args theo TỪNG PHẦN TỬ bằng `!==`, không so sánh cả mảng bằng tham chiếu. Với number, `!==` so theo giá trị.",
        en: "R3F compares `args` element-by-element with `!==`, never the whole array by reference. For numbers, `!==` compares by value.",
      },
      {
        vi: "`new THREE.Shape()` tạo một object mới mỗi lần gọi. Hai instance Shape khác nhau không bao giờ `===` nhau, dù `absarc` được gọi với cùng tham số.",
        en: "`new THREE.Shape()` creates a new object every call. Two different Shape instances are never `===` to each other, even when `absarc` is called with identical arguments.",
      },
    ],
    checklist: [
      {
        vi: "Xác định đúng: boxGeometry và circleGeometry KHÔNG bị dựng lại (args toàn number, so sánh theo giá trị luôn bằng)",
        en: "Correctly identifies boxGeometry and circleGeometry are NOT rebuilt (args are all numbers, value comparison always matches)",
      },
      {
        vi: "Xác định đúng: shapeGeometry BỊ dựng lại ở mọi render (args[0] là object Shape mới mỗi lần)",
        en: "Correctly identifies shapeGeometry IS rebuilt on every render (args[0] is a fresh Shape object each time)",
      },
      {
        vi: "Giải thích đúng cơ chế: so sánh phần tử bằng !==, không phải so sánh cả mảng args bằng tham chiếu",
        en: "Correctly explains the mechanism: per-element !== comparison, not whole-array reference comparison",
      },
    ],
    solutionCode: `// boxGeometry: args = [1, 1, 1] — ba number. Mỗi render, R3F so
// newArgs[i] !== oldArgs[i] theo GIÁ TRỊ: 1 !== 1 là false ở cả ba chỉ số
// -> không có chỉ số nào đổi -> geometry giữ nguyên, dù ShapeB re-render.
//
// circleGeometry: args = [1, 32, 0, Math.PI * 2] — cũng toàn number/hằng
// số, cùng lý do -> không bị dựng lại.
//
// shapeGeometry: args = [new THREE.Shape().absarc(cx, cy, 1, 0, PI*2, false)]
// -- MỖI lần ShapeB chạy lại, "new THREE.Shape()" tạo một object THAM CHIẾU
// MỚI, dù cx/cy không đổi và hình dạng logic giống hệt lần trước. So sánh
// newArgs[0] !== oldArgs[0] dùng !== trên OBJECT là so sánh THAM CHIẾU (JS
// semantics, không phải quyết định của R3F) -> hai Shape instance khác
// nhau luôn !== nhau -> geometry bị huỷ và dựng lại ở MỌI lần re-render,
// dù tick là prop duy nhất thực sự đổi.
//
// Kết luận: "so sánh args" luôn là so !== theo TỪNG PHẦN TỬ; kết quả của
// phép so sánh đó phụ thuộc KIỂU của phần tử — number/string/boolean so
// theo giá trị (ổn định), object so theo tham chiếu (chỉ ổn định nếu bạn
// tự giữ ổn định tham chiếu đó, ví dụ bằng useMemo).`,
  },
  {
    id: "dispose-on-color-change",
    kind: "code",
    prompt: {
      vi: `Viết hook \`useStableMaterial(color: string): THREE.MeshStandardMaterial\` dùng \`useMemo\` với dependency ĐÚNG, và tự dispose material CŨ ngay khi \`color\` đổi — vì material này được dựng thủ công (không phải JSX), R3F không tự dispose giúp bạn khi dependency của một \`useMemo\` thay đổi và một object mới xuất hiện.`,
      en: `Write a \`useStableMaterial(color: string): THREE.MeshStandardMaterial\` hook that uses \`useMemo\` with the CORRECT dependency, and disposes the OLD material the moment \`color\` changes — since this material is hand-built (not JSX), R3F won't auto-dispose it for you when a \`useMemo\`'s dependency changes and a new object appears.`,
    },
    starterCode: `import { useEffect, useMemo } from "react";
import * as THREE from "three";

function useStableMaterial(color: string): THREE.MeshStandardMaterial {
  // TODO 1: useMemo tạo material mới mỗi khi "color" đổi — dependency đúng,
  // không phải [] (đóng băng) và không phải thiếu color trong deps.
  const material = /* ... */;

  // TODO 2: useEffect cleanup — dispose material CŨ mỗi khi tham chiếu
  // "material" đổi (nghĩa là color vừa đổi), và dispose material cuối cùng
  // khi component unmount. Dependency của effect này quyết định điều đó.
  useEffect(() => {
    // ...
  }, []);

  return material;
}`,
    solutionCode: `import { useEffect, useMemo } from "react";
import * as THREE from "three";

function useStableMaterial(color: string): THREE.MeshStandardMaterial {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color }),
    [color],
  );

  useEffect(() => {
    // Cleanup chạy TRƯỚC lần effect kế tiếp (mỗi khi "material" đổi tham
    // chiếu, tức mỗi khi color đổi) VÀ khi component unmount — dispose
    // đúng material vừa bị thay thế, không đợi tới unmount mới dọn.
    return () => material.dispose();
  }, [material]);

  return material;
}`,
    hints: [
      {
        vi: "`useMemo` tạo lại material mỗi khi `color` đổi, nhưng KHÔNG dispose giá trị cũ — nó chỉ đơn thuần bỏ tham chiếu cũ đi.",
        en: "`useMemo` rebuilds the material whenever `color` changes, but it does NOT dispose the old value — it simply drops the old reference.",
      },
      {
        vi: "Dependency của `useEffect` cleanup phải là `[material]` (kết quả của useMemo), không phải `[color]` — cleanup chạy đúng lúc tham chiếu material đổi.",
        en: "The cleanup `useEffect`'s dependency must be `[material]` (the useMemo result), not `[color]` — cleanup fires exactly when the material reference changes.",
      },
    ],
    checklist: [
      {
        vi: "Material chỉ được tạo lại khi color thực sự đổi (dependency đúng, không tạo lại mỗi render của component cha)",
        en: "The material is only rebuilt when color genuinely changes (correct dependency, not rebuilt on every parent re-render)",
      },
      {
        vi: "Material CŨ được dispose ngay khi material MỚI xuất hiện, không đợi đến khi component unmount",
        en: "The OLD material is disposed the moment the NEW one appears, not deferred until component unmount",
      },
      {
        vi: "Material CUỐI CÙNG cũng được dispose khi component unmount — không có object nào bị bỏ sót",
        en: "The FINAL material is also disposed on component unmount — no object gets left behind",
      },
    ],
  },
];
