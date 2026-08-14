import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-gltf-2-spec",
    type: "spec",
    title: "glTF 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html",
    note: {
      vi: "Nguồn chuẩn định nghĩa scene graph, accessor/bufferView và cách buffer nhị phân ánh xạ sang vertex attribute — đúng cấu trúc file glTF nhúng trong demo bài này.",
      en: "The authoritative source defining the scene graph, accessors/bufferViews, and how binary buffers map to vertex attributes — exactly the file structure this lesson's embedded demo builds.",
    },
  },
  {
    id: "threejs-gltfloader-docs",
    type: "article",
    title: "Three.js Docs — GLTFLoader",
    url: "https://threejs.org/docs/#examples/en/loaders/GLTFLoader",
    note: {
      vi: "Tài liệu chính thức về API load()/parse(), cấu trúc object gltf trả về, và cách gắn DRACOLoader/KTX2Loader vào GLTFLoader.",
      en: "The official docs for the load()/parse() API, the shape of the returned gltf object, and how to attach a DRACOLoader/KTX2Loader to GLTFLoader.",
    },
  },
  {
    id: "threejs-dracoloader-docs",
    type: "article",
    title: "Three.js Docs — DRACOLoader",
    url: "https://threejs.org/docs/#examples/en/loaders/DRACOLoader",
    note: {
      vi: "Chi tiết setDecoderPath, setDecoderConfig và vì sao decoder WASM phải được host đúng đường dẫn trước khi load model nén Draco.",
      en: "Details on setDecoderPath, setDecoderConfig, and why the WASM decoder must be hosted at the correct path before loading a Draco-compressed model.",
    },
  },
  {
    id: "google-draco-repo",
    type: "repo",
    title: "Draco: 3D Data Compression",
    authors: ["Google"],
    url: "https://github.com/google/draco",
    note: {
      vi: "README của thư viện Draco — nguồn cho con số tỉ lệ nén ~90%+ và giải thích cơ chế lượng tử hoá + entropy encoding dùng trong bài.",
      en: "The Draco library's README — the source for the ~90%+ compression figure cited in this lesson, and an explanation of the quantization + entropy-encoding mechanism.",
    },
  },
  {
    id: "meshoptimizer-repo",
    type: "repo",
    title: "meshoptimizer / gltfpack",
    authors: ["Arseny Kapoulkine"],
    url: "https://github.com/zeux/meshoptimizer",
    note: {
      vi: "Repo gốc của meshopt và công cụ gltfpack — có benchmark decode speed so với Draco, nguồn cho phần so sánh tốc độ trong bài.",
      en: "The original meshopt and gltfpack repo — includes decode-speed benchmarks against Draco, the source for this lesson's speed comparison.",
    },
  },
];
