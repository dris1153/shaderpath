import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-random",
    type: "article",
    title: "The Book of Shaders — Chapter 10: Random",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/10/",
    note: {
      vi: "Nguồn gốc của công thức fract(sin(dot(...))*43758.5453) dùng trong bài này, kèm giải thích trực quan vì sao dot + sin + fract tạo ra giá trị trông ngẫu nhiên.",
      en: "The origin of the fract(sin(dot(...))*43758.5453) formula used in this lesson, with an intuitive walkthrough of why dot + sin + fract produces something that looks random.",
    },
  },
  {
    id: "hoskins-hash-without-sine",
    type: "repo",
    title: "Hash without Sine (Shadertoy)",
    authors: ["Dave Hoskins"],
    url: "https://www.shadertoy.com/view/4djSRW",
    note: {
      vi: "Shader gốc của họ hash đa thức không dùng sin — nguồn của hash21 dùng trong demo và bài tập, kèm biến thể hash22/hash33 cho vector 2D/3D.",
      en: "The original shader for the sine-free polynomial hash family — the source of the hash21 used in this lesson's demo and exercises, plus hash22/hash33 variants for 2D/3D vectors.",
    },
  },
  {
    id: "jarzynski-olano-gpu-hashes",
    type: "paper",
    title: "Hash Functions for GPU Rendering",
    authors: ["Mark Jarzynski", "Marc Olano"],
    year: 2020,
    url: "https://www.jcgt.org/published/0009/03/02/",
    note: {
      vi: "Đánh giá định lượng chất lượng và tốc độ nhiều hash GPU phổ biến (gồm cả hash dựa trên sin) trên phần cứng thật — nguồn cho nhận định về độ tin cậy kém của sin-hash trong bài.",
      en: "A quantitative evaluation of quality and speed across popular GPU hashes (including sine-based ones) on real hardware — the source behind this lesson's claim about the sine hash's poor reliability.",
    },
  },
];
