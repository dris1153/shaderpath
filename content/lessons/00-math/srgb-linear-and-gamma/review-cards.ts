import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "data-texture-tagged-srgb",
    q: {
      vi: "Normal map bị đánh dấu nhầm là sRGB. Vì sao shading sai, dù normal map đâu phải là màu?",
      en: "A normal map is wrongly tagged as sRGB. Why does the shading go wrong, when a normal map is not a color at all?",
    },
    a: {
      vi: "GPU giải mã nó qua đường cong gamma như với màu: kênh X, Y bằng 0.5 — tức không nghiêng — thành khoảng 0.21, nên mọi pháp tuyến bị bẻ lệch. Texture dữ liệu (normal, roughness) lưu con số chứ không lưu ánh sáng, phải để linear.",
      en: "The GPU decodes it through the gamma curve as if it were a color: an X or Y channel of 0.5 — meaning no tilt — becomes about 0.21, so every normal is bent. Data textures (normal, roughness) store numbers, not light, and must stay linear.",
    },
  },
  {
    id: "double-encode",
    q: {
      vi: "Shader đã tự `pow(color, 1.0 / 2.2)` ở cuối, trong khi renderer cũng đang xuất sRGB. Ảnh trông thế nào, và vì sao?",
      en: "The shader already applies `pow(color, 1.0 / 2.2)` at the end, and the renderer outputs sRGB as well. What does the image look like, and why?",
    },
    a: {
      vi: "Sáng bệch và nhạt màu: màu bị encode hai lần, mỗi lần lại kéo vùng tối sáng lên. Bỏ một trong hai — thường là bỏ dòng `pow`, để renderer encode đúng một lần ở cuối.",
      en: "Washed out and too bright: the color is encoded twice, and each pass lifts the darks again. Drop one of them — usually the `pow` line, so the renderer encodes exactly once at the end.",
    },
  },
  {
    id: "why-not-store-linear",
    q: {
      vi: "Nếu ảnh 8-bit lưu thẳng năng lượng ánh sáng (linear), vùng nào sẽ lộ các bậc màu trước, và vì sao sRGB tránh được?",
      en: "If an 8-bit image stored light energy directly (linear), which tones would show visible steps first, and how does sRGB avoid it?",
    },
    a: {
      vi: "Vùng tối. Mắt phân biệt chênh lệch nhỏ ở vùng tối rõ hơn nhiều so với vùng sáng, mà lưu linear thì 256 mức chia đều theo năng lượng — vùng tối có quá ít mức nên thấy từng bậc. sRGB dành nhiều mã hơn cho vùng tối và ít hơn cho vùng sáng.",
      en: "The darks. The eye tells small differences apart far better in dark tones than in bright ones, while linear storage spreads its 256 levels evenly by energy — the darks get too few levels and the steps show. sRGB spends more codes on the darks and fewer on the brights.",
    },
  },
];
