import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "webgl2fundamentals-fundamentals",
    type: "article",
    title: "WebGL2 Fundamentals",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html",
    note: {
      vi: "Giải thích WebGL như một cỗ máy rasterization thuần tuý và toàn bộ chu trình compile/link/draw — nền cho chính cấu trúc bài này.",
      en: "Frames WebGL as a pure rasterization engine and walks the full compile/link/draw cycle — the exact structure this lesson builds on.",
    },
  },
  {
    id: "mdn-compileshader",
    type: "article",
    title: "WebGLRenderingContext: compileShader() method",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/compileShader",
    note: {
      vi: "Tài liệu chuẩn của compileShader — xác nhận nó không ném exception, đúng điểm bài này nhấn mạnh ở phần error-check pattern.",
      en: "The canonical reference for compileShader — confirms it never throws, exactly the point this lesson's error-check section makes.",
    },
  },
  {
    id: "mdn-getshaderinfolog",
    type: "article",
    title: "WebGLRenderingContext: getShaderInfoLog() method",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderInfoLog",
    note: {
      vi: "Cách đọc log lỗi compile GLSL có số dòng thật — công cụ chính để debug khi màn hình chỉ có màu clear.",
      en: "How to read a GLSL compile error log with real line numbers — the primary tool for debugging a blank, clear-colored canvas.",
    },
  },
  {
    id: "khronos-webgl2-spec-triangle",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác drawArrays, primitive assembly và các cờ trạng thái COMPILE_STATUS/LINK_STATUS dùng xuyên suốt bài.",
      en: "The authoritative source defining drawArrays, primitive assembly and the COMPILE_STATUS/LINK_STATUS flags used throughout this lesson.",
    },
  },
];
