import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-instancedmesh",
    type: "article",
    title: "Three.js Docs — InstancedMesh",
    url: "https://threejs.org/docs/#api/en/objects/InstancedMesh",
    note: {
      vi: "Tài liệu chính thức về constructor, instanceMatrix, instanceColor — nền tảng API mà bài này đọc trực tiếp từ GPGPU thay vì set bằng CPU.",
      en: "The official reference for the constructor, instanceMatrix, instanceColor — the base API this lesson drives from GPGPU instead of setting from the CPU.",
    },
  },
  {
    id: "threejs-docs-onbeforecompile",
    type: "article",
    title: "Three.js Docs — Material.onBeforeCompile",
    url: "https://threejs.org/docs/#api/en/materials/Material.onBeforeCompile",
    note: {
      vi: "Mô tả chính thức cơ chế patch shader mà bài này dùng để chèn code đọc texture GPGPU vào MeshStandardMaterial mà không mất lighting/PBR.",
      en: "The official description of the shader-patching mechanism this lesson uses to inject the GPGPU texture read into MeshStandardMaterial without losing lighting/PBR.",
    },
  },
  {
    id: "webgl2fundamentals-gpgpu",
    type: "article",
    title: "WebGL2 Fundamentals — GPGPU (Vertex and Fragment Texture Reads)",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html",
    note: {
      vi: "Giải thích chi tiết việc đọc texture từ vertex shader ở WebGL thuần — bối cảnh hữu ích để hiểu Three đang làm gì bên dưới lớp onBeforeCompile.",
      en: "A detailed walkthrough of reading textures from a vertex shader in raw WebGL — useful context for what Three is doing underneath the onBeforeCompile layer.",
    },
  },
];
