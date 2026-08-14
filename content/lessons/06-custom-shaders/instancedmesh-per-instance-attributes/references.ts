import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-source-instancedmesh",
    type: "repo",
    title: "three.js — src/objects/InstancedMesh.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/objects/InstancedMesh.js",
    note: {
      vi: "setMatrixAt, setColorAt, computeBoundingSphere thật — nguồn cho mọi khẳng định cơ chế trong bài, bao gồm cách bounding sphere được hợp từ từng ma trận instance.",
      en: "The real setMatrixAt, setColorAt, computeBoundingSphere — the source for every mechanism claim in this lesson, including how the bounding sphere is unioned from each instance matrix.",
    },
  },
  {
    id: "threejs-docs-instancedmesh",
    type: "article",
    title: "Three.js Docs — InstancedMesh",
    url: "https://threejs.org/docs/#api/en/objects/InstancedMesh",
    note: {
      vi: "Tài liệu chính thức tóm tắt API bề mặt của InstancedMesh — đối chiếu với source để phân biệt Ý ĐỊNH (docs) và CƠ CHẾ (source).",
      en: "The official docs summarizing InstancedMesh's surface API — compare against the source to separate INTENT (docs) from MECHANISM (source).",
    },
  },
  {
    id: "threejs-docs-instancedbufferattribute",
    type: "article",
    title: "Three.js Docs — InstancedBufferAttribute",
    url: "https://threejs.org/docs/#api/en/core/InstancedBufferAttribute",
    note: {
      vi: "Định nghĩa chính thức của attribute per-instance tổng quát mà instanceMatrix/instanceColor chỉ là hai trường hợp cụ thể — cơ sở cho phần aPhase của bài.",
      en: "The official definition of the general per-instance attribute that instanceMatrix/instanceColor are just two specific cases of — the basis for this lesson's aPhase section.",
    },
  },
  {
    id: "mdn-drawarraysinstanced",
    type: "article",
    title: "MDN — WebGL2RenderingContext.drawArraysInstanced()",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/drawArraysInstanced",
    note: {
      vi: "Lệnh WebGL2 gốc mà InstancedMesh của Three cuối cùng gọi xuống — xác nhận instancing là tính năng native của driver, không phải mẹo dựng riêng của Three.",
      en: "The raw WebGL2 call Three's InstancedMesh ultimately issues — confirms instancing is a native driver feature, not a trick Three invented on its own.",
    },
  },
];
