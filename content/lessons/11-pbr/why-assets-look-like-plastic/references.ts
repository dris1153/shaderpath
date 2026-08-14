import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "lagarde-feeding-pbs-2011",
    type: "article",
    title: "Feeding a Physically Based Shading Model",
    authors: ["Sébastien Lagarde"],
    year: 2011,
    url: "https://seblagarde.wordpress.com/2011/08/17/feeding-a-physical-based-lighting-mode/",
    note: {
      vi: "Nguồn của bảng albedo tham chiếu dùng trong bài (than củi ≈0.04, tuyết mới ≈0.8–0.9) — số liệu thật, không phải ước lượng cho vui.",
      en: "The source of this lesson's reference albedo chart (charcoal ≈0.04, fresh snow ≈0.8–0.9) — real measured numbers, not a rough guess.",
    },
  },
  {
    id: "filament-materials-guide",
    type: "article",
    title: "Filament — Materials Guide",
    authors: ["Romain Guy", "Mathias Agopian", "Google"],
    url: "https://google.github.io/filament/Materials.md.html",
    note: {
      vi: "Xác nhận quy ước $F_0 = 0.04$ mặc định cho điện môi và lý do metalness/roughness workflow coi metalness là gần như nhị phân.",
      en: "Confirms the default $F_0 = 0.04$ convention for dielectrics and why the metalness/roughness workflow treats metalness as nearly binary.",
    },
  },
  {
    id: "learnopengl-diffuse-irradiance",
    type: "article",
    title: "LearnOpenGL — Diffuse Irradiance (IBL)",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/PBR/IBL/Diffuse-irradiance",
    note: {
      vi: "Giải thích vì sao thiếu ánh sáng môi trường khiến specular đọc như một chấm cô lập thay vì một bề mặt liên tục — cơ sở của nguyên nhân #4 trong bài.",
      en: "Explains why missing environment lighting makes specular read as an isolated dot instead of a continuous surface — the basis for cause #4 in this lesson.",
    },
  },
  {
    id: "threejs-source-tonemapping-chunk-plastic",
    type: "repo",
    title: "three.js source — tonemapping_pars_fragment.glsl.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js",
    note: {
      vi: "Nguồn cho khẳng định NoToneMapping cắt cứng giá trị >1.0 về trắng thay vì cuộn mượt như ACES — cơ sở của nguyên nhân #7.",
      en: "The source backing the claim that NoToneMapping hard-clips values above 1.0 to white instead of rolling off like ACES — the basis for cause #7.",
    },
  },
];
