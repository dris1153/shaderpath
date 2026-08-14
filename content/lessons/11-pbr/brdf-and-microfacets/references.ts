import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "walter-2007-microfacet-models",
    type: "paper",
    title: "Microfacet Models for Refraction through Rough Surfaces",
    authors: ["Bruce Walter", "Stephen R. Marschner", "Hongsong Li", "Kenneth E. Torrance"],
    year: 2007,
    url: "https://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf",
    note: {
      vi: "Nguồn chuẩn cho công thức GGX/Trowbridge-Reitz $D(h)$ dùng trong bài này — phần 2 và 3 dẫn xuất phân bố này từ thống kê pháp tuyến vi mô, đúng mạch 'roughness = độ tán pháp tuyến' của bài học.",
      en: "The canonical source for the GGX/Trowbridge-Reitz $D(h)$ formula used in this lesson — sections 2 and 3 derive the distribution from micro-normal statistics, matching this lesson's 'roughness = spread of normals' framing exactly.",
    },
  },
  {
    id: "karis-2013-real-shading-ue4",
    type: "article",
    title: "Real Shading in Unreal Engine 4",
    authors: ["Brian Karis"],
    year: 2013,
    url: "https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf",
    note: {
      vi: "Nguồn của remap $\\alpha = \\text{roughness}^2$ và $k = (\\text{roughness}+1)^2/8$ cho ánh sáng trực tiếp dùng trong bài — phần 'Specular D' và 'Specular G' của tài liệu này chính là công thức được cài lại từng bước ở đây.",
      en: "The source of the $\\alpha = \\text{roughness}^2$ remap and the direct-light $k = (\\text{roughness}+1)^2/8$ used in this lesson — its 'Specular D' and 'Specular G' sections are exactly the formulas rebuilt step by step here.",
    },
  },
  {
    id: "filament-pbr-materials-guide",
    type: "article",
    title: "Physically Based Rendering in Filament",
    authors: ["Google"],
    url: "https://google.github.io/filament/Filament.md.html",
    note: {
      vi: "Tài liệu kỹ thuật của engine Filament (Google) trình bày đầy đủ Cook-Torrance specular BRDF cùng cân bằng năng lượng $k_d = (1-F)(1-\\text{metalness})$ dùng trong một production renderer thật, không phải bài giảng đơn thuần.",
      en: "Google's Filament engine technical documentation lays out the full Cook-Torrance specular BRDF and the $k_d = (1-F)(1-\\text{metalness})$ energy balance used in this lesson, as implemented in a real production renderer rather than a teaching toy.",
    },
  },
  {
    id: "cook-torrance-1982-reflectance-model",
    type: "paper",
    title: "A Reflectance Model for Computer Graphics",
    authors: ["Robert L. Cook", "Kenneth E. Torrance"],
    year: 1982,
    url: "https://dl.acm.org/doi/10.1145/357290.357293",
    note: {
      vi: "Bài báo gốc đặt tên và dẫn xuất công thức Cook-Torrance, gồm cả nguồn gốc số hạng chuẩn hoá $4(n\\cdot v)(n\\cdot l)$ từ phép đổi biến tích phân — đọc để thấy công thức hiện đại trong bài học bắt nguồn từ đâu.",
      en: "The original paper that names and derives the Cook-Torrance formula, including where the $4(n\\cdot v)(n\\cdot l)$ normalization term comes from via the integral's change of variables — read it to see where this lesson's modern formula actually originates.",
    },
  },
];
