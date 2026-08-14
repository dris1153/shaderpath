import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "react-docs-suspense",
    type: "article",
    title: "<Suspense> – React Reference",
    authors: ["React"],
    url: "https://react.dev/reference/react/Suspense",
    note: {
      vi: "Tài liệu chính thức về hợp đồng throw-a-promise của Suspense — cơ chế tổng quát mà useLoader/useGLTF chỉ là một cách áp dụng cụ thể.",
      en: "The official docs for Suspense's throw-a-promise contract — the general mechanism that useLoader/useGLTF are just one specific application of.",
    },
  },
  {
    id: "r3f-docs-loading-models",
    type: "article",
    title: "Loading Models",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/tutorials/loading-models",
    note: {
      vi: "Hướng dẫn chính thức của R3F về useGLTF, Suspense fallback và preload — nguồn cho pattern gallery/exhibit trong bài và checkpoint theo sau.",
      en: "R3F's official guide to useGLTF, Suspense fallbacks and preloading — the source for this lesson's and the following checkpoint's gallery/exhibit pattern.",
    },
  },
  {
    id: "r3f-docs-hooks",
    type: "article",
    title: "Hooks — React Three Fiber",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/hooks",
    note: {
      vi: "Tham chiếu API đầy đủ của useLoader, bao gồm cơ chế cache theo [loader, url] mà bài này giải thích chi tiết cho phần preload.",
      en: "The full useLoader API reference, including the [loader, url] cache-keying mechanism this lesson breaks down for the preloading section.",
    },
  },
  {
    id: "react-docs-starttransition",
    type: "article",
    title: "startTransition – React Reference",
    authors: ["React"],
    url: "https://react.dev/reference/react/startTransition",
    note: {
      vi: "Tài liệu chính thức về startTransition và cách nó phối hợp với Suspense để tránh chớp fallback khi đổi giữa hai state đã sẵn sàng.",
      en: "The official docs for startTransition and how it coordinates with Suspense to avoid a fallback flash when swapping between two already-ready states.",
    },
  },
];
