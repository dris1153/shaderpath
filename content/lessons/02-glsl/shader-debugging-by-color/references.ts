import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "learnwebgl-fragment-shader-debugging",
    type: "article",
    title: "LearnWebGL — 9.6: Fragment Shader Debugging",
    authors: ["Wayne Brown"],
    url: "https://learnwebgl.brown37.net/09_lights/fragment_shader_debugging.html",
    note: {
      vi: "Bài viết chuyên đề về debug fragment shader bằng cách xuất giá trị nghi ngờ ra màu — cùng kỹ thuật cốt lõi của bài này, với thêm ví dụ áp dụng cho lighting/normal.",
      en: "A dedicated write-up on debugging fragment shaders by outputting suspect values as color — the same core technique this lesson teaches, with extra lighting/normal examples.",
    },
  },
  {
    id: "wikibooks-glsl-unity-debugging",
    type: "article",
    title: "GLSL Programming/Unity — Debugging of Shaders",
    url: "https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Debugging_of_Shaders",
    note: {
      vi: "Giải thích kỹ thuật 'false-color image' để soi giá trị trung gian trong shader, kèm ví dụ remap giá trị có dấu (normal) về [0,1] trước khi xuất màu.",
      en: "Explains the 'false-color image' technique for inspecting intermediate shader values, including remapping signed values (normals) into [0,1] before outputting as color.",
    },
  },
  {
    id: "spectorjs-repo",
    type: "repo",
    title: "Spector.js — WebGL Frame Debugger",
    authors: ["BabylonJS team"],
    url: "https://github.com/BabylonJS/Spector.js",
    note: {
      vi: "Công cụ browser extension bắt lại từng draw call và giá trị uniform/texture của một frame WebGL — dùng để xác nhận chính xác giá trị mà kỹ thuật debug-by-color chỉ cho ước lượng bằng mắt.",
      en: "A browser extension that captures every draw call plus uniform/texture values of a WebGL frame — used to confirm exact values where debug-by-color only gives a visual estimate.",
    },
  },
];
