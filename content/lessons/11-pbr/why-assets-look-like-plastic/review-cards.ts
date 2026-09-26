import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "triage-lighting-first",
    q: {
      vi: "Một cảnh trông \"như nhựa\". Nên kiểm tra nhóm nguyên nhân nào trước — ánh sáng, vật liệu nền hay các map chi tiết — và vì sao theo thứ tự đó?",
      en: "A scene looks \"plastic\". Which group of causes do you check first — lighting, base material, or detail maps — and why in that order?",
    },
    a: {
      vi: "Ánh sáng trước (có IBL chưa, exposure đúng chưa, tone mapping có bật không), rồi vật liệu nền (albedo, metalness, Fresnel), cuối cùng mới đến map chi tiết (roughness dao động, normal, AO). Ánh sáng sai thì không tham số vật liệu nào cứu được, còn map chi tiết chỉ có nghĩa khi hai tầng dưới đã đúng — dưới vài đèn trực tiếp, normal map gần như chỉ lộ ra ở chỗ đèn chiếu tới, còn IBL cho mỗi pháp tuyến bị lệch bắt một phần khác của môi trường.",
      en: "Lighting first (is IBL present, is exposure right, is tone mapping on), then base material (albedo, metalness, Fresnel), and detail maps (roughness variation, normal, AO) last. If lighting is wrong no material parameter can save the scene, and detail maps only mean something once the two layers below are right — under a couple of direct lights a normal map shows mostly where those lights hit, while IBL lets every perturbed normal pick up a different part of the environment.",
    },
  },
  {
    id: "uniform-low-roughness",
    q: {
      vi: "Roughness đặt cố định $0.05$ cho toàn bộ vật thể. Vì sao nó trông như nhựa đúc, và sửa bằng gì?",
      en: "Roughness is set to a fixed $0.05$ across a whole object. Why does it read as injection-molded plastic, and what fixes it?",
    },
    a: {
      vi: "Bề mặt thật có vân tay, bụi, vết xước nhỏ nên roughness dao động từ điểm này sang điểm khác. Một giá trị thấp và đều khắp nơi cho highlight sắc, giống hệt nhau ở mọi điểm — đúng kiểu nhựa ép khuôn. Thêm roughness map (hoặc noise) dao động nhẹ quanh giá trị gốc, cỡ ±0.03–0.08.",
      en: "Real surfaces carry fingerprints, dust and micro-scratches, so roughness drifts from point to point. One low, uniform value gives a sharp highlight that's identical everywhere — exactly how an injection-molded surface reflects. Add a roughness map (or noise) varying slightly around the base value, roughly ±0.03–0.08.",
    },
  },
  {
    id: "missing-contact-shadow",
    q: {
      vi: "Vật đặt đúng toạ độ Y trên sàn mà vẫn trông như lơ lửng. Thiếu gì, và cách sửa rẻ nhất là gì?",
      en: "An object sits at exactly the right Y on the floor yet still looks like it's floating. What's missing, and what's the cheapest fix?",
    },
    a: {
      vi: "Thiếu AO/bóng tiếp xúc: không có vùng tối ở chỗ chạm gắn vật với sàn nên mắt đọc là \"không chạm đất\". Cách rẻ nhất, khỏi phải bake AO map: một contact shadow — mảng tối mềm ngay điểm chạm, có thể chỉ là một decal alpha-blend.",
      en: "AO/contact shadowing: with no dark region at the contact point tying it to the floor, the eye reads \"not touching the ground\". The cheapest fix, with no baked AO map: a contact shadow — a soft dark patch right at the touch point, which can be as simple as an alpha-blended decal.",
    },
  },
];
