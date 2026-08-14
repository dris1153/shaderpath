import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-instancedmesh",
    type: "spec",
    title: "Three.js Docs — InstancedMesh",
    url: "https://threejs.org/docs/#api/en/objects/InstancedMesh",
    note: {
      vi: "API chuẩn cho `setMatrixAt`/`instanceMatrix.needsUpdate` mà bậc thang thứ 3 của bài này dùng — cùng tài liệu bài InstancedMesh ở Track 6/9 đã trích dẫn.",
      en: "The canonical API for `setMatrixAt`/`instanceMatrix.needsUpdate`, which this lesson's rung 3 relies on — the same doc the Track 6/9 InstancedMesh lessons cite.",
    },
  },
  {
    id: "threejs-batchedmesh",
    type: "spec",
    title: "Three.js Docs — BatchedMesh",
    url: "https://threejs.org/docs/#api/en/objects/BatchedMesh",
    note: {
      vi: "Tài liệu chính thức cho `addGeometry`/`addInstance`/`setVisibleAt` — nguồn xác nhận BatchedMesh là API ổn định, không phải tính năng thử nghiệm, ở bản three đang cài.",
      en: "The official docs for `addGeometry`/`addInstance`/`setVisibleAt` — the source confirming BatchedMesh is stable API, not experimental, in the installed three version.",
    },
  },
  {
    id: "threejs-buffergeometryutils",
    type: "spec",
    title: "Three.js Docs — BufferGeometryUtils",
    url: "https://threejs.org/docs/pages/module-BufferGeometryUtils.html",
    note: {
      vi: "Tài liệu cho `mergeGeometries` — bao gồm yêu cầu các geometry đầu vào phải cùng bộ attribute, đúng ràng buộc bài này nhấn mạnh ở bậc thang thứ 2.",
      en: "The docs for `mergeGeometries` — including the requirement that input geometries share the same attribute set, exactly the constraint this lesson's rung 2 emphasizes.",
    },
  },
  {
    id: "mdn-webgl-best-practices",
    type: "article",
    title: "MDN — WebGL Best Practices",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices",
    note: {
      vi: "Ghi nhận độc lập về phí driver cố định trên mỗi draw call và khuyến nghị gộp lệnh vẽ — nguồn ngoài Three.js cho thấy đây là vấn đề của chính WebGL API, không riêng gì thư viện nào.",
      en: "An independent account of the fixed per-draw-call driver cost and the recommendation to batch draw commands — a non-Three.js source showing this is a WebGL API concern, not a library quirk.",
    },
  },
];
