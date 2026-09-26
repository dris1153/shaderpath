import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "resolution-is-a-define",
    q: {
      vi: "Shader của một biến `GPUComputationRenderer` thêm dòng `uniform vec2 resolution;` và báo lỗi cú pháp. Vì sao?",
      en: "A `GPUComputationRenderer` variable's shader adds `uniform vec2 resolution;` and fails with a syntax error. Why?",
    },
    a: {
      vi: "`resolution` là một `#define` mà `addVariable` chèn sẵn (ví dụ `vec2( 128.0, 128.0 )`), không phải uniform. Bộ tiền xử lý thay nó ở MỌI chỗ, kể cả trong chính dòng khai báo, thành `uniform vec2 vec2( 128.0, 128.0 );`. Cứ dùng thẳng `resolution` mà không khai báo gì.",
      en: "`resolution` is a `#define` that `addVariable` injects (say `vec2( 128.0, 128.0 )`), not a uniform. The preprocessor replaces it EVERYWHERE, including inside that declaration, which becomes `uniform vec2 vec2( 128.0, 128.0 );`. Just use `resolution` without declaring anything.",
    },
  },
  {
    id: "float-type-has-no-fallback",
    q: {
      vi: "Trên vài điện thoại, mô phỏng `GPUComputationRenderer` cứ đen kịt, trong khi `init()` trả về `null` và `compute()` không ném lỗi nào. Thiếu gì?",
      en: "On some phones a `GPUComputationRenderer` simulation stays solid black, while `init()` returns `null` and `compute()` throws nothing. What is missing?",
    },
    a: {
      vi: "Kiểu mặc định là `FloatType`, mà render vào texture float cần `EXT_color_buffer_float` — không phải máy nào cũng có, và bản three này không tự lùi về kiểu khác. Gọi `gpuCompute.setDataType(THREE.HalfFloatType)` trước `init()`: kém chính xác hơn nhưng được hỗ trợ rộng hơn nhiều.",
      en: "The default type is `FloatType`, and rendering into a float texture needs `EXT_color_buffer_float` — not every device has it, and this three version does not fall back on its own. Call `gpuCompute.setDataType(THREE.HalfFloatType)` before `init()`: less precise, far more widely supported.",
    },
  },
  {
    id: "dependencies-read-last-frame",
    q: {
      vi: "Trong một lần `compute()`, shader position đọc velocity của frame nào, và điều gì quyết định việc đó?",
      en: "Within one `compute()` call, which frame's velocity does the position shader read, and what decides it?",
    },
    a: {
      vi: "Của frame trước. Mọi dependency được gán texture ở cùng `currentTextureIndex` — kết quả đã xong của frame trước — và chỉ số này là MỘT số chung cho cả renderer, chỉ lật một lần sau khi mọi biến đã tính xong. Các biến luôn đi cùng nhịp ping-pong.",
      en: "Last frame's. Every dependency is bound to the texture at the same `currentTextureIndex` — last frame's finished result — and that index is ONE number for the whole renderer, flipped once after every variable has run. All variables stay in lockstep.",
    },
  },
];
