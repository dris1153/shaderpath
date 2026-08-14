import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "filament-pbr-metallic",
    type: "article",
    title: "Physically Based Rendering in Filament — Standard Model",
    authors: ["Google"],
    url: "https://google.github.io/filament/Filament.md.html",
    note: {
      vi: "Nguồn trích dẫn trực tiếp câu \"Metallic is almost a binary value... transitions between surface types (metal to rust for instance)\" dùng trong bài.",
      en: "The direct source for the quoted line \"Metallic is almost a binary value... transitions between surface types (metal to rust for instance)\" used in this lesson.",
    },
  },
  {
    id: "threejs-docs-meshstandardmaterial",
    type: "article",
    title: "Three.js Docs — MeshStandardMaterial",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/MeshStandardMaterial",
    note: {
      vi: "Tài liệu chính thức cho map/metalnessMap/roughnessMap/normalMap/aoMap và normalScale — đối chiếu cùng với mã nguồn shader chunk (roughnessmap_fragment.glsl.js, metalnessmap_fragment.glsl.js, aomap_fragment.glsl.js) để xác nhận đúng kênh channel-packing (R/G/B = AO/Roughness/Metalness) và quy tắc colorSpace dùng trong bài.",
      en: "Official docs for map/metalnessMap/roughnessMap/normalMap/aoMap and normalScale — cross-checked against the shader chunk source (roughnessmap_fragment.glsl.js, metalnessmap_fragment.glsl.js, aomap_fragment.glsl.js) to confirm the R/G/B = AO/Roughness/Metalness channel-packing convention and colorSpace rules this lesson relies on.",
    },
  },
  {
    id: "khronos-gltf-spec-glossiness-archived",
    type: "spec",
    title: "Khronos glTF — Archived KHR_materials_pbrSpecularGlossiness Extension",
    authors: ["Khronos Group"],
    url: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Archived/KHR_materials_pbrSpecularGlossiness",
    note: {
      vi: "Đặc tả gốc của chuẩn specular/glossiness từng song song với metalness/roughness trong glTF, nay đã bị archive — nguồn cho phần so sánh hai workflow.",
      en: "The original spec for the specular/glossiness standard that once ran parallel to metalness/roughness in glTF, now archived — the source for this lesson's workflow comparison.",
    },
  },
];
