import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-shadermaterial",
    type: "article",
    title: "Three.js Docs — ShaderMaterial",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/ShaderMaterial",
    note: {
      vi: "Tài liệu chính thức cho `vertexShader`/`fragmentShader`/`uniforms`/`glslVersion` — nguồn tham chiếu API cho mọi ví dụ trong bài.",
      en: "The official reference for `vertexShader`/`fragmentShader`/`uniforms`/`glslVersion` — the API source every example in this lesson is checked against.",
    },
  },
  {
    id: "threejs-docs-rawshadermaterial",
    type: "article",
    title: "Three.js Docs — RawShaderMaterial",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/RawShaderMaterial",
    note: {
      vi: "Xác nhận trực tiếp câu 'built-in uniforms and attributes are not automatically prepended' được trích dẫn trong bài.",
      en: "The direct source of the 'built-in uniforms and attributes are not automatically prepended' line quoted in this lesson.",
    },
  },
  {
    id: "threejs-source-webglprogram",
    type: "repo",
    title: "three.js source — src/renderers/webgl/WebGLProgram.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/webgl/WebGLProgram.js",
    note: {
      vi: "Nguồn thật lắp ráp prelude — nơi danh sách sáu uniform/ba attribute và nhánh RawShaderMaterial rỗng trong bài được đối chiếu trực tiếp (tag r185 khớp three@0.185.1 cài trong repo).",
      en: "The actual code that assembles the prelude — where this lesson's six-uniform/three-attribute list and the empty RawShaderMaterial branch were cross-checked directly (tag r185 matches the three@0.185.1 installed in this repo).",
    },
  },
  {
    id: "khronos-glsl-es-300-spec",
    type: "spec",
    title: "GLSL ES 3.00 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Đặc tả gốc cho `#version`, `in`/`out` và precision qualifier — nguồn chuẩn cho phần glslVersion/GLSL3 của bài, không phải suy đoán từ hành vi quan sát được.",
      en: "The authoritative spec for `#version`, `in`/`out` and precision qualifiers — the ground truth behind this lesson's glslVersion/GLSL3 section, not inferred from observed behavior.",
    },
  },
];
