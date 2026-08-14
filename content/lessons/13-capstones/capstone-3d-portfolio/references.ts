import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "nextjs-docs-lazy-loading",
    type: "article",
    title: "Next.js Docs — How to Lazy Load Client Components and Libraries",
    authors: ["Vercel"],
    url: "https://nextjs.org/docs/app/guides/lazy-loading",
    note: {
      vi: "Nguồn xác nhận trực tiếp cho boundary `next/dynamic({ ssr: false })` của hero island: chỉ hợp lệ khi gọi từ file `\"use client\"` — đúng cấu trúc `hero-island.tsx` của capstone này (đối chiếu với node_modules/next/dist/docs bản cài đặt thật).",
      en: "The direct source confirming the hero island's `next/dynamic({ ssr: false })` boundary: only valid when called from a `\"use client\"` file — exactly this capstone's `hero-island.tsx` structure (cross-checked against the installed node_modules/next/dist/docs).",
    },
  },
  {
    id: "web-dev-lcp",
    type: "article",
    title: "web.dev — Largest Contentful Paint (LCP)",
    authors: ["web.dev / Google Chrome team"],
    url: "https://web.dev/articles/lcp",
    note: {
      vi: "Định nghĩa chuẩn của LCP và ngưỡng \"tốt\" (≤2.5s) — cơ sở cho Tiêu chí hoàn thành của capstone này và lý do hero phải giữ chỗ layout thay vì chặn nội dung text render trước.",
      en: "The canonical definition of LCP and the 'good' threshold (≤2.5s) — the basis for this capstone's Definition of Done and the reason the hero must reserve layout space instead of blocking text content from rendering first.",
    },
  },
  {
    id: "web-dev-tbt",
    type: "article",
    title: "web.dev — Total Blocking Time (TBT)",
    authors: ["web.dev / Google Chrome team"],
    url: "https://web.dev/articles/tbt",
    note: {
      vi: "Định nghĩa TBT — thời gian main thread bị chặn giữa FCP và interactive — nguồn cho phần giải thích vì sao evaluate/parse của `three` trên main thread đe doạ chỉ số này nếu không tách chunk đúng.",
      en: "The definition of TBT — main-thread blocking time between FCP and interactive — the source for this capstone's explanation of why evaluating/parsing `three` on the main thread threatens this metric unless the chunk is split correctly.",
    },
  },
  {
    id: "chrome-lighthouse-performance-scoring",
    type: "article",
    title: "Lighthouse Performance Scoring — Chrome for Developers",
    authors: ["Chrome DevTools team"],
    url: "https://developer.chrome.com/docs/lighthouse/performance/performance-scoring",
    note: {
      vi: "Tài liệu chính thức về cách điểm Performance được tính từ trọng số các metric — cơ sở cho yêu cầu \"ghi rõ phương pháp đo\" (preset/throttle/version) thay vì chỉ báo một con số trần trụi.",
      en: "The official documentation for how the Performance score is weighted from its component metrics — the basis for this capstone's requirement to document the measurement method (preset/throttle/version) rather than reporting a bare number.",
    },
  },
  {
    id: "r3f-scaling-performance",
    type: "article",
    title: "React Three Fiber — Scaling Performance",
    url: "https://r3f.docs.pmnd.rs/advanced/scaling-performance",
    note: {
      vi: "Hướng dẫn chính thức của R3F về demand-frameloop và các đòn bẩy hiệu năng khác — cơ sở cho việc hero scene tái sử dụng đúng `frameloop=\"demand\"` + `useVisibleFrameloop` thay vì tự phát minh cơ chế mới.",
      en: "R3F's official guide to demand-frameloop and other performance levers — the basis for the hero scene reusing `frameloop=\"demand\"` + `useVisibleFrameloop` instead of inventing a new mechanism.",
    },
  },
];
