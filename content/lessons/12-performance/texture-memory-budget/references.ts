import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-texture",
    type: "article",
    title: "Three.js Docs — Texture",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/textures/Texture",
    note: {
      vi: "Trang tài liệu chính thức liệt kê format, type, generateMipmaps và dispose() — đúng bốn thuộc tính bài này dùng để tính công thức dung lượng.",
      en: "The official docs page listing format, type, generateMipmaps and dispose() — the exact four properties this lesson's footprint formula is built from.",
    },
  },
  {
    id: "khronos-webgl-s3tc-extension",
    type: "spec",
    title: "WebGL Extension — WEBGL_compressed_texture_s3tc",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc/",
    note: {
      vi: "Đặc tả chuẩn của định dạng nén GPU-native đầu tiên bài này nhắc tới — nguồn xác nhận dữ liệu ở dạng block nén nằm nguyên trong VRAM, không giải nén về RGBA8.",
      en: "The standard spec for the first GPU-native compressed format this lesson mentions — confirms the block-compressed data stays resident in VRAM instead of being decoded back to RGBA8.",
    },
  },
  {
    id: "khronos-ktx-software",
    type: "repo",
    title: "KhronosGroup/KTX-Software",
    authors: ["Khronos Group"],
    url: "https://github.com/KhronosGroup/KTX-Software",
    note: {
      vi: "Repo chính thức của công cụ KTX2 và codec Basis Universal — container 'nén một lần, transcode mọi nơi' mà bài này forward-ref tới bài asset-pipeline-draco-ktx2.",
      en: "The official repo for the KTX2 tooling and Basis Universal codec — the 'compress once, transcode anywhere' container this lesson forward-references to the asset-pipeline-draco-ktx2 lesson.",
    },
  },
  {
    id: "mdn-webgl-best-practices",
    type: "article",
    title: "MDN — WebGL Best Practices",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices",
    note: {
      vi: "Nguồn thực tế về việc trình duyệt không lộ dung lượng GPU và về context loss khi vượt ngân sách bộ nhớ — nền tảng cho phần 'lập ngân sách cho thiết bị cụ thể' của bài.",
      en: "A practical source on browsers not exposing GPU memory usage and on context loss when a memory budget is exceeded — the basis for the lesson's 'budgeting for a specific device' section.",
    },
  },
];
