import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "r3f-docs-introduction",
    type: "article",
    title: "React Three Fiber — Introduction",
    authors: ["pmndrs"],
    url: "https://r3f.docs.pmnd.rs/getting-started/introduction",
    note: {
      vi: "Nguồn gốc câu \"a React renderer for three.js\" và ví dụ <mesh /> → new THREE.Mesh() trích trong bài — đọc để thấy R3F tự mô tả mình là gì, không phải suy diễn.",
      en: "The source of \"a React renderer for three.js\" and the <mesh /> → new THREE.Mesh() example quoted in this lesson — read it to see how R3F describes itself, not a paraphrase.",
    },
  },
  {
    id: "r3f-docs-hooks",
    type: "article",
    title: "React Three Fiber — Hooks (useThree, useFrame)",
    authors: ["pmndrs"],
    url: "https://r3f.docs.pmnd.rs/api/hooks",
    note: {
      vi: "Tài liệu chính thức cho useThree (truy cập gl/scene/camera thật) và useFrame — đúng hai escape hatch được nhắc trong phần 'Sự thật ở giữa' của bài.",
      en: "Official docs for useThree (access to the real gl/scene/camera) and useFrame — the exact two escape hatches referenced in this lesson's 'Blended Reality' section.",
    },
  },
  {
    id: "r3f-bundle-size-discussion",
    type: "article",
    title: "pmndrs/react-three-fiber Discussion #812 — Reducing Bundle Size for Three.js",
    authors: ["pmndrs maintainers"],
    url: "https://github.com/pmndrs/react-three-fiber/discussions/812",
    note: {
      vi: "Số liệu thực đo (three.js ~155KB gzip trên một build cụ thể) và lời thừa nhận của maintainer rằng three.js tree-shake không triệt để — nguồn cho con số 'ước lượng' bundle trong bài.",
      en: "Real measured numbers (three.js ~155KB gzip on one specific build) plus a maintainer's admission that three.js doesn't tree-shake cleanly — the source behind this lesson's 'estimated' bundle figures.",
    },
  },
  {
    id: "threejs-manual-fundamentals",
    type: "article",
    title: "Three.js Fundamentals",
    authors: ["Gregg Tavares"],
    url: "https://threejs.org/manual/#en/fundamentals",
    note: {
      vi: "Manual chính thức của Three.js viết cho API thuần — chỉ ra chính xác những gì một dự án vanilla phải tự dựng (scene, camera, renderer, render loop) mà R3F thường lo hộ.",
      en: "Three.js's own manual, written for the raw API — spells out exactly what a vanilla project must build by hand (scene, camera, renderer, render loop) that R3F usually handles for you.",
    },
  },
];
