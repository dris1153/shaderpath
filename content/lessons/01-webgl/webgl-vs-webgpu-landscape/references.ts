import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-history-of-opengl",
    type: "article",
    title: "History of OpenGL",
    authors: ["Khronos Group"],
    url: "https://www.khronos.org/opengl/wiki/History_of_OpenGL",
    note: {
      vi: "Nguồn gốc trực tiếp từ Khronos: OpenGL 1.0 năm 1992 và OpenGL ES tách nhánh năm 2003 — hai mốc mở đầu dòng thời gian của bài này.",
      en: "The primary Khronos source: OpenGL 1.0 in 1992 and the 2003 OpenGL ES split — the two opening dates of this lesson's timeline.",
    },
  },
  {
    id: "khronos-webgl2-arrives",
    type: "article",
    title: "WebGL 2.0 Arrives",
    authors: ["Khronos Group"],
    url: "https://www.khronos.org/blog/webgl-2.0-arrives",
    note: {
      vi: "Thông báo chính thức của Khronos khi WebGL2 ra mắt tháng 1/2017, liệt kê đúng các tính năng OpenGL ES 3.0 mà bài này gọi tên: VAO, instancing, transform feedback, MRT.",
      en: "Khronos's own announcement when WebGL2 shipped in January 2017, listing the exact OpenGL ES 3.0 features this lesson names: VAOs, instancing, transform feedback, MRT.",
    },
  },
  {
    id: "w3c-webgpu-spec",
    type: "spec",
    title: "WebGPU",
    authors: ["W3C GPU for the Web Community Group"],
    url: "https://www.w3.org/TR/webgpu/",
    note: {
      vi: "Đặc tả chính thức của WebGPU — nguồn chuẩn cho GPURenderPipeline, GPUBindGroup và GPUCommandEncoder, không phải bài diễn giải lại.",
      en: "The official WebGPU specification — the authoritative source for GPURenderPipeline, GPUBindGroup and GPUCommandEncoder, not a paraphrase.",
    },
  },
  {
    id: "webdev-webgpu-major-browsers",
    type: "article",
    title: "WebGPU is now supported in major browsers",
    authors: ["web.dev"],
    url: "https://web.dev/blog/webgpu-supported-major-browsers",
    note: {
      vi: "Cập nhật của Google về tình trạng WebGPU trên các trình duyệt lớn — dùng để kiểm chứng lại con số hỗ trợ tại thời điểm bạn đọc, vì tình trạng này đổi nhanh.",
      en: "Google's own update on WebGPU's status across major browsers — check it to re-verify current support numbers, since this landscape shifts quickly.",
    },
  },
  {
    id: "threejs-tsl-docs",
    type: "article",
    title: "TSL — three.js docs",
    authors: ["three.js"],
    url: "https://threejs.org/docs/pages/TSL.html",
    note: {
      vi: "Tài liệu chính thức về TSL (Three.js Shading Language) — cách Three.js biên dịch một node shader ra cả GLSL (WebGL) lẫn WGSL (WebGPU) từ cùng một nguồn.",
      en: "The official TSL (Three.js Shading Language) documentation — how Three.js compiles one node shader source to both GLSL (WebGL) and WGSL (WebGPU).",
    },
  },
];
