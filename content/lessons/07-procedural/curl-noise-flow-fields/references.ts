import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "bridson-2007-curl-noise",
    type: "paper",
    title: "Curl-Noise for Procedural Fluid Flow",
    authors: ["Robert Bridson", "Jim Hourihan", "Marcus Nordenstam"],
    year: 2007,
    url: "https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph2007-curlnoise.pdf",
    note: {
      vi: "Bài báo SIGGRAPH 2007 đặt tên kỹ thuật này — chứng minh đầy đủ phân kỳ triệt tiêu cho cả 2D lẫn 3D và bàn về điều chế biên độ gần vật cản, phần bài học chỉ tóm tắt một đoạn.",
      en: "The SIGGRAPH 2007 paper that named this technique — the full divergence-free proof for both 2D and 3D, plus the near-obstacle amplitude modulation this lesson only summarizes in one paragraph.",
    },
  },
  {
    id: "iq-morenoise",
    type: "article",
    title: "Noise Derivatives (\"morenoise\")",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/morenoise/",
    note: {
      vi: "Cách tính đạo hàm noise bằng công thức giải tích thay vì sai phân trung tâm — nhanh và chính xác hơn hẳn kỹ thuật epsilon của bài này, đáng đọc khi cần curl noise chạy production.",
      en: "How to compute noise derivatives analytically instead of via central differences — faster and more accurate than this lesson's epsilon-based technique, worth reading once curl noise needs to run in production.",
    },
  },
  {
    id: "lamar-curl-divergence",
    type: "article",
    title: "Calculus III — Curl and Divergence",
    authors: ["Paul Dawkins"],
    url: "https://tutorial.math.lamar.edu/Classes/CalcIII/CurlDivergence.aspx",
    note: {
      vi: "Định nghĩa toán chuẩn của curl và divergence với ví dụ tính tay từng bước — tra cứu khi công thức KaTeX của bài này cần thêm nền tảng giải tích vector.",
      en: "The standard math definitions of curl and divergence with step-by-step worked examples — the reference to reach for when this lesson's KaTeX formulas need more vector-calculus grounding.",
    },
  },
];
