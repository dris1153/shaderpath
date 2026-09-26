import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "uniform-needs-active-program",
    q: {
      vi: "`loc` lấy từ `program`, nhưng gọi `gl.uniform1f(loc, 0.5)` khi một program khác đang active. Giá trị 0.5 đi đâu?",
      en: "`loc` came from `program`, but `gl.uniform1f(loc, 0.5)` is called while a different program is active. Where does the 0.5 go?",
    },
    a: {
      vi: "Không đi đâu cả. Location gắn với đúng program đã sinh ra nó, nên lệnh bị bỏ qua với lỗi `INVALID_OPERATION` (đọc được qua `gl.getError()` hoặc console), và uniform giữ nguyên giá trị cũ. Gọi `gl.useProgram(program)` trước.",
      en: "Nowhere. A location belongs to the program that produced it, so the call is dropped with an `INVALID_OPERATION` error (visible through `gl.getError()` or the console), and the uniform keeps its old value. Call `gl.useProgram(program)` first.",
    },
  },
  {
    id: "uniform-location-null",
    q: {
      vi: "`getUniformLocation(program, 'uTime')` trả `null` dù shader có khai `uniform float uTime`. Vì sao, và `gl.uniform1f(null, t)` sau đó làm gì?",
      en: "`getUniformLocation(program, 'uTime')` returns `null` even though the shader declares `uniform float uTime`. Why, and what does `gl.uniform1f(null, t)` then do?",
    },
    a: {
      vi: "Compiler đã loại `uTime` vì nó không ảnh hưởng tới output, nên `null` là kết quả hợp lệ. `gl.uniform1f(null, t)` không làm gì cả, không throw, không log — lỗi hoàn toàn im lặng.",
      en: "The compiler removed `uTime` because it does not affect the output, so `null` is a valid result. `gl.uniform1f(null, t)` does nothing — no throw, no log — a completely silent failure.",
    },
  },
];
