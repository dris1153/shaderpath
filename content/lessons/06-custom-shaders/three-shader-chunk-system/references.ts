import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-source-shaderchunk",
    type: "repo",
    title: "three.js — src/renderers/shaders/ShaderChunk.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/shaders/ShaderChunk.js",
    note: {
      vi: "Object map thật từ tên chunk sang GLSL — danh sách chunk chính xác của phiên bản three@0.185.1 cài trong repo này, nguồn cho mọi tên chunk trích trong bài.",
      en: "The real object map from chunk name to GLSL — the exact chunk list for the three@0.185.1 installed in this repo, the source for every chunk name cited in this lesson.",
    },
  },
  {
    id: "threejs-source-meshphysical",
    type: "repo",
    title: "three.js — src/renderers/shaders/ShaderLib/meshphysical.glsl.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/shaders/ShaderLib/meshphysical.glsl.js",
    note: {
      vi: "Thứ tự #include thật của MeshStandardMaterial — file bài này đọc từng dòng để dựng bản đồ vertex/fragment.",
      en: "MeshStandardMaterial's real #include order — the file this lesson reads line by line to build the vertex/fragment map.",
    },
  },
  {
    id: "threejs-source-webglprogram",
    type: "repo",
    title: "three.js — src/renderers/webgl/WebGLProgram.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/webgl/WebGLProgram.js",
    note: {
      vi: "resolveIncludes() và includeReplacer() thật — nguồn cho cơ chế #include đệ quy và cho cái bẫy thời điểm onBeforeCompile chạy trước resolveIncludes.",
      en: "The real resolveIncludes() and includeReplacer() — the source for the recursive #include mechanism and for the timing trap where onBeforeCompile runs before resolveIncludes.",
    },
  },
  {
    id: "threejs-docs-onbeforecompile",
    type: "article",
    title: "Three.js Docs — Material.onBeforeCompile",
    url: "https://threejs.org/docs/#api/en/materials/Material.onBeforeCompile",
    note: {
      vi: "Tài liệu chính thức mô tả chữ ký onBeforeCompile(shader, renderer) và customProgramCacheKey — đối chiếu với source để thấy docs mô tả Ý ĐỊNH còn source mô tả CƠ CHẾ.",
      en: "The official docs describing the onBeforeCompile(shader, renderer) signature and customProgramCacheKey — compare against the source to see docs describing INTENT versus source describing MECHANISM.",
    },
  },
];
