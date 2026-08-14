import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iquilezles-sdf-repetition",
    type: "article",
    title: "Repetition — Distance Functions",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/sdfrepetition/",
    note: {
      vi: "Nguồn gốc của cả hai công thức trong bài — mod-based infinite repetition (opRep) và round+clamp finite repetition (opRepLim) — kèm chứng minh trực quan vì sao clamp cần áp lên round(p/c) chứ không phải lên q.",
      en: "The source of both formulas in this lesson — mod-based infinite repetition (opRep) and round+clamp finite repetition (opRepLim) — with a visual proof of why the clamp belongs on round(p/c), not on q.",
    },
  },
  {
    id: "iquilezles-distfunctions",
    type: "article",
    title: "3D Signed Distance Functions",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/distfunctions/",
    note: {
      vi: "Bộ sưu tập công thức SDF primitives (round box, sphere, torus...) và boolean ops dùng làm object lặp trong bài — tra cứu nhanh khi cần một hình dạng khác ngoài round box.",
      en: "The primitive SDF formula collection (round box, sphere, torus...) and boolean ops used as the repeated object in this lesson — a quick lookup when a shape other than a round box is needed.",
    },
  },
  {
    id: "book-of-shaders-patterns",
    type: "article",
    title: "The Book of Shaders — Chapter 9: Patterns",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/09/",
    note: {
      vi: "Bản 2D của chính ý tưởng lặp không gian này — fract/floor tiling trên uv — hữu ích để thấy domain repetition 3D chỉ là bản mở rộng thêm một trục của một kỹ thuật đã học từ Track 2.",
      en: "The 2D version of this exact repeating-space idea — fract/floor tiling on uv — useful for seeing that 3D domain repetition is just a one-axis extension of a technique already covered back in Track 2.",
    },
  },
];
