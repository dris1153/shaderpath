import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "ltc-avoids-integrating-ggx",
    q: {
      vi: "Không có công thức đóng cho tích phân GGX trên đa giác của đèn. LTC né chuyện đó bằng cách nào?",
      en: "There's no closed form for integrating GGX over a light's polygon. How does LTC get around that?",
    },
    a: {
      vi: "Xấp xỉ lobe GGX bằng một lobe cosine bị kẹp (clamped cosine), biến dạng qua một ma trận $3\\times3$ — cosine là hình có công thức tích phân đóng trên đa giác bất kỳ. Biến đổi các đỉnh đa giác đèn bằng ma trận nghịch đảo rồi tích phân cosine thường bằng công thức có sẵn. Ma trận chỉ phụ thuộc roughness và góc nhìn, nên được tính sẵn thành LUT.",
      en: "It approximates the GGX lobe with a clamped cosine lobe warped by a $3\\times3$ matrix — the cosine is the shape with an exact closed-form integral over any polygon. Transform the light polygon's vertices by the inverse matrix, then integrate the plain cosine with the ready-made formula. The matrix depends only on roughness and view angle, so it's precomputed into a LUT.",
    },
  },
  {
    id: "rect-area-light-no-shadows",
    q: {
      vi: "Đặt `castShadow = true` cho một `RectAreaLight` làm key light thì được gì, và muốn có bóng tiếp xúc phải làm sao?",
      en: "What does `castShadow = true` on a `RectAreaLight` key light get you, and how do you get contact shadows?",
    },
    a: {
      vi: "Không được gì: three không có đường shadow map nào cho loại đèn này (renderer bỏ qua nó, cùng lắm in cảnh báo rằng đèn không có shadow). Muốn có bóng phải thêm một đèn riêng đổ bóng, thường là một `DirectionalLight`/`SpotLight` mờ chỉ để làm việc đó.",
      en: "Nothing: three has no shadow-map path for this light type (the renderer skips it, at most logging a warning that the light has no shadow). For shadows you add a separate shadow-casting light, usually a dim `DirectionalLight`/`SpotLight` there only for that job.",
    },
  },
  {
    id: "sh-probe-diffuse-only",
    q: {
      vi: "`LightProbe` gói ánh sáng vào 9 hệ số Spherical Harmonics. Vì sao chừng đó đủ cho diffuse nhưng không thay được prefiltered environment cho specular?",
      en: "`LightProbe` packs lighting into 9 Spherical Harmonics coefficients. Why is that enough for diffuse but no replacement for a prefiltered environment for specular?",
    },
    a: {
      vi: "SH bậc thấp (các band $l = 0, 1, 2$) chỉ dựng lại tốt tín hiệu mượt, tần số thấp. Irradiance đúng là loại đó, vì tích chập với lobe cosine tự nó là bộ lọc thông thấp. Phản xạ specular sắc lại cần chi tiết tần số cao mà 9 hệ số không giữ nổi.",
      en: "Low-order SH (bands $l = 0, 1, 2$) only rebuilds smooth, low-frequency signals well. Irradiance is exactly that, since convolving with a cosine lobe is itself a low-pass filter. Sharp specular reflections need high-frequency detail that 9 coefficients can't hold.",
    },
  },
];
