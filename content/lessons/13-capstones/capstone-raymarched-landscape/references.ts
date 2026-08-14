import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "hart-1996-sphere-tracing",
    type: "paper",
    title: "Sphere Tracing: A Geometric Method for the Antialiased Ray Tracing of Implicit Surfaces",
    authors: ["John C. Hart"],
    year: 1996,
    url: "https://doi.org/10.1007/s003710050084",
    note: {
      vi: "Bài báo gốc đặt tên và chứng minh kỹ thuật march theo |f(p)| — nền tảng lý thuyết đứng sau mọi vòng lặp raymarch của dự án này, kể cả biến thể terrain-marching không có SDF thật.",
      en: "The original paper naming and proving the |f(p)|-step march technique — the theoretical foundation behind every march loop in this project, including the terrain-marching variant that has no true SDF.",
    },
  },
  {
    id: "iquilezles-terrainmarching",
    type: "article",
    title: "Raymarching Terrains",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/terrainmarching/",
    note: {
      vi: "Nguồn trực tiếp cho kỹ thuật march heightfield (bước tăng dần rồi nhị phân tinh chỉnh) dùng ở mốc 2 — khác hẳn sphere tracing vì terrain không có SDF thật.",
      en: "The direct source for the heightfield march technique (growing steps then bisection refine) used in milestone 2 — distinct from sphere tracing since terrain has no true SDF.",
    },
  },
  {
    id: "iq-better-fog",
    type: "article",
    title: "Better Fog",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/fog/",
    note: {
      vi: "Nguồn cho công thức height fog hàm mũ và cách trộn màu fog theo góc nhìn-mặt trời dùng ở mốc 3.",
      en: "The source for the exponential height-fog formula and view-sun angle color blending used in milestone 3.",
    },
  },
  {
    id: "drei-performance-monitor-docs",
    type: "article",
    title: "PerformanceMonitor — @react-three/drei documentation",
    authors: ["Poimandres (pmndrs)"],
    url: "https://drei.docs.pmnd.rs/performances/performance-monitor",
    note: {
      vi: "Tài liệu chính thức của component watchdog production-ready (bounds/flipflops/onIncline/onDecline) — dự án tự viết watchdog thủ công để thấy rõ cơ chế hysteresis, nhưng đây là lựa chọn thay thế hợp lý trong một dự án thật.",
      en: "The official docs for the production-ready watchdog component (bounds/flipflops/onIncline/onDecline) — this project hand-rolls its own watchdog to make the hysteresis mechanism visible, but this is the reasonable substitute in a real project.",
    },
  },
];
