import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "drei-github-repo",
    type: "repo",
    title: "pmndrs/drei — Useful Helpers for react-three-fiber",
    authors: ["Poimandres"],
    url: "https://github.com/pmndrs/drei",
    note: {
      vi: "README gọi thẳng drei là 'a growing collection' — nguồn cho luận điểm 'grab-bag, không phải core' của bài này; source từng helper nằm ngay trong `src/core`, đọc trực tiếp thay vì đoán qua tên component.",
      en: "The README calls drei itself 'a growing collection' — the source for this lesson's 'grab-bag, not core' argument; each helper's source sits right in `src/core`, readable directly instead of guessed from its name.",
    },
  },
  {
    id: "drei-docs-site",
    type: "article",
    title: "drei — Documentation & Storybook",
    url: "https://drei.pmnd.rs/",
    note: {
      vi: "Danh mục đầy đủ mọi helper (Html, Text, Center, Bounds, Environment, useTexture, useGLTF, shaderMaterial…) kèm demo tương tác — điểm bắt đầu khi cần tra 'có helper nào cho việc này không' trước khi tự viết tay.",
      en: "The full catalog of every helper (Html, Text, Center, Bounds, Environment, useTexture, useGLTF, shaderMaterial…) with interactive demos — the first stop when checking 'is there already a helper for this' before hand-rolling it.",
    },
  },
  {
    id: "troika-three-text-repo",
    type: "repo",
    title: "protectwise/troika — troika-three-text package",
    url: "https://github.com/protectwise/troika/tree/main/packages/troika-three-text",
    note: {
      vi: "Thư viện thật sự đứng sau `<Text>` của drei — giải thích chính xác cơ chế SDF atlas sinh trong web worker mà bài này mô tả, không phải suy đoán từ tên component.",
      en: "The library actually powering drei's `<Text>` — the exact mechanism behind the worker-generated SDF atlas this lesson describes, not a guess from the component's name.",
    },
  },
  {
    id: "threejs-docs-pmrem-generator",
    type: "spec",
    title: "Three.js Docs — PMREMGenerator",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/extras/PMREMGenerator",
    note: {
      vi: "Lớp Three.js mà `<Environment>` của drei chạy HDRI qua để tạo prefiltered environment map — nền cho lý thuyết IBL đầy đủ ở Track 11.",
      en: "The Three.js class drei's `<Environment>` runs an HDRI through to produce a prefiltered environment map — the foundation for the full IBL theory in Track 11.",
    },
  },
];
