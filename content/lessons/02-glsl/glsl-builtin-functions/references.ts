import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-shaping-functions",
    type: "article",
    title: "The Book of Shaders — Chapter 5: Shaping Functions",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/05/",
    note: {
      vi: "Trực quan hoá đồ thị của step/smoothstep/pow và các biến thể ghép hàm — đọc kèm bài này để thấy hình dạng của từng hàm, không chỉ công thức.",
      en: "Visualizes the graph shape of step/smoothstep/pow and their combinations — read alongside this lesson to see each function's curve, not just its formula.",
    },
  },
  {
    id: "iq-functions",
    type: "article",
    title: "Some Useful Functions (pulse, impulse, cubic pulse)",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/functions/",
    note: {
      vi: "Nguồn gốc của kỹ thuật 'ghép hai smoothstep thành một pulse' dùng trong bài này, kèm nhiều biến thể nâng cao hơn (impulse, cubic pulse, almostIdentity).",
      en: "The original source for the 'chain two smoothsteps into a pulse' trick used in this lesson, plus more advanced variants (impulse, cubic pulse, almostIdentity).",
    },
  },
  {
    id: "glsl-es-3.00-spec",
    type: "spec",
    title: "The OpenGL ES Shading Language, Version 3.00 — §8.3 Common Functions",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Định nghĩa chính xác của mix/clamp/step/smoothstep/fract/mod (kể cả trường hợp biên như smoothstep khi edge0 >= edge1 là undefined) — nguồn chuẩn khi ví dụ trong bài chưa đủ rõ.",
      en: "The precise definitions of mix/clamp/step/smoothstep/fract/mod (including edge cases like smoothstep being undefined when edge0 >= edge1) — the authoritative source when this lesson's examples aren't specific enough.",
    },
  },
];
