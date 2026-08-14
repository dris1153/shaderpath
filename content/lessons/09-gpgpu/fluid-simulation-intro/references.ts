import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "stam-1999-stable-fluids",
    type: "paper",
    title: "Stable Fluids",
    authors: ["Jos Stam"],
    year: 1999,
    url: "http://www.dgp.toronto.edu/people/stam/reality/Research/pdf/ns.pdf",
    note: {
      vi: "Bài báo gốc định nghĩa vòng lặp add-force → advect → diffuse → project; nguồn của mọi demo 'fluid' GPU đang chạy trên web ngày nay, kể cả demo trong bài này.",
      en: "The original paper defining the add-force → advect → diffuse → project loop — the source behind essentially every GPU 'fluid' demo running on the web today, including this lesson's demo.",
    },
  },
  {
    id: "harris-gpu-gems-38",
    type: "article",
    title: "GPU Gems — Chapter 38: Fast Fluid Dynamics Simulation on the GPU",
    authors: ["Mark J. Harris"],
    url: "https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu",
    note: {
      vi: "Chuyển đúng thuật toán Stable Fluids của Stam thành fragment shader/FBO ping-pong — bản dịch kỹ thuật gần nhất với cách demo bài này cài đặt Jacobi pressure solve.",
      en: "Ports Stam's Stable Fluids algorithm directly to fragment shaders and FBO ping-pong — the technical translation closest to how this lesson's demo implements the Jacobi pressure solve.",
    },
  },
  {
    id: "macklin-muller-pbf-2013",
    type: "paper",
    title: "Position Based Fluids",
    authors: ["Miles Macklin", "Matthias Müller"],
    year: 2013,
    url: "http://mmacklin.com/pbf_sig_preprint.pdf",
    note: {
      vi: "Bài báo SIGGRAPH gốc định nghĩa ràng buộc mật độ giải trực tiếp trên vị trí — cùng máy Position-Based Dynamics đã dùng cho ràng buộc khoảng cách của cloth ở bài trước.",
      en: "The original SIGGRAPH paper defining the density constraint solved directly on positions — the same Position-Based Dynamics machinery the previous cloth lesson used for distance constraints.",
    },
  },
  {
    id: "dobryakov-webgl-fluid-simulation",
    type: "repo",
    title: "WebGL-Fluid-Simulation",
    authors: ["Pavel Dobryakov"],
    url: "https://github.com/PavelDoGreat/WebGL-Fluid-Simulation",
    note: {
      vi: "Kho mã nguồn của demo 'fluid' nổi tiếng nhất trên web — đọc source thật sẽ thấy chính xác các pass advect/splat/divergence/pressure/gradient-subtract mà bài này mô tả.",
      en: "The source repo behind the web's most famous 'fluid' demo — reading the real source shows exactly the advect/splat/divergence/pressure/gradient-subtract passes this lesson describes.",
    },
  },
];
