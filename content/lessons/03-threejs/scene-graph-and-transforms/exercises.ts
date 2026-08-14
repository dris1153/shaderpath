import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "predict-world-position-after-rotation",
    kind: "concept",
    prompt: {
      vi: `Một \`Group\` gọi là \`orbitGroup\` nằm ở gốc world $(0,0,0)$ và chứa một \`Mesh\` \`planet\` ở local position $(4, 0, 0)$. Bạn đặt \`orbitGroup.rotation.y = Math.PI / 2\`.

Không chạy code: dùng ma trận xoay quanh trục Y của Three.js, $x' = x\\cos\\theta + z\\sin\\theta$ và $z' = -x\\sin\\theta + z\\cos\\theta$ ($y$ không đổi), tính world position $(x, y, z)$ của \`planet\` sau khi rotation áp dụng.`,
      en: `A \`Group\` named \`orbitGroup\` sits at world origin $(0,0,0)$ and contains a \`Mesh\` \`planet\` at local position $(4, 0, 0)$. You set \`orbitGroup.rotation.y = Math.PI / 2\`.

Without running code: using Three.js's Y-axis rotation matrix, $x' = x\\cos\\theta + z\\sin\\theta$ and $z' = -x\\sin\\theta + z\\cos\\theta$ ($y$ unchanged), compute \`planet\`'s world position $(x, y, z)$ after the rotation applies.`,
    },
    hints: [
      {
        vi: "$\\theta = \\pi/2$ nên $\\cos\\theta = 0$, $\\sin\\theta = 1$ — thay trực tiếp không cần tính gần đúng.",
        en: "$\\theta = \\pi/2$ so $\\cos\\theta = 0$, $\\sin\\theta = 1$ — substitute directly, no approximation needed.",
      },
      {
        vi: "planet.position local $(4,0,0)$ không hề đổi trong bộ nhớ — chỉ world position (đọc qua matrixWorld của orbitGroup) mới đổi.",
        en: "planet.position stays $(4,0,0)$ in memory the whole time — only the world position (read through orbitGroup's matrixWorld) changes.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng world position (0, 0, -4)",
        en: "Correctly computed world position (0, 0, -4)",
      },
      {
        vi: "Giải thích được vì sao world position của planet đổi dù .position local (4,0,0) của nó không đổi",
        en: "Explained why planet's world position changes even though its local .position (4,0,0) never changes",
      },
      {
        vi: "Nhận ra đây chính là cơ chế moving-parent-moves-children-for-free, không phải trường hợp đặc biệt",
        en: "Recognized this as the general moving-parent-moves-children-for-free mechanism, not a special case",
      },
    ],
    solutionNote: {
      vi: `θ = π/2 → cos θ = 0, sin θ = 1. x' = x·cosθ + z·sinθ = 4·0 + 0·1 = 0. z' = −x·sinθ + z·cosθ = −4·1 + 0·0 = −4. y' = y = 0.

World position: (0, 0, −4).

\`planet.position\` vẫn là (4, 0, 0) trong bộ nhớ — chỉ \`matrixWorld\` của nó (= \`orbitGroup.matrixWorld\` × \`planet.matrix\`) đổi vì \`orbitGroup.matrixWorld\` vừa đổi. Đây chính là "cha di chuyển, con được theo miễn phí": không có dòng code nào đụng vào \`planet.position\` cả.`,
      en: `θ = π/2 → cos θ = 0, sin θ = 1. x' = x·cosθ + z·sinθ = 4·0 + 0·1 = 0. z' = −x·sinθ + z·cosθ = −4·1 + 0·0 = −4. y' = y = 0.

World position: (0, 0, −4).

\`planet.position\` stays (4, 0, 0) in memory — only its \`matrixWorld\` (= \`orbitGroup.matrixWorld\` × \`planet.matrix\`) changes, because \`orbitGroup.matrixWorld\` just changed. This is exactly "parent moves, child follows for free": no line of code ever touches \`planet.position\` itself.`,
    },
  },
  {
    id: "round-trip-local-world",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`roundTripThroughWorld(object, localPoint)\` chuyển \`localPoint\` sang world space rồi chuyển world point đó ngược lại về local space, trả về cả hai kết quả. \`backToLocal\` phải gần bằng \`localPoint\` ban đầu (sai số dấu phẩy động chấp nhận được). Chú ý: \`localToWorld\`/\`worldToLocal\` biến đổi TẠI CHỖ (mutate) vector truyền vào.`,
      en: `Write a \`roundTripThroughWorld(object, localPoint)\` function that converts \`localPoint\` to world space, then converts that same world point back to local space, returning both results. \`backToLocal\` must land close to the original \`localPoint\` (floating-point error is fine). Note: \`localToWorld\`/\`worldToLocal\` mutate the vector passed in.`,
    },
    starterCode: `import * as THREE from "three";

interface RoundTrip {
  world: [number, number, number];
  backToLocal: [number, number, number];
}

function roundTripThroughWorld(
  object: THREE.Object3D,
  localPoint: THREE.Vector3,
): RoundTrip {
  // TODO: convert a CLONE of localPoint to world space with object.localToWorld
  // TODO: convert a CLONE of that world point back to local space with object.worldToLocal
  // TODO: return both as plain [x, y, z] tuples — localPoint itself must stay untouched
  return { world: [0, 0, 0], backToLocal: [0, 0, 0] };
}`,
    solutionCode: `import * as THREE from "three";

interface RoundTrip {
  world: [number, number, number];
  backToLocal: [number, number, number];
}

function roundTripThroughWorld(
  object: THREE.Object3D,
  localPoint: THREE.Vector3,
): RoundTrip {
  // .clone() first: localToWorld/worldToLocal mutate the vector they're given.
  const worldPoint = object.localToWorld(localPoint.clone());
  const backToLocal = object.worldToLocal(worldPoint.clone());
  return {
    world: [worldPoint.x, worldPoint.y, worldPoint.z],
    backToLocal: [backToLocal.x, backToLocal.y, backToLocal.z],
  };
}`,
    hints: [
      {
        vi: "localToWorld/worldToLocal trả về CHÍNH vector truyền vào, đã bị mutate — luôn .clone() trước khi gọi nếu còn cần giá trị gốc.",
        en: "localToWorld/worldToLocal return the SAME vector you passed in, mutated in place — always .clone() before calling if you still need the original value.",
      },
      {
        vi: "Vòng world→local phải cho lại đúng localPoint ban đầu, vì hai phép biến đổi này là nghịch đảo của nhau.",
        en: "The world→local round trip must land back at the original localPoint, since the two conversions are inverses of each other.",
      },
    ],
    checklist: [
      {
        vi: "worldPoint tính bằng object.localToWorld trên một bản CLONE của localPoint",
        en: "worldPoint is computed via object.localToWorld on a CLONE of localPoint",
      },
      {
        vi: "backToLocal tính bằng object.worldToLocal trên một bản clone của worldPoint, gần bằng localPoint gốc",
        en: "backToLocal is computed via object.worldToLocal on a clone of worldPoint, landing close to the original localPoint",
      },
      {
        vi: "localPoint truyền vào không bị mutate ngoài ý muốn nhờ dùng .clone() ở cả hai lần gọi",
        en: "The input localPoint is never accidentally mutated, thanks to .clone() at both call sites",
      },
    ],
  },
];
