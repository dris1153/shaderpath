import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-docs",
    type: "article",
    title: "GSAP Documentation",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/",
    note: {
      vi: "Tài liệu chính thức của GSAP — tra cứu API timeline/tween/plugin đầy đủ khi bài này chỉ nói ở mức quyết định chọn công cụ, không đi sâu API.",
      en: "GSAP's official docs — the full timeline/tween/plugin API reference for when this lesson's tool-choice framing isn't enough detail.",
    },
  },
  {
    id: "motion-react-docs",
    type: "article",
    title: "Motion for React — Get Started",
    authors: ["Motion"],
    url: "https://motion.dev/docs/react",
    note: {
      vi: "Tài liệu chính thức của Motion (tên mới của Framer Motion từ 2025) — nguồn cho các claim về `layout`, `whileHover/whileTap`, và `AnimatePresence` nhắc trong bài.",
      en: "Motion's official docs (Framer Motion's new name since 2025) — the source for this lesson's claims about `layout`, `whileHover/whileTap`, and `AnimatePresence`.",
    },
  },
  {
    id: "motion-gsap-comparison",
    type: "article",
    title: "GSAP vs Motion: A Detailed Comparison",
    authors: ["Motion"],
    url: "https://motion.dev/docs/gsap-vs-motion",
    note: {
      vi: "So sánh trực tiếp hai thư viện — lưu ý đây là trang do đội Motion viết nên có thiên hướng nghiêng về Motion; bài học này chỉ mượn số liệu bundle size, tự đối chiếu phần nhận định.",
      en: "A direct library comparison — note this page is written by the Motion team, so it leans favorably toward Motion; this lesson only borrows the bundle-size numbers, not the framing.",
    },
  },
  {
    id: "bundlephobia-gsap",
    type: "article",
    title: "gsap — Bundlephobia",
    url: "https://bundlephobia.com/package/gsap",
    note: {
      vi: "Số đo kích thước gói thực tế (minified+gzip) của GSAP — nguồn cho số liệu ~23.5kB trong trục 'bundle' của bài, kiểm tra lại được bất cứ lúc nào vì số liệu đổi theo phiên bản.",
      en: "Real measured package size (minified+gzip) for GSAP — the source for the ~23.5kB figure in this lesson's 'bundle' axis; re-checkable any time since the number shifts across versions.",
    },
  },
  {
    id: "mdn-web-animations-api",
    type: "article",
    title: "Web Animations API",
    authors: ["MDN Web Docs"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API",
    note: {
      vi: "API trình duyệt gốc mà cả GSAP lẫn Motion (ở chế độ hybrid) dựa vào phía dưới — hữu ích để hiểu vì sao 'chạy trên compositor' không phải phép màu của riêng một thư viện nào.",
      en: "The native browser API both GSAP and Motion (in hybrid mode) sit on top of — useful for understanding why 'runs on the compositor' isn't magic unique to any one library.",
    },
  },
];
