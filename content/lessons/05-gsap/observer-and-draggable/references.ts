import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-observer-docs",
    type: "article",
    title: "GSAP Docs — Observer",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/Plugins/Observer/",
    note: {
      vi: "Tài liệu API đầy đủ của Observer: type, target, onUp/onDown, tolerance và preventDefault — nguồn tra cứu chính cho pattern đổi section trong bài này.",
      en: "The full Observer API reference: type, target, onUp/onDown, tolerance and preventDefault — the primary lookup for this lesson's section-swap pattern.",
    },
  },
  {
    id: "gsap-draggable-docs",
    type: "article",
    title: "GSAP Docs — Draggable",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/Plugins/Draggable/",
    note: {
      vi: "Tài liệu Draggable, bao gồm type, bounds, snap và cách kết hợp với inertia — bổ sung chi tiết ngoài phạm vi demo của bài.",
      en: "The Draggable docs, including type, bounds, snap and how it combines with inertia — extra detail beyond this lesson's demo scope.",
    },
  },
  {
    id: "gsap-inertia-plugin-docs",
    type: "article",
    title: "GSAP Docs — InertiaPlugin",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/Plugins/InertiaPlugin/",
    note: {
      vi: "Giải thích cách InertiaPlugin ước lượng vận tốc từ một cửa sổ mẫu vị trí gần nhất — cơ chế đứng sau lý do Draggable throw mượt hơn code tự viết.",
      en: "Explains how InertiaPlugin estimates velocity from a recent window of position samples — the mechanism behind why Draggable's throw feels smoother than hand-rolled code.",
    },
  },
  {
    id: "mdn-touch-action",
    type: "spec",
    title: "MDN — touch-action",
    authors: ["MDN Web Docs"],
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action",
    note: {
      vi: "Tài liệu chuẩn về CSS touch-action — nguồn chính xác cho lý do vì sao thiếu touch-action: none làm Draggable bị trễ trên thiết bị cảm ứng thật.",
      en: "The standard reference for the CSS touch-action property — the authoritative source for why missing touch-action: none delays Draggable on real touch devices.",
    },
  },
];
