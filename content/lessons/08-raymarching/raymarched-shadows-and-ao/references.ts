import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iq-soft-shadows",
    type: "article",
    title: "Soft Shadows in Raymarched SDFs",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/rmshadows/",
    note: {
      vi: "Nguồn gốc công thức bóng mềm k*h/t và bản cải tiến dùng khoảng cách vuông góc thật thay vì xấp xỉ thô — chính công thức softShadow bài này cài đặt.",
      en: "The origin of the k*h/t soft-shadow ratio and its improved version using the true perpendicular distance instead of a coarse approximation — the exact softShadow this lesson implements.",
    },
  },
  {
    id: "iq-rendering-worlds-two-triangles",
    type: "article",
    title: "Rendering Worlds With Two Triangles",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/nvscene2008/",
    note: {
      vi: "Bài nói nvscene 2008 giới thiệu kỹ thuật ambient occlusion 5-tap bằng cách lấy mẫu SDF dọc normal — nguồn của calcAO trong bài này.",
      en: "The 2008 nvscene talk introducing the 5-tap ambient-occlusion technique of sampling an SDF along the normal — the source of this lesson's calcAO.",
    },
  },
  {
    id: "learnopengl-shadow-mapping",
    type: "article",
    title: "Advanced Lighting: Shadow Mapping",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping",
    note: {
      vi: "Kỹ thuật shadow mapping đối lập với bài này — render depth từ góc nhìn ánh sáng vào texture, kèm chính hai vấn đề resolution/bias mà raymarched shadow không gặp phải.",
      en: "The shadow-mapping technique this lesson contrasts with — rendering depth from the light's viewpoint into a texture, with exactly the resolution/bias problems raymarched shadows avoid.",
    },
  },
];
