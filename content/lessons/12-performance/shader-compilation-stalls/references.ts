import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-webglrenderer",
    type: "article",
    title: "Three.js Docs — WebGLRenderer",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/renderers/WebGLRenderer",
    note: {
      vi: "Trang tài liệu chính thức liệt kê `compile()` và `compileAsync()` cùng chữ ký của chúng — hai phương thức toàn bộ phần pre-warm của bài này dựa vào.",
      en: "The official docs page listing `compile()` and `compileAsync()` and their signatures — the two methods this lesson's entire pre-warming section is built on.",
    },
  },
  {
    id: "khronos-khr-parallel-shader-compile",
    type: "spec",
    title: "WebGL Extension — KHR_parallel_shader_compile",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/extensions/KHR_parallel_shader_compile/",
    note: {
      vi: "Đặc tả chuẩn của extension `compileAsync()` kiểm tra qua `extensions.get(...)` trước khi quyết định poll không chặn hay rơi về hành vi đồng bộ.",
      en: "The standard spec for the extension `compileAsync()` checks via `extensions.get(...)` before deciding to poll non-blockingly or fall back to synchronous behavior.",
    },
  },
  {
    id: "threejs-source-webglrenderer-compile",
    type: "repo",
    title: "three.js source — WebGLRenderer.js (compile / compileAsync)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderer.js",
    note: {
      vi: "Mã nguồn thật của `compile()` và `compileAsync()`, verify trực tiếp trên bản three.js 0.185.1 đang cài — nguồn của mọi khẳng định hành vi trong bài, không phải suy đoán qua doc.",
      en: "The actual source of `compile()` and `compileAsync()`, verified directly against the installed three.js 0.185.1 — the source of every behavioral claim in this lesson, not guesswork from docs.",
    },
  },
  {
    id: "threejs-source-webglprograms-cachekey",
    type: "repo",
    title: "three.js source — WebGLPrograms.js (getProgramCacheKey)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLPrograms.js",
    note: {
      vi: "Nơi cache key thật sự được lắp ráp — theo dõi `getProgramCacheKey`/`getProgramCacheKeyParameters` để thấy chính xác defines, số lượng ánh sáng và shadow type nào tham gia vào việc quyết định một material có compile lại hay không.",
      en: "Where the cache key is actually assembled — trace `getProgramCacheKey`/`getProgramCacheKeyParameters` to see exactly which defines, light counts and shadow type decide whether a material recompiles.",
    },
  },
];
