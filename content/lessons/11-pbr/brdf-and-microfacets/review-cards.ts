import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "half-vector-and-d",
    q: {
      vi: "Half-vector $h$ trong Cook-Torrance là hướng gì, và $D(h)$ trả lời câu hỏi nào?",
      en: "What direction is the half-vector $h$ in Cook-Torrance, and what question does $D(h)$ answer?",
    },
    a: {
      vi: "$h = \\text{normalize}(\\omega_i + \\omega_o)$ là hướng mà một microfacet phải có để phản xạ gương $\\omega_i$ đúng vào $\\omega_o$. $D(h)$ cho biết mật độ microfacet có pháp tuyến trùng $h$ — tức có bao nhiêu \"gương nhỏ\" thực sự gửi được ánh sáng đó về phía camera.",
      en: "$h = \\text{normalize}(\\omega_i + \\omega_o)$ is the direction a microfacet would have to face to mirror $\\omega_i$ straight into $\\omega_o$. $D(h)$ gives the density of microfacets whose normal matches $h$ — how many \"tiny mirrors\" can actually send that light toward the camera.",
    },
  },
  {
    id: "dropping-g-brightens-edges",
    q: {
      vi: "Bỏ hẳn số hạng $G$ (chỉ dùng $D \\cdot F$) thì rìa một quả cầu trông thế nào, vì sao?",
      en: "Drop the $G$ term entirely (using only $D \\cdot F$) — what happens at a sphere's edges, and why?",
    },
    a: {
      vi: "Rìa sáng bất thường. $G$ loại những microfacet dù hướng đúng $h$ nhưng bị hàng xóm che mất ánh sáng tới (shadowing) hoặc tia phản xạ (masking), và việc che này mạnh nhất ở góc sượt. Bỏ $G$ là đếm cả những facet bị che, nên bề mặt phản xạ ra nhiều năng lượng hơn nó nhận — vi phạm bảo toàn năng lượng, lộ rõ nhất ở rìa.",
      en: "They glow abnormally bright. $G$ removes the microfacets that face $h$ but are hidden by their neighbors from the incoming light (shadowing) or the reflected ray (masking), and that blocking is strongest at grazing angles. Without $G$ you count the hidden facets too, so the surface reflects more energy than it received — an energy-conservation violation most visible at the edges.",
    },
  },
  {
    id: "kd-two-factors",
    q: {
      vi: "Trong $k_d = (1-F)(1-\\text{metalness})$, mỗi thừa số có nhiệm vụ gì?",
      en: "In $k_d = (1-F)(1-\\text{metalness})$, what job does each factor do?",
    },
    a: {
      vi: "$(1-F)$: phần năng lượng specular đã lấy (tỉ lệ $F$) thì diffuse không được dùng lại, nếu không bề mặt tỏa ra nhiều sáng hơn nhận vào. $(1-\\text{metalness})$: kim loại không có diffuse — ánh sáng không phản xạ gương bị electron tự do hấp thụ — nên thiếu thừa số này, kim loại trông như phủ một lớp nhựa mờ.",
      en: "$(1-F)$: the energy specular already claimed (fraction $F$) can't be reused by diffuse, or the surface would give out more light than it received. $(1-\\text{metalness})$: metals have no diffuse — light that doesn't reflect specularly gets absorbed by free electrons — so without this factor a metal looks coated in a thin layer of dull plastic.",
    },
  },
];
