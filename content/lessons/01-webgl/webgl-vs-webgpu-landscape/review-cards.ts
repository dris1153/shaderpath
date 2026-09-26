import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "instancing-extension-gone",
    q: {
      vi: "Code WebGL1 gọi `gl.getExtension('ANGLE_instanced_arrays')` rồi vẽ trong nhánh `if (ext)`. Chuyển sang context WebGL2, instancing biến mất. Vì sao?",
      en: "WebGL1 code calls `gl.getExtension('ANGLE_instanced_arrays')` and draws inside an `if (ext)` branch. Moved to a WebGL2 context, instancing disappears. Why?",
    },
    a: {
      vi: "WebGL2 có instancing sẵn trên context (`drawArraysInstanced`), nên extension kia không còn được cung cấp và trả `null` — nhánh `if (ext)` lặng lẽ không bao giờ chạy.",
      en: "WebGL2 has instancing built into the context (`drawArraysInstanced`), so that extension is no longer offered and returns `null` — the `if (ext)` branch silently never runs.",
    },
  },
  {
    id: "navigator-gpu-is-not-enough",
    q: {
      vi: "Code thấy `navigator.gpu` tồn tại là dùng WebGPU luôn. Bước nào còn thiếu, và khi nào nó thất bại?",
      en: "The code goes straight to WebGPU as soon as `navigator.gpu` exists. Which step is missing, and when does it fail?",
    },
    a: {
      vi: "`await navigator.gpu.requestAdapter()` vẫn có thể trả `null`: GPU process bị tắt, chạy trong CI headless, hay driver nằm trong blocklist. `navigator.gpu` chỉ nói trình duyệt biết API; phải xử lý nhánh async đó và có phương án dự phòng.",
      en: "`await navigator.gpu.requestAdapter()` can still return `null`: the GPU process is disabled, it runs in headless CI, or the driver is blocklisted. `navigator.gpu` only says the browser knows the API; handle that async branch and have a fallback.",
    },
  },
  {
    id: "immutable-pipeline",
    q: {
      vi: "Trong WebGL, đổi blend mode giữa hai draw call chỉ cần một lệnh `gl.blendFunc`. WebGPU làm việc đó thế nào, và vì sao lại khác?",
      en: "In WebGL, changing the blend mode between two draw calls takes one `gl.blendFunc` call. How does WebGPU do it, and why is it different?",
    },
    a: {
      vi: "Dùng một `GPURenderPipeline` khác đã tạo sẵn với blend mode đó. Pipeline gói phần lớn state — vertex layout, shader, blend, depth/stencil — và được validate một lần lúc tạo, rồi không đổi nữa; WebGL thì là state machine, driver đọc state hiện tại ở mỗi draw call.",
      en: "Use a different, prebuilt `GPURenderPipeline` with that blend mode. A pipeline packages most state — vertex layout, shaders, blend, depth/stencil — and is validated once at creation, then never changes; WebGL is a state machine whose driver reads the current state at every draw call.",
    },
  },
];
