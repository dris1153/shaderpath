import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "frame-time-over-average-fps",
    q: {
      vi: "Vì sao người làm đồ hoạ nói \"nhìn frame time, đừng nhìn FPS trung bình\"?",
      en: "Why do graphics people say \"look at frame time, not average FPS\"?",
    },
    a: {
      vi: "FPS là trung bình trên một cửa sổ thời gian, và trung bình xoá đúng cái frame gây khó chịu: một phút 60fps đều có một lần khựng 300ms ở giữa vẫn báo khoảng 59fps. Đo mili-giây của từng frame và nhìn độ dao động theo thời gian, không chỉ giá trị trung bình.",
      en: "FPS is an average over a time window, and averages erase exactly the frame that annoyed someone: a steady minute at 60fps with one 300ms stall in the middle still reports about 59fps. Measure each frame's milliseconds and look at the variance over time, not just the mean.",
    },
  },
  {
    id: "info-render-vs-info-memory",
    q: {
      vi: "Vì sao cộng dồn `renderer.info.render.calls` qua nhiều frame là vô nghĩa, trong khi `info.memory.geometries` đọc lúc nào cũng được?",
      en: "Why is summing `renderer.info.render.calls` across frames meaningless, while `info.memory.geometries` can be read at any time?",
    },
    a: {
      vi: "`info.render.*` bị xoá về 0 ở đầu mỗi lần gọi `renderer.render()` (`autoReset` mặc định `true`), nên nó chỉ mô tả lần render gần nhất — phải đọc ngay sau lần render đó. `info.memory.*` không reset: nó đếm geometry/texture đang nằm trên GPU, tăng khi upload và chỉ giảm khi `dispose()`.",
      en: "`info.render.*` is zeroed at the start of every `renderer.render()` call (`autoReset` defaults to `true`), so it only describes the most recent render — read it right after that render. `info.memory.*` never resets: it counts geometries/textures resident on the GPU, rising on upload and falling only on `dispose()`.",
    },
  },
  {
    id: "spector-shows-redundant-state",
    q: {
      vi: "`renderer.info` đã xác nhận có quá nhiều draw call. Spector.js cho thấy thêm điều gì mà `renderer.info` không bao giờ cho thấy?",
      en: "`renderer.info` has confirmed there are too many draw calls. What does Spector.js show that `renderer.info` never can?",
    },
    a: {
      vi: "Mọi lệnh `gl.*` của một frame theo đúng thứ tự, trạng thái GPU tại từng draw call — và nhất là các thay đổi trạng thái thừa giữa hai draw call liền nhau: cùng một texture bị bind lại 40 lần, hay `useProgram` được gọi nhiều hơn hẳn số material thực sự khác nhau.",
      en: "Every `gl.*` command of one frame in order, the GPU state at each draw call — and above all the redundant state changes between adjacent draw calls: the same texture rebound 40 times, or `useProgram` firing far more often than there are genuinely distinct materials.",
    },
  },
];
