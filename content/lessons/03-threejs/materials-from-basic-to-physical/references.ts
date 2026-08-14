import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-mesh-standard-material",
    type: "article",
    title: "Three.js Docs — MeshStandardMaterial",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/MeshStandardMaterial",
    note: {
      vi: "Danh sách đầy đủ tham số của material PBR mặc định — tra `metalness`/`roughness` và các uniform liên quan trực tiếp từ nguồn.",
      en: "The full parameter list for the default PBR material — the direct source for `metalness`/`roughness` and their related uniforms.",
    },
  },
  {
    id: "threejs-docs-mesh-physical-material",
    type: "article",
    title: "Three.js Docs — MeshPhysicalMaterial",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial",
    note: {
      vi: "Giải thích `clearcoat`, `transmission`, `sheen`, `iridescence` — các lớp vật lý phụ mà Standard không có.",
      en: "Documents `clearcoat`, `transmission`, `sheen`, `iridescence` — the extra physical layers Standard doesn't have.",
    },
  },
  {
    id: "karis-real-shading-ue4-2013",
    type: "paper",
    title: "Real Shading in Unreal Engine 4",
    authors: ["Brian Karis"],
    year: 2013,
    url: "https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf",
    note: {
      vi: "Nguồn của công thức `diffuseColor = baseColor * (1 - metalness)` và `F0 = mix(0.04, baseColor, metalness)` dùng trong bài — cách một engine AAA triển khai metalness/roughness workflow thực tế.",
      en: "The source of the `diffuseColor = baseColor * (1 - metalness)` and `F0 = mix(0.04, baseColor, metalness)` formulas used in this lesson — how a shipping AAA engine implements the metalness/roughness workflow.",
    },
  },
  {
    id: "google-filament-materials-guide",
    type: "article",
    title: "Filament — Material System Guide",
    authors: ["Google"],
    url: "https://google.github.io/filament/Materials.html",
    note: {
      vi: "Tài liệu PBR mã nguồn mở giải thích rất rõ vì sao dielectric có F0 ≈ 0.04 và kim loại không có thành phần diffuse — cùng mô hình Three.js Standard/Physical dùng.",
      en: "An open-source PBR reference that explains clearly why dielectrics sit at F0 ≈ 0.04 and metals have no diffuse term — the same model Three.js's Standard/Physical materials follow.",
    },
  },
];
