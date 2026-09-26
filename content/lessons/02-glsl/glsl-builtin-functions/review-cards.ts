import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "mod-negative",
    q: {
      vi: "`mod(-0.3, 1.0)` trong GLSL ra bao nhiêu, còn `-0.3 % 1` trong JavaScript — và vì sao khác?",
      en: "What does `mod(-0.3, 1.0)` give in GLSL, and `-0.3 % 1` in JavaScript — and why do they differ?",
    },
    a: {
      vi: "GLSL cho 0.7: `mod` định nghĩa bằng `floor`, kết quả mang dấu của số chia, giống `fract`. JavaScript cho −0.3: phép chia cắt cụt về 0, kết quả mang dấu của số bị chia. Logic port từ JavaScript mà vẫn chờ kết quả âm sẽ sai ngay khi UV âm, ví dụ sau khi dời tâm về gốc.",
      en: "GLSL gives 0.7: `mod` is defined with `floor`, so the result takes the divisor's sign, like `fract`. JavaScript gives −0.3: division truncates toward 0, so the result takes the dividend's sign. Logic ported from JavaScript that still expects a negative result goes wrong as soon as UVs turn negative, for example after centering on the origin.",
    },
  },
  {
    id: "smoothstep-reversed-edges",
    q: {
      vi: "Muốn gradient đi từ 1 xuống 0, bạn viết `smoothstep(0.8, 0.2, x)`. Sai ở đâu, và viết đúng thế nào?",
      en: "To get a gradient from 1 down to 0, you write `smoothstep(0.8, 0.2, x)`. What is wrong, and how should it be written?",
    },
    a: {
      vi: "Spec yêu cầu `edge0 < edge1`; đảo hai edge thì kết quả không xác định — đừng dựa vào nó. Đảo ở output: `1.0 - smoothstep(0.2, 0.8, x)`.",
      en: "The spec requires `edge0 < edge1`; with the edges swapped the result is undefined — do not rely on it. Invert the output instead: `1.0 - smoothstep(0.2, 0.8, x)`.",
    },
  },
];
