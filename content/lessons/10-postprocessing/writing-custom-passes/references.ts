import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-pass-source",
    type: "repo",
    title: "three.js source — postprocessing/Pass.js",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/Pass.js",
    note: {
      vi: "Nguồn chuẩn của lớp `Pass` và `FullScreenQuad` — bài này đọc trực tiếp file này để xác nhận contract (enabled/needsSwap/clear/renderToScreen, chữ ký render()) và phát hiện chi tiết FullScreenQuad dùng chung một hình học module-level.",
      en: "The canonical source for the `Pass` and `FullScreenQuad` classes — this lesson reads this file directly to confirm the contract (enabled/needsSwap/clear/renderToScreen, the render() signature) and to surface that FullScreenQuad shares one module-level geometry.",
    },
  },
  {
    id: "threejs-manual-postprocessing",
    type: "article",
    title: "three.js manual — How to use post-processing",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing",
    note: {
      vi: "Giới thiệu chính thức về EffectComposer/ShaderPass từ phía three.js — điểm khởi đầu tốt trước khi đọc thẳng source code như bài này làm.",
      en: "The official three.js introduction to EffectComposer/ShaderPass — a good starting point before reading the raw source the way this lesson does.",
    },
  },
  {
    id: "threejs-effectcomposer-docs",
    type: "spec",
    title: "three.js docs — EffectComposer",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#examples/en/postprocessing/EffectComposer",
    note: {
      vi: "Tài liệu API chính thức cho addPass/render/setSize/dispose — đối chiếu với class GradingPipeline/ShimmerRenderer trong hai bài LUT và custom pass để thấy đúng những gì tài liệu mô tả.",
      en: "The official API reference for addPass/render/setSize/dispose — cross-check it against this module's GradingPipeline/ShimmerRenderer classes to see exactly what the docs describe in working code.",
    },
  },
  {
    id: "pmndrs-postprocessing-repo",
    type: "repo",
    title: "pmndrs/postprocessing",
    authors: ["Raoul van Rüschen and contributors"],
    url: "https://github.com/pmndrs/postprocessing",
    note: {
      vi: "Thư viện đứng sau @react-three/postprocessing — kiến trúc Effect (gộp nhiều hiệu ứng vào ít pass hơn) khác hẳn Pass tuần tự của three.js core; đọc README để thấy sự đánh đổi được nêu trong phần 'khi nào dùng Effect thay vì Pass' của bài này.",
      en: "The library behind @react-three/postprocessing — its Effect architecture (merging multiple effects into fewer passes) is a genuinely different contract from three.js core's sequential Pass; the README lays out the tradeoff covered in this lesson's 'Effect vs Pass' section.",
    },
  },
];
