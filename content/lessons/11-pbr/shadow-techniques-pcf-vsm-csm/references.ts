import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "semantic-scholar-reeves-1987-pcf",
    type: "paper",
    title: "Rendering Antialiased Shadows with Depth Maps",
    authors: ["William T. Reeves", "David H. Salesin", "Robert L. Cook"],
    year: 1987,
    url: "https://www.semanticscholar.org/paper/Rendering-antialiased-shadows-with-depth-maps-Reeves-Salesin/c84bf26d73ab6ed258db8b33e87e0cd291c89c43",
    note: {
      vi: "Bài báo gốc đặt tên Percentage-Closer Filtering (SIGGRAPH 1987) — nguồn của ý tưởng lọc phép SO SÁNH nhiều lần thay vì lọc bản đồ độ sâu trước khi so sánh.",
      en: "The original paper that coined Percentage-Closer Filtering (SIGGRAPH 1987) — the source of the idea of filtering the COMPARISON multiple times instead of blurring the depth map before comparing.",
    },
  },
  {
    id: "acm-donnelly-lauritzen-2006-vsm",
    type: "paper",
    title: "Variance Shadow Maps",
    authors: ["William Donnelly", "Andrew Lauritzen"],
    year: 2006,
    url: "https://dl.acm.org/doi/10.1145/1111411.1111440",
    note: {
      vi: "Bài báo gốc của VSM (I3D 2006) — nguồn của ý tưởng lưu (mean, mean-of-squares) thay vì depth thô và dùng bất đẳng thức Chebyshev, cùng phân tích artifact light bleeding.",
      en: "The original VSM paper (I3D 2006) — the source of storing (mean, mean-of-squares) instead of raw depth and using Chebyshev's inequality, plus the analysis of the light-bleeding artifact.",
    },
  },
  {
    id: "nvidia-dimitrov-cascaded-shadow-maps",
    type: "article",
    title: "Cascaded Shadow Maps",
    authors: ["Rouslan Dimitrov", "NVIDIA Corporation"],
    year: 2007,
    url: "https://developer.download.nvidia.com/SDK/10.5/opengl/src/cascaded_shadow_maps/doc/cascaded_shadow_maps.pdf",
    note: {
      vi: "Tài liệu kỹ thuật gốc của NVIDIA giải thích CSM: chia frustum camera thành nhiều lát, mỗi lát một shadow map riêng để giữ mật độ texel cao gần camera.",
      en: "NVIDIA's original technical write-up on CSM: splitting the camera frustum into slices, each with its own shadow map, to keep texel density high near the camera.",
    },
  },
  {
    id: "threejs-docs-directional-light-shadow",
    type: "article",
    title: "DirectionalLightShadow — three.js docs",
    url: "https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow",
    note: {
      vi: "Tài liệu API chính xác cho mapSize, bias, normalBias, radius, blurSamples — nguồn xác nhận 'radius has no effect on BasicShadowMap' trích trong bảng tinh chỉnh của bài.",
      en: "The exact API reference for mapSize, bias, normalBias, radius, blurSamples — the source confirming 'radius has no effect on BasicShadowMap' quoted in this lesson's tuning table.",
    },
  },
  {
    id: "learnopengl-shadow-mapping",
    type: "article",
    title: "LearnOpenGL — Shadow Mapping",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping",
    note: {
      vi: "Giải thích aliasing của shadow map ở mức GPU thấp nhất (texel-footprint-trên-màn-hình), không riêng three.js — nền cho công thức frustumWidth/mapSize dùng trong bài.",
      en: "Explains shadow-map aliasing at the lowest GPU level (screen-space texel footprint), not three.js-specific — the basis for the frustumWidth/mapSize formula used in this lesson.",
    },
  },
];
