import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "r3f-docs-objects-args",
    type: "article",
    title: "Objects, Properties and Constructor Arguments",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/objects",
    note: {
      vi: "Trang chính thức giải thích prop `args` và quy tắc auto-dispose của R3F — nguồn gốc của cơ chế args-diff và bẫy 'object mới mỗi render' bài này phân tích chi tiết.",
      en: "The official page explaining R3F's `args` prop and auto-dispose rules — the source of the args-diffing mechanism and the 'new object every render' trap this lesson breaks down in detail.",
    },
  },
  {
    id: "r3f-docs-scaling-performance",
    type: "article",
    title: "Scaling Performance",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/advanced/scaling-performance",
    note: {
      vi: "Hướng dẫn chính thức về tái sử dụng geometry/material và các kỹ thuật scale scene R3F — bối cảnh rộng hơn cho pattern hoisting module-scope của bài này.",
      en: "The official guide on reusing geometries/materials and scaling an R3F scene — the broader context for this lesson's module-scope hoisting pattern.",
    },
  },
  {
    id: "threejs-webglrenderer-info",
    type: "spec",
    title: "WebGLRenderer — .info",
    authors: ["Three.js"],
    url: "https://threejs.org/docs/#api/en/renderers/WebGLRenderer.info",
    note: {
      vi: "Tài liệu chính thức về `renderer.info` — định nghĩa chính xác `memory.geometries` và `programs`, hai con số dùng để đo sự khác biệt trong demo của bài này.",
      en: "The official docs for `renderer.info` — the precise definitions of `memory.geometries` and `programs`, the two numbers this lesson's demo uses to measure the difference.",
    },
  },
  {
    id: "react-docs-usememo",
    type: "article",
    title: "useMemo – React Reference",
    authors: ["React"],
    url: "https://react.dev/reference/react/useMemo",
    note: {
      vi: "Tài liệu chính thức của React về `useMemo` và kỷ luật dependency array — áp dụng trực tiếp cho phần object dựng thủ công (uniforms, Shape) trong bài.",
      en: "React's official docs on `useMemo` and dependency-array discipline — directly applicable to this lesson's section on hand-built objects (uniforms, Shape).",
    },
  },
];
