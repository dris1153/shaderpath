import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-shadows",
    type: "article",
    title: "Three.js Fundamentals — Shadows",
    url: "https://threejs.org/manual/en/shadows.html",
    note: {
      vi: "Bài viết chính thức của Three.js về shadow map: bốn cờ bật shadow, chi phí render nhiều light cùng lúc, và ví dụ trực quan về shadow camera frustum.",
      en: "Three.js's own manual page on shadow maps: the four flags to enable shadows, the render cost of many lights at once, and a visual example of the shadow camera frustum.",
    },
  },
  {
    id: "threejs-docs-directional-light-shadow",
    type: "article",
    title: "DirectionalLightShadow — three.js docs",
    url: "https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow",
    note: {
      vi: "Tài liệu API chính xác cho mapSize, camera (OrthographicCamera), bias và normalBias — tra cứu giá trị mặc định thật khi bài học nói 'mặc định'.",
      en: "The exact API reference for mapSize, camera (an OrthographicCamera), bias and normalBias — the source to check real default values whenever this lesson says 'default'.",
    },
  },
  {
    id: "learnopengl-shadow-mapping",
    type: "article",
    title: "LearnOpenGL — Shadow Mapping",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping",
    note: {
      vi: "Giải thích cơ chế shadow acne và peter-panning ở mức GPU thấp nhất (không riêng Three.js) — đọc để thấy đây là vấn đề của kỹ thuật shadow map nói chung, không phải quirk riêng của một engine.",
      en: "Explains the shadow acne and peter-panning mechanism at the lowest GPU level (not Three.js-specific) — read it to see this is a property of the shadow-mapping technique itself, not one engine's quirk.",
    },
  },
  {
    id: "learnopengl-point-shadows",
    type: "article",
    title: "LearnOpenGL — Point Shadows",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-Lighting/Shadows/Point-Shadows",
    note: {
      vi: "Chi tiết vì sao PointLight cần render sáu mặt cube map thay vì một shadow map phẳng — đúng lý do PointLight nằm ở bậc chi phí cao nhất trong bài này.",
      en: "Details why a point light needs six cube-map faces instead of one flat shadow map — the exact reason PointLight sits at the top of this lesson's cost ladder.",
    },
  },
];
