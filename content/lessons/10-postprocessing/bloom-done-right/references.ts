import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "unreal-engine-docs-bloom",
    type: "article",
    title: "Unreal Engine Documentation — Bloom",
    authors: ["Epic Games"],
    url: "https://dev.epicgames.com/documentation/unreal-engine/bloom-in-unreal-engine",
    note: {
      vi: "Nguồn gốc kỹ thuật mà UnrealBloomPass mô phỏng theo (chính comment trong mã nguồn three.js trỏ tới tài liệu Unreal) — mô tả bloom như tán xạ ánh sáng thật, và chuỗi Gaussian blur đa độ phân giải khớp với các mip trong bài.",
      en: "The technique UnrealBloomPass is modeled after (three.js's own source comment points to Unreal's documentation) — describes bloom as real light scattering, and the multi-resolution Gaussian blur chain matches this lesson's mips.",
    },
  },
  {
    id: "threejs-source-unreal-bloom-pass",
    type: "repo",
    title: "three.js source — UnrealBloomPass.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/UnrealBloomPass.js",
    note: {
      vi: "Mã nguồn thật của ba bước high-pass/blur/composite, bloomFactors, kernelSizeArray trích dẫn trong bài — không phải diễn giải lại.",
      en: "The actual source for the high-pass/blur/composite steps, bloomFactors, and kernelSizeArray quoted in this lesson — not a paraphrase.",
    },
  },
  {
    id: "threejs-docs-unreal-bloom-pass",
    type: "article",
    title: "Three.js Docs — UnrealBloomPass",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/pages/UnrealBloomPass.html",
    note: {
      vi: "Chữ ký constructor chính thức (resolution, strength, radius, threshold) đi cùng phần đọc mã nguồn thật trong bài.",
      en: "The official constructor signature (resolution, strength, radius, threshold) alongside this lesson's real source reading.",
    },
  },
  {
    id: "threejs-source-tonemapping-chunk",
    type: "repo",
    title: "three.js source — tonemapping_pars_fragment.glsl.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js",
    note: {
      vi: "Nguồn cho khẳng định 'mọi đường cong tonemapping tiêu chuẩn đều kết thúc bằng saturate()' — cơ sở của cái bẫy HDR/tonemapping trong bài.",
      en: "The source backing the claim that 'every standard tonemapping curve ends with saturate()' — the basis for this lesson's HDR/tonemapping trap.",
    },
  },
  {
    id: "r3f-docs-canvas-defaults",
    type: "article",
    title: "React Three Fiber Docs — Canvas (default renderer configuration)",
    authors: ["Poimandres (pmndrs)"],
    url: "https://r3f.docs.pmnd.rs/api/canvas",
    note: {
      vi: "Xác nhận `<Canvas>` tự đặt `toneMapping = THREE.ACESFilmicToneMapping` mặc định trừ khi truyền `flat` — chi tiết áp dụng trực tiếp lên DemoCanvas của nền tảng này.",
      en: "Confirms `<Canvas>` sets `toneMapping = THREE.ACESFilmicToneMapping` by default unless `flat` is passed — a detail that applies directly to this platform's DemoCanvas.",
    },
  },
];
