import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "mdn-navigator-devicememory",
    type: "article",
    title: "Navigator: deviceMemory property — MDN Web Docs",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory",
    note: {
      vi: "Nguồn cho quy tắc làm tròn luỹ thừa của 2 và giới hạn Chromium-only được trích trong phần heuristics của bài.",
      en: "The source for the power-of-two rounding rule and the Chromium-only limitation cited in this lesson's heuristics section.",
    },
  },
  {
    id: "mdn-navigator-hardwareconcurrency",
    type: "article",
    title: "Navigator: hardwareConcurrency property — MDN Web Docs",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency",
    note: {
      vi: "Xác nhận API này có hỗ trợ trình duyệt rộng hơn deviceMemory, và vì sao số lõi logic không phải thước đo hiệu năng trực tiếp.",
      en: "Confirms this API has broader browser support than deviceMemory, and why a logical core count isn't a direct performance measure.",
    },
  },
  {
    id: "mdn-webgl-debug-renderer-info",
    type: "article",
    title: "WEBGL_debug_renderer_info — MDN Web Docs",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info",
    note: {
      vi: "Nguồn cho việc chuỗi GPU bị giảm chi tiết vì lý do fingerprinting và bị tắt hẳn khi bật resistFingerprinting trên Firefox.",
      en: "The source confirming the GPU string is reduced in detail for fingerprinting reasons and disabled outright with resistFingerprinting on Firefox.",
    },
  },
  {
    id: "drei-performance-monitor-docs",
    type: "article",
    title: "PerformanceMonitor — @react-three/drei documentation",
    authors: ["Poimandres (pmndrs)"],
    url: "https://drei.docs.pmnd.rs/performances/performance-monitor",
    note: {
      vi: "Tài liệu chính thức của component PerformanceMonitor được bài này trích dẫn — bounds/flipflops/onIncline/onDecline là API thật, không phải mô tả suông.",
      en: "The official documentation for the PerformanceMonitor component this lesson cites — bounds/flipflops/onIncline/onDecline are the real API, not a paraphrase.",
    },
  },
];
