import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "reynolds-1987-boids-paper",
    type: "paper",
    title: "Flocks, Herds, and Schools: A Distributed Behavioral Model",
    authors: ["Craig W. Reynolds"],
    year: 1987,
    url: "https://www.red3d.com/cwr/papers/1987/boids.html",
    note: {
      vi: "Bài báo SIGGRAPH '87 gốc định nghĩa ba quy tắc separation/alignment/cohesion — nguồn nguyên bản cho toàn bộ lý thuyết bài này.",
      en: "The original SIGGRAPH '87 paper defining separation/alignment/cohesion — the primary source behind this lesson's entire theory section.",
    },
  },
  {
    id: "reynolds-boids-background",
    type: "article",
    title: "Boids: Background and Update",
    authors: ["Craig W. Reynolds"],
    url: "https://www.red3d.com/cwr/boids/",
    note: {
      vi: "Trang tổng hợp của chính Reynolds về lịch sử, ứng dụng (phim, game) và các bản cập nhật mô hình boids sau 1987.",
      en: "Reynolds's own hub page covering the model's history, applications (film, games) and updates made to the boids model since 1987.",
    },
  },
  {
    id: "threejs-webgl-gpgpu-birds",
    type: "repo",
    title: "three.js example — webgl_gpgpu_birds",
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/webgl_gpgpu_birds.html",
    note: {
      vi: "Ví dụ chính thức của three.js: boids chạy full O(N²) trên GPUComputationRenderer ở quy mô nhỏ — cùng kỹ thuật, cùng giới hạn mà demo bài này minh hoạ.",
      en: "Three.js's official example: boids running a full O(N^2) scan on GPUComputationRenderer at modest scale — the same technique and the same limit this lesson's demo illustrates.",
    },
  },
];
