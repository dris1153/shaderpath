import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "reinhard-photographic-tone-reproduction",
    type: "paper",
    title: "Photographic Tone Reproduction for Digital Images",
    authors: ["Erik Reinhard", "Michael Stark", "Peter Shirley", "James Ferwerda"],
    year: 2002,
    url: "https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf",
    note: {
      vi: "Bài báo gốc của công thức Reinhard $x/(1+x)$ — chính là nguồn three.js trích dẫn ngay trong code (tonemapping_pars_fragment.glsl.js). Đọc phần 3 để thấy vì sao toán tử này chọn nén theo tỉ lệ chứ không theo ngưỡng cứng.",
      en: "The original paper behind the Reinhard $x/(1+x)$ operator — the exact source three.js cites in its own shader code (tonemapping_pars_fragment.glsl.js). Section 3 explains why the operator compresses proportionally instead of clipping at a hard threshold.",
    },
  },
  {
    id: "narkowicz-aces-filmic-curve",
    type: "article",
    title: "ACES Filmic Tone Mapping Curve",
    authors: ["Krzysztof Narkowicz"],
    year: 2016,
    url: "https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/",
    note: {
      vi: "Nguồn của đúng bộ ma trận ACESInputMat/ACESOutputMat mà three.js dùng trong ACESFilmicToneMapping — three không chạy pipeline ACES đầy đủ (nhiều LUT), mà dùng xấp xỉ fit này.",
      en: "The source of the exact ACESInputMat/ACESOutputMat matrix pair three.js uses in ACESFilmicToneMapping — three doesn't run the full multi-LUT ACES pipeline, it uses this fitted approximation.",
    },
  },
  {
    id: "filament-tone-mapping",
    type: "spec",
    title: "Filament — Tone mapping (Physically Based Rendering in Filament)",
    authors: ["Google"],
    url: "https://google.github.io/filament/Filament.html#mediumq/toneMapping",
    note: {
      vi: "Tài liệu kỹ thuật so sánh Reinhard, ACES và AgX trên cùng một khung nhìn khoa học màu, và giải thích rõ vì sao pipeline hiện đại luôn đặt grading SAU tone mapping — đúng luận điểm 'order doctrine' của bài này.",
      en: "A technical reference comparing Reinhard, ACES and AgX under one consistent color-science framing, and it explains precisely why modern pipelines place grading AFTER tone mapping — the exact 'order doctrine' argument this lesson makes.",
    },
  },
  {
    id: "threejs-postprocessing-3dlut-example",
    type: "repo",
    title: "three.js example — webgl_postprocessing_3dlut",
    authors: ["mrdoob and contributors"],
    url: "https://threejs.org/examples/?q=lut#webgl_postprocessing_3dlut",
    note: {
      vi: "Ví dụ chính thức dùng LUTPass thật của three.js với Data3DTexture — đối chiếu với GradingPipeline tự viết trong bài này để thấy cùng một mô hình sampler3D + half-texel inset.",
      en: "The official three.js example using the real LUTPass with a Data3DTexture — compare it against this lesson's hand-written GradingPipeline to see the same sampler3D + half-texel-inset model in production code.",
    },
  },
];
