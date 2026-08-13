import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-webgl2-spec",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn định nghĩa WebGL2 là gì và bám sát OpenGL ES 3.0 tới đâu — đọc phần mở đầu để thấy WebGL được đặc tả như một API rasterization, không phải một engine.",
      en: "The authoritative source defining exactly what WebGL2 is and how closely it tracks OpenGL ES 3.0 — read the introduction to see WebGL specified as a rasterization API, not an engine.",
    },
  },
  {
    id: "mdn-webgl-api",
    type: "article",
    title: "WebGL API — MDN Web Docs",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API",
    note: {
      vi: "Tổng quan chính thức của trình duyệt về WebGL — nơi tốt để tra cứu context options và các extension như WEBGL_debug_renderer_info dùng trong demo của bài này.",
      en: "The browser vendor's own overview of WebGL — a good place to look up context options and extensions like WEBGL_debug_renderer_info used in this lesson's demo.",
    },
  },
  {
    id: "google-angle-repo",
    type: "repo",
    title: "ANGLE — Almost Native Graphics Layer Engine",
    authors: ["Google"],
    url: "https://github.com/google/angle",
    note: {
      vi: "Mã nguồn thật của lớp dịch GL → Direct3D/Vulkan chạy phía sau Chrome và Firefox trên Windows — đọc README để thấy ANGLE không phải chi tiết lý thuyết mà là code đang chạy trên máy bạn.",
      en: "The actual source of the GL → Direct3D/Vulkan translation layer running behind Chrome and Firefox on Windows — read the README to see ANGLE isn't theory, it's code running on your machine right now.",
    },
  },
  {
    id: "webgl2fundamentals-differences",
    type: "article",
    title: "WebGL2 Fundamentals — Differences from WebGLFundamentals.org",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2-fundamentals.html",
    note: {
      vi: "Viết bởi một kỹ sư từng làm việc trực tiếp trên implementation WebGL của Chrome — nhấn mạnh đúng góc nhìn 'API cấp thấp' mà bài này dùng, không lẫn với tư duy scene-graph của Three.js.",
      en: "Written by an engineer who worked directly on Chrome's WebGL implementation — reinforces the exact 'low-level API' framing this lesson uses, without slipping into Three.js's scene-graph thinking.",
    },
  },
];
