import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-docs-to",
    type: "article",
    title: "gsap.to()",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/GSAP/gsap.to()/",
    note: {
      vi: "Tài liệu chính thức cho vars object của tween — danh sách đầy đủ property đặc biệt (duration, delay, ease, stagger, callback...) khác với property CSS cần animate.",
      en: "The official reference for a tween's vars object — the full list of special properties (duration, delay, ease, stagger, callbacks...) as distinct from the CSS properties being animated.",
    },
  },
  {
    id: "gsap-docs-position-parameter",
    type: "article",
    title: "The Position Parameter",
    authors: ["GreenSock"],
    url: "https://gsap.com/resources/position-parameter/",
    note: {
      vi: "Giải thích đầy đủ cú pháp position parameter (số tuyệt đối, \"<\"/\">\", \"+=\"/\"-=\", label) dùng trong bài này để so sánh với cách cộng dồn delay thủ công.",
      en: "The full breakdown of position parameter syntax (absolute numbers, \"<\"/\">\", \"+=\"/\"-=\", labels) that this lesson contrasts against manually stacked delays.",
    },
  },
  {
    id: "gsap-docs-staggers",
    type: "article",
    title: "Staggers",
    authors: ["GreenSock"],
    url: "https://gsap.com/resources/getting-started/Staggers/",
    note: {
      vi: "Nguồn chính thức cho cả ba dạng stagger (số, object với each/from/grid, hàm) — bài này dùng lại đúng ví dụ from: \"center\" và dạng hàm từ trang này.",
      en: "The official source for all three stagger forms (number, object with each/from/grid, function) — this lesson reuses the same from: \"center\" and function-form examples shown there.",
    },
  },
];
