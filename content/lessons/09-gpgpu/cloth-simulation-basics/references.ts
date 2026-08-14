import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "jakobsen-advanced-character-physics",
    type: "paper",
    title: "Advanced Character Physics",
    authors: ["Thomas Jakobsen"],
    year: 2001,
    url: "https://www.cs.cmu.edu/afs/cs/academic/class/15462-s13/www/lec_slides/Jakobsen.pdf",
    note: {
      vi: "Bài báo GDC 2001 gốc đưa Verlet integration + constraint relaxation vào mô phỏng vải/nhân vật thời gian thực — nguồn của công thức Verlet và tư duy \"vận tốc ngầm\" dùng xuyên suốt bài này.",
      en: "The original GDC 2001 paper bringing Verlet integration + constraint relaxation into real-time cloth/character simulation — the source of the Verlet formula and the \"implicit velocity\" framing used throughout this lesson.",
    },
  },
  {
    id: "threejs-gpucomputationrenderer-source",
    type: "repo",
    title: "three.js — GPUComputationRenderer.js (examples/jsm/misc)",
    authors: ["three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/jsm/misc/GPUComputationRenderer.js",
    note: {
      vi: "Mã nguồn chính thức xác nhận chi tiết dễ nhầm nhất của bài: dependency tự tham chiếu KHÔNG được tự động khai báo/gán uniform, khác với dependency tên khác — đọc trực tiếp phần addVariable/init/compute để kiểm chứng.",
      en: "The authoritative source confirming this lesson's easiest-to-miss detail: a self-referencing dependency is NOT auto-declared/auto-assigned, unlike a differently-named one — read the addVariable/init/compute methods directly to verify it.",
    },
  },
  {
    id: "muller-position-based-dynamics",
    type: "paper",
    title: "Position Based Dynamics",
    authors: ["Matthias Müller", "Bruno Heidelberger", "Marcus Hennix", "John Ratcliff"],
    year: 2007,
    url: "https://matthias-research.github.io/pages/publications/posBasedDyn.pdf",
    note: {
      vi: "Hướng phát triển trực tiếp từ Verlet + constraint relaxation của bài này — giải thích rõ vì sao Jacobi-style (song song hoá được) đánh đổi tốc độ hội tụ lấy khả năng chạy trên GPU, và cách tăng \"stiffness\" bằng nhiều vòng lặp thay vì tăng hệ số lò xo.",
      en: "The direct successor to this lesson's Verlet + constraint relaxation approach — clearly explains why Jacobi-style solving (parallelizable) trades convergence speed for GPU-friendliness, and why stiffness comes from more iterations rather than a stiffer spring constant.",
    },
  },
  {
    id: "threejs-gpgpu-birds-example",
    type: "article",
    title: "three.js example — webgl_gpgpu_birds",
    authors: ["three.js contributors"],
    url: "https://threejs.org/examples/webgl_gpgpu_birds.html",
    note: {
      vi: "Ví dụ chính thức dùng đúng khuôn mẫu hai-variable phụ thuộc lẫn nhau (position/velocity) của GPUComputationRenderer mà bài này áp dụng cho position/positionPrev — đối chiếu cách wiring dependency thực tế.",
      en: "The official example using the exact same two-mutually-dependent-variable pattern (position/velocity) that this lesson applies to position/positionPrev — a real reference for how the dependency wiring plays out in practice.",
    },
  },
];
