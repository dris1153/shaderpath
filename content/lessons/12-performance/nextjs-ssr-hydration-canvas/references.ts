import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "nextjs-docs-lazy-loading",
    type: "article",
    title: "Next.js Docs — How to Lazy Load Client Components and Libraries",
    authors: ["Vercel"],
    url: "https://nextjs.org/docs/app/guides/lazy-loading",
    note: {
      vi: "Nguồn xác nhận trực tiếp: Client Component vẫn được prerender mặc định, và 'ssr: false is not supported in Server Components' — cơ sở cho toàn bộ phần next/dynamic của bài này (đối chiếu với node_modules/next/dist/docs bản cài đặt thật).",
      en: "The direct source confirming Client Components are still prerendered by default, and that 'ssr: false is not supported in Server Components' — the basis for this lesson's entire next/dynamic section (cross-checked against the installed node_modules/next/dist/docs).",
    },
  },
  {
    id: "nextjs-docs-preventing-flash-hydration",
    type: "article",
    title: "Next.js Docs — How to Prevent Flash Before Hydration",
    authors: ["Vercel"],
    url: "https://nextjs.org/docs/app/guides/preventing-flash-before-hydration",
    note: {
      vi: "Giải thích chính thức về suppressHydrationWarning — khi nào nó hợp lý (bạn tự đặt giá trị đúng vào DOM bằng cách khác) và khi nào là che giấu lỗi — nguồn cho phần hydration-safe pattern của bài này.",
      en: "The official explanation of suppressHydrationWarning — when it's legitimate (you deliberately put the correct value into the DOM some other way) versus when it papers over a bug — the source for this lesson's hydration-safe pattern section.",
    },
  },
  {
    id: "nextjs-docs-package-bundling",
    type: "article",
    title: "Next.js Docs — Optimizing Package Bundling",
    authors: ["Vercel"],
    url: "https://nextjs.org/docs/app/guides/package-bundling",
    note: {
      vi: "Tài liệu cho `next experimental-analyze` (Turbopack Bundle Analyzer, mới ở Next 16.1) — công cụ đo thật số KB của three/drei trong chunk demo thay vì đoán.",
      en: "The documentation for `next experimental-analyze` (the Turbopack Bundle Analyzer, new in Next 16.1) — the tool for actually measuring three/drei's KB footprint in the demo chunk instead of guessing.",
    },
  },
  {
    id: "web-dev-cls",
    type: "article",
    title: "web.dev — Cumulative Layout Shift (CLS)",
    authors: ["web.dev / Google Chrome team"],
    url: "https://web.dev/articles/cls",
    note: {
      vi: "Định nghĩa chuẩn của layout shift và vì sao reserve không gian trước khi nội dung tải xong (đúng kỹ thuật aspect-ratio/Skeleton của bài này) là cách khắc phục được khuyến nghị chính thức.",
      en: "The canonical definition of layout shift and why reserving space before content loads (exactly this lesson's aspect-ratio/Skeleton technique) is the officially recommended fix.",
    },
  },
];
