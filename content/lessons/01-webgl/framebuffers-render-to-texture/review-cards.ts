import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "forgot-to-unbind-fbo",
    q: {
      vi: "Pass cuối lẽ ra vẽ ra màn hình, nhưng canvas không bao giờ cập nhật và không có exception nào. Nghi ngay dòng nào?",
      en: "The last pass should draw to the screen, but the canvas never updates and no exception is thrown. Which line do you suspect first?",
    },
    a: {
      vi: "Thiếu `gl.bindFramebuffer(gl.FRAMEBUFFER, null)` trước pass cuối. FBO vẫn đang bind, nên kết quả tiếp tục được ghi vào texture offscreen thay vì canvas.",
      en: "A missing `gl.bindFramebuffer(gl.FRAMEBUFFER, null)` before the last pass. The FBO is still bound, so the result keeps going into the offscreen texture instead of the canvas.",
    },
  },
  {
    id: "check-framebuffer-status",
    q: {
      vi: "Vẽ vào một FBO chưa gắn attachment nào. Draw call có throw không, và làm sao phát hiện?",
      en: "You draw into an FBO with no attachment at all. Does the draw call throw, and how do you find out?",
    },
    a: {
      vi: "Không throw — draw call không vẽ gì, và lỗi `INVALID_FRAMEBUFFER_OPERATION` chỉ đọc được qua `gl.getError()`. Gọi `gl.checkFramebufferStatus(gl.FRAMEBUFFER)` sau khi gắn attachment; kết quả phải là `FRAMEBUFFER_COMPLETE`.",
      en: "It does not throw — the draw call draws nothing, and the `INVALID_FRAMEBUFFER_OPERATION` error shows only through `gl.getError()`. Call `gl.checkFramebufferStatus(gl.FRAMEBUFFER)` after attaching; it must return `FRAMEBUFFER_COMPLETE`.",
    },
  },
];
