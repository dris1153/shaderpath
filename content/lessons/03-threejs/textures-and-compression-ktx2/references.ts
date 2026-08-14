import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-color-management",
    type: "article",
    title: "Three.js — Color Management",
    url: "https://threejs.org/manual/en/color-management.html",
    note: {
      vi: "Nguồn chính thức giải thích khi nào một texture cần `colorSpace = SRGBColorSpace` và khi nào phải giữ `NoColorSpace` — đúng quy tắc bài này áp dụng cho map màu vs map dữ liệu.",
      en: "The official source explaining when a texture needs `colorSpace = SRGBColorSpace` and when it must stay `NoColorSpace` — exactly the rule this lesson applies to color maps versus data maps.",
    },
  },
  {
    id: "threejs-docs-ktx2loader",
    type: "article",
    title: "KTX2Loader — three.js docs",
    url: "https://threejs.org/docs/#examples/en/loaders/KTX2Loader",
    note: {
      vi: "Tài liệu API cho `setTranscoderPath`/`detectSupport` — tra cứu đúng thứ tự gọi hàm khi wiring code trong bài này không load được texture thật.",
      en: "The API reference for `setTranscoderPath`/`detectSupport` — check the exact call order here when this lesson's wiring code doesn't load a real texture for you.",
    },
  },
  {
    id: "khronos-ktx2-spec",
    type: "spec",
    title: "KTX File Format Specification, Version 2.0",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/KTX/specs/2.0/ktxspec.v2.html",
    note: {
      vi: "Đặc tả gốc của container KTX2 — nguồn chuẩn cho cấu trúc supercompression, không phải bài diễn giải lại.",
      en: "The authoritative KTX2 container specification — the standard source for its supercompression structure, not a paraphrase.",
    },
  },
  {
    id: "basis-universal-repo",
    type: "repo",
    title: "Basis Universal GPU Texture Codec",
    authors: ["Binomial LLC"],
    url: "https://github.com/BinomialLLC/basis_universal",
    note: {
      vi: "Repo gốc của encoder/transcoder Basis Universal mà KTX2Loader dùng bên dưới — đọc README để hiểu vì sao một file nguồn có thể transcode ra nhiều định dạng GPU đích khác nhau.",
      en: "The source repo for the Basis Universal encoder/transcoder that KTX2Loader relies on — read the README to see why one source file can transcode into several different target GPU formats.",
    },
  },
];
