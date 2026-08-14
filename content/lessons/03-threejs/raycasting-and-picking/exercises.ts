import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "y-flip-mirror-reasoning",
    kind: "concept",
    prompt: {
      vi: `Một canvas vuông $400 \\times 400$ hiển thị đúng bằng kích thước CSS của nó (không bị scale, không lệch góc viewport). Người dùng click tại pixel $(x, y) = (100, 100)$, gốc trên-trái, trục $y$ hướng xuống.

Tính NDC **đúng** (có lật trục $y$) tại điểm này. Sau đó tính NDC **sai** nếu quên lật trục $y$. Cuối cùng giải thích: điểm sai đó nằm ở vị trí nào so với điểm đúng trên màn hình — đối xứng qua đường nào?`,
      en: `A square $400 \\times 400$ canvas is displayed at exactly its CSS size (no scaling, not offset from the viewport corner). A user clicks at pixel $(x, y) = (100, 100)$, origin top-left, $y$ pointing down.

Compute the **correct** NDC (with the $y$ flip) for this point. Then compute the **wrong** NDC if the $y$ flip is skipped. Finally explain: where does the wrong point land relative to the correct one on screen — mirrored across which line?`,
    },
    hints: [
      {
        vi: "u = x/width, v = y/height trước. NDC đúng: (2u-1, 1-2v). NDC sai (quên lật): (2u-1, 2v-1) — chỉ khác dấu thành phần y.",
        en: "First compute u = x/width, v = y/height. Correct NDC: (2u-1, 1-2v). Wrong NDC (missing the flip): (2u-1, 2v-1) — only the y component's sign differs.",
      },
      {
        vi: "Hai điểm chỉ khác nhau ở dấu của thành phần y trong NDC — nghĩ về việc lật một điểm qua trục hoành (y=0) nghĩa là gì trên màn hình.",
        en: "The two points differ only in the sign of the NDC y component — think about what flipping a point across the horizontal axis (y=0) means on screen.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng NDC có lật trục: u = v = 0.25, NDC = (-0.5, 0.5)",
        en: "I correctly computed the flipped NDC: u = v = 0.25, NDC = (-0.5, 0.5)",
      },
      {
        vi: "Tôi tính đúng NDC sai (quên lật): (-0.5, -0.5)",
        en: "I correctly computed the wrong (un-flipped) NDC: (-0.5, -0.5)",
      },
      {
        vi: "Tôi giải thích đúng: điểm sai đối xứng với điểm đúng qua trục ngang giữa màn hình (đường y=0 trên NDC, tức hàng pixel giữa canvas)",
        en: "I correctly explain: the wrong point is mirrored from the correct one across the screen's horizontal center line (NDC's y=0, the canvas's middle pixel row)",
      },
    ],
    solutionCode: `// u = x / width = 100 / 400 = 0.25
// v = y / height = 100 / 400 = 0.25
//
// NDC đúng (lật trục y):   x = 2u - 1 = -0.5,  y = 1 - 2v =  0.5  ->  (-0.5,  0.5)
// NDC sai (quên lật trục): x = 2u - 1 = -0.5,  y = 2v - 1  = -0.5  ->  (-0.5, -0.5)
//
// Hai điểm cùng x, đối nhau dấu y => đối xứng qua trục hoành (NDC y=0),
// tức hàng pixel chính giữa canvas theo chiều dọc. Click ở phần TRÊN màn
// hình bị raycast nhầm sang vị trí ĐỐI XỨNG ở phần DƯỚI, và ngược lại.`,
  },
  {
    id: "update-hover-target",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`updateHover(raycaster, ndc, camera, pickables)\` dựng tia từ \`ndc\`/\`camera\`, raycast **chỉ** trên \`pickables\` (không phải scene đầy đủ, \`recursive = false\`), rồi trả về object gần nhất bị trúng — hoặc \`null\` nếu không trúng gì.`,
      en: `Write \`updateHover(raycaster, ndc, camera, pickables)\`, building a ray from \`ndc\`/\`camera\`, raycasting **only** against \`pickables\` (not the full scene, \`recursive = false\`), and returning the nearest hit object — or \`null\` if nothing was hit.`,
    },
    starterCode: `import * as THREE from "three";

function updateHover(
  raycaster: THREE.Raycaster,
  ndc: THREE.Vector2,
  camera: THREE.Camera,
  pickables: THREE.Object3D[],
): THREE.Object3D | null {
  // TODO 1: dựng tia bằng raycaster.setFromCamera(ndc, camera)
  // TODO 2: intersectObjects CHỈ trên pickables, recursive = false
  // TODO 3: trả về object của kết quả gần nhất (phần tử đầu), hoặc null nếu mảng rỗng
  return null;
}`,
    solutionCode: `import * as THREE from "three";

function updateHover(
  raycaster: THREE.Raycaster,
  ndc: THREE.Vector2,
  camera: THREE.Camera,
  pickables: THREE.Object3D[],
): THREE.Object3D | null {
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  // intersectObjects sắp sẵn theo distance tăng dần: hits[0] luôn gần nhất
  return hits.length > 0 ? hits[0].object : null;
}`,
    hints: [
      {
        vi: "intersectObjects trả về mảng đã sort theo distance tăng dần — phần tử đầu tiên luôn là object gần camera nhất mà tia chạm.",
        en: "intersectObjects returns an array already sorted by increasing distance — the first element is always the object closest to the camera that the ray hit.",
      },
      {
        vi: "Không cần recursive = true ở đây vì pickables là mảng mesh phẳng, không có children cần duyệt sâu.",
        en: "recursive = true isn't needed here since pickables is a flat array of meshes with no children to descend into.",
      },
    ],
    checklist: [
      {
        vi: "setFromCamera(ndc, camera) được gọi trước khi intersect",
        en: "setFromCamera(ndc, camera) is called before intersecting",
      },
      {
        vi: "intersectObjects chỉ nhận pickables, không phải scene.children hay scene",
        en: "intersectObjects is called with pickables only, not scene.children or the scene",
      },
      {
        vi: "Trả về đúng hits[0].object khi có kết quả, null khi mảng rỗng",
        en: "Returns hits[0].object when there are results, null when the array is empty",
      },
    ],
  },
];
