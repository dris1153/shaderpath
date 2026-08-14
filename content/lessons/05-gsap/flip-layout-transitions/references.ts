import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-flip-docs",
    type: "article",
    title: "GSAP Docs — Flip Plugin",
    authors: ["GSAP (Webflow)"],
    url: "https://gsap.com/docs/v3/Plugins/Flip/",
    note: {
      vi: "Tài liệu chính thức: chữ ký đầy đủ của getState/from/to, ý nghĩa data-flip-id, absolute, nested, scale — tra cứu khi bài này chưa đủ chi tiết cho một trường hợp cụ thể.",
      en: "The official reference: the full signatures of getState/from/to, and what data-flip-id, absolute, nested and scale actually do — the place to check when this lesson isn't detailed enough for a specific case.",
    },
  },
  {
    id: "aerotwist-flip-your-animations",
    type: "article",
    title: "FLIP Your Animations",
    authors: ["Paul Lewis"],
    url: "https://aerotwist.com/blog/flip-your-animations/",
    note: {
      vi: "Bài viết gốc đặt ra kỹ thuật và cái tên FLIP (trước khi GSAP đóng gói thành plugin) — đọc để hiểu ý tưởng thuần tuý, không phụ thuộc API của một thư viện cụ thể nào.",
      en: "The original article that coined the FLIP technique and its name (before GSAP packaged it into a plugin) — read it to see the pure idea, independent of any one library's API.",
    },
  },
  {
    id: "webdev-animations-guide",
    type: "article",
    title: "web.dev — Animations Guide",
    authors: ["web.dev"],
    url: "https://web.dev/articles/animations-guide",
    note: {
      vi: "Giải thích vì sao chỉ transform và opacity chạy được trên compositor thread — lý do sâu xa khiến bước Play của Flip luôn rẻ, sẽ khai triển đầy đủ ở bài Animation thân thiện compositor.",
      en: "Explains why only transform and opacity can run on the compositor thread — the underlying reason Flip's Play step is always cheap, expanded fully in the Compositor-Friendly Animation lesson.",
    },
  },
];
