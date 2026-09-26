import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "css-size-only",
    q: {
      vi: "Đặt `canvas.style.width = '100%'` nhưng không đụng tới `canvas.width`. Hình trông thế nào, và vì sao?",
      en: "You set `canvas.style.width = '100%'` but never touch `canvas.width`. How does the image look, and why?",
    },
    a: {
      vi: "Mờ: drawing buffer vẫn là 300×150 mặc định, trình duyệt phóng ảnh nhỏ đó ra lấp khung lớn. CSS size là khung hiển thị; `canvas.width`/`height` mới là số pixel thật được vẽ vào.",
      en: "Blurry: the drawing buffer is still the default 300×150, and the browser scales that small image up to fill the large box. The CSS size is the display box; `canvas.width`/`height` is the number of pixels actually drawn into.",
    },
  },
  {
    id: "viewport-after-resize",
    q: {
      vi: "Buffer đã resize đúng theo DPR, nhưng hình chỉ được vẽ vào một góc canvas. Thiếu bước nào, và vì sao nó không tự xảy ra?",
      en: "The buffer has been resized correctly for the DPR, yet the image is drawn into one corner of the canvas. Which step is missing, and why doesn't it happen by itself?",
    },
    a: {
      vi: "`gl.viewport(0, 0, canvas.width, canvas.height)`. Viewport là state riêng của GL, không tự đi theo kích thước buffer — GPU tiếp tục vẽ theo vùng cũ, nhỏ hơn.",
      en: "`gl.viewport(0, 0, canvas.width, canvas.height)`. The viewport is separate GL state that does not follow the buffer size — the GPU keeps drawing into the old, smaller area.",
    },
  },
];
