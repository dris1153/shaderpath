import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-shadermaterial-uniforms",
    type: "article",
    title: "Three.js Docs — ShaderMaterial",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/ShaderMaterial",
    note: {
      vi: "Tài liệu chính thức cho property `.uniforms` — cấu trúc `{ name: { value } }` mà mọi ví dụ trong bài dùng lại.",
      en: "The official reference for the `.uniforms` property — the `{ name: { value } }` shape every example in this lesson reuses.",
    },
  },
  {
    id: "threejs-source-webglrenderer-uniform-upload",
    type: "repo",
    title: "three.js source — src/renderers/WebGLRenderer.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/WebGLRenderer.js",
    note: {
      vi: "Nguồn thật của `renderObject()`/`setProgram()` — nơi bài này đối chiếu trực tiếp việc modelMatrix/modelViewMatrix/normalMatrix ghi mỗi object mỗi frame trong khi projectionMatrix/viewMatrix/cameraPosition chỉ ghi khi camera hoặc program đổi (tag r185 khớp three@0.185.1 cài trong repo).",
      en: "The actual source of `renderObject()`/`setProgram()` — where this lesson cross-checked that modelMatrix/modelViewMatrix/normalMatrix are written every object every frame while projectionMatrix/viewMatrix/cameraPosition are only written when the camera or program changes (tag r185 matches the three@0.185.1 installed in this repo).",
    },
  },
  {
    id: "threejs-docs-datatexture",
    type: "article",
    title: "Three.js Docs — DataTexture",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/textures/DataTexture",
    note: {
      vi: "Tham chiếu API cho constructor và `needsUpdate` — dùng đúng cách này để tạo texture thủ tục làm uniform trong demo, không load ảnh nhị phân nào.",
      en: "The API reference for the constructor and `needsUpdate` — used exactly this way to build the demo's procedural texture uniform, with no binary image loaded.",
    },
  },
  {
    id: "akenine-moller-real-time-rendering",
    type: "book",
    title: "Real-Time Rendering, 4th Edition",
    authors: [
      "Tomas Akenine-Möller",
      "Eric Haines",
      "Naty Hoffman",
      "Angelo Pesce",
      "Michał Iwanicki",
      "Sébastien Hillaire",
    ],
    year: 2018,
    note: {
      vi: "Chương biến đổi hình học trình bày đầy đủ phép chứng minh inverse-transpose cho normal — sách giáo khoa chuẩn cho phần đạo hàm normalMatrix trong bài, không có bản online chính thức miễn phí nên không kèm URL.",
      en: "The transforms chapter carries the full inverse-transpose proof for normals — the standard textbook backing this lesson's normalMatrix derivation; no official free online edition exists, so no URL is included.",
    },
  },
];
