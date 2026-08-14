import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-onbeforecompile",
    type: "article",
    title: "Three.js Docs — Material.onBeforeCompile",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/Material.onBeforeCompile",
    note: {
      vi: "Trang tài liệu chính thức của callback này — mô tả chữ ký, thời điểm gọi và giới hạn (không hỗ trợ WebGPU) mà bài này dựa vào.",
      en: "The official docs page for this callback — describes its signature, when it fires and its limits (not supported under WebGPU), which this lesson builds on.",
    },
  },
  {
    id: "threejs-docs-customprogramcachekey",
    type: "article",
    title: "Three.js Docs — Material.customProgramCacheKey",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/Material.customProgramCacheKey",
    note: {
      vi: "Nguồn xác nhận default customProgramCacheKey() trả về gì — đúng cơ chế bài này giải thích khi bàn về vì sao hai material có thể vô tình dùng chung một chương trình đã compile.",
      en: "Confirms exactly what the default customProgramCacheKey() returns — the mechanism this lesson explains when two materials end up sharing one compiled program by accident.",
    },
  },
  {
    id: "threejs-source-webglprograms",
    type: "repo",
    title: "three.js source — WebGLPrograms.js (getProgramCacheKey)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLPrograms.js",
    note: {
      vi: "Mã nguồn thật lắp ráp cache key: theo dõi hàm getProgramCacheKey và getParameters để thấy customProgramCacheKey được nối vào cuối chuỗi key ra sao — chứng cứ, không phải suy đoán.",
      en: "The actual source assembling the cache key: trace getProgramCacheKey and getParameters to see exactly how customProgramCacheKey gets appended to the key string — evidence, not hand-waving.",
    },
  },
  {
    id: "threejs-example-materials-modified",
    type: "article",
    title: "Three.js Example — webgl_materials_modified",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/examples/?q=modified#webgl_materials_modified",
    note: {
      vi: "Ví dụ chính thức của Three.js dùng onBeforeCompile để chèn hiệu ứng dissolve/glow vào MeshStandardMaterial — đối chiếu cách replace chunk của họ với cách dùng trong bài này.",
      en: "Three.js's own example using onBeforeCompile to inject dissolve/glow effects into MeshStandardMaterial — compare their chunk-replacement style against this lesson's.",
    },
  },
];
