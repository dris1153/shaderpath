import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-noise",
    type: "article",
    title: "The Book of Shaders — Chapter 11: Noise",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/11/",
    note: {
      vi: "Giới thiệu ý tưởng thêm một chiều làm trục thời gian cho noise (z hoặc w) thay vì dịch chuyển toạ độ 2D — nền tảng cho cả slice lẫn loop trong bài này.",
      en: "Introduces the idea of adding an extra dimension as noise's time axis (z or w) instead of translating 2D coordinates — the foundation for both this lesson's slice and loop modes.",
    },
  },
  {
    id: "procedural-generation-looping-noise",
    type: "article",
    title: "Looping with Noise (This Is a Trick I've Known For...)",
    url: "https://procedural-generation.isaackarth.com/2018/01/12/looping-with-noise-this-is-a-trick-ive-known-for.html",
    note: {
      vi: "Nguồn gốc kỹ thuật vòng lặp hoàn hảo bằng cách sample noise trên một đường tròn ở chiều cao hơn số chiều đầu ra — đúng công thức 4D dùng trong bài (2 chiều screen + 2 chiều $R\\cos\\omega t, R\\sin\\omega t$).",
      en: "The source of the perfect-loop technique: sampling noise on a circle in a dimension higher than the output — exactly the 4D formula this lesson uses (2 screen dims + 2 dims of $R\\cos\\omega t, R\\sin\\omega t$).",
    },
  },
  {
    id: "webgl-fundamentals-precision",
    type: "article",
    title: "WebGL Fundamentals — WebGL Precision Issues",
    authors: ["Gregg Tavares"],
    url: "https://webglfundamentals.org/webgl/lessons/webgl-precision-issues.html",
    note: {
      vi: "Giải thích vì sao float 32-bit mất độ chính xác khi giá trị (như uTime chạy hàng giờ) lớn dần — cơ sở cho phần bàn về recenter/mod thời gian ở cuối bài.",
      en: "Explains why 32-bit floats lose precision as a value (like an uTime running for hours) grows — the basis for this lesson's closing discussion on recentering/mod-wrapping time.",
    },
  },
];
