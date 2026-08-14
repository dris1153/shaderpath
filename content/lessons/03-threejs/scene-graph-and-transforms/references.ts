import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-scenegraph",
    type: "article",
    title: "Three.js — Scene Graph",
    authors: ["three.js contributors"],
    url: "https://threejs.org/manual/en/scenegraph.html",
    note: {
      vi: "Bài viết chính thức dựng đúng idiom hệ mặt trời bằng Group làm pivot — nguồn gốc của demo trong bài này.",
      en: "The official article that builds the exact solar-system-with-a-Group-pivot idiom — the source behind this lesson's demo.",
    },
  },
  {
    id: "threejs-docs-object3d",
    type: "article",
    title: "Three.js Docs — Object3D",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/core/Object3D",
    note: {
      vi: "Tài liệu tham chiếu chính thức cho matrix, matrixWorld, matrixAutoUpdate, attach(), traverse() và getObjectByName().",
      en: "The official reference for matrix, matrixWorld, matrixAutoUpdate, attach(), traverse() and getObjectByName().",
    },
  },
  {
    id: "threejs-docs-group",
    type: "article",
    title: "Three.js Docs — Group",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/objects/Group",
    note: {
      vi: "Xác nhận Group chỉ là một Object3D không hình học/vật liệu, dùng để tổ chức và làm pivot cho các object con.",
      en: "Confirms Group is just an Object3D with no geometry/material, meant for organizing and pivoting child objects.",
    },
  },
  {
    id: "threejs-source-object3d",
    type: "repo",
    title: "three.js source — src/core/Object3D.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js",
    note: {
      vi: "Nguồn thật của attach(), localToWorld()/worldToLocal() và updateMatrixWorld() — nơi mọi khẳng định về hành vi API trong bài được đối chiếu.",
      en: "The actual source of attach(), localToWorld()/worldToLocal() and updateMatrixWorld() — where every API-behavior claim in this lesson was cross-checked.",
    },
  },
];
