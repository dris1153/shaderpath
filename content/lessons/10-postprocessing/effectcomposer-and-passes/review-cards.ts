import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "composer-needs-output-pass",
    q: {
      vi: "Chuyển sang dùng composer, cảnh trông tối và gắt hơn hẳn lúc R3F tự render, dù không có lỗi nào. Vì sao?",
      en: "After switching to a composer, the scene looks darker and harsher than R3F's own render, with no error anywhere. Why?",
    },
    a: {
      vi: "Buffer của composer giữ dữ liệu linear HDR: renderer chỉ tone map và mã hoá sRGB khi render thẳng ra màn hình. Không có `OutputPass` (hay pass tương đương) ở cuối chuỗi thì pass cuối ghi dữ liệu linear, chưa tone map, ra canvas vốn chờ byte đã mã hoá sRGB.",
      en: "Composer buffers hold linear HDR data: the renderer only tone maps and encodes to sRGB when rendering straight to the screen. Without an `OutputPass` (or an equivalent) at the end of the chain, the last pass writes linear, un-tone-mapped data to a canvas that expects sRGB-encoded bytes.",
    },
  },
  {
    id: "composer-set-size",
    q: {
      vi: "Kéo đổi kích thước cửa sổ, ảnh qua composer bị mềm nhoè hoặc vỡ khối, dù tỉ lệ hình vẫn đúng. Thứ gì không theo canvas?",
      en: "You resize the window and the composer's image turns soft or blocky, though its proportions look right. What didn't follow the canvas?",
    },
    a: {
      vi: "Hai render target nội bộ của composer. R3F tự resize canvas và cập nhật aspect của camera, nên hình vẫn đúng tỉ lệ, nhưng vẫn được render ở kích thước buffer cũ rồi kéo giãn ra canvas mới. Gọi `composer.setSize(width, height)` mỗi khi canvas đổi kích thước.",
      en: "The composer's two internal render targets. R3F resizes the canvas and updates the camera's aspect, so the picture keeps its proportions, but it is still rendered at the old buffer size and then stretched over the new canvas. Call `composer.setSize(width, height)` whenever the canvas size changes.",
    },
  },
  {
    id: "useframe-priority-takes-over",
    q: {
      vi: "`useFrame(() => composer.render(), 1)` — con số `1` làm gì, và nếu đổi thành `-1` thì sao?",
      en: "`useFrame(() => composer.render(), 1)` — what does the `1` do, and what happens with `-1` instead?",
    },
    a: {
      vi: "Priority lớn hơn 0 khiến R3F bỏ lượt render mặc định của nó, giao hẳn việc render cho callback. Priority âm thì không: sau khi chạy các callback, R3F vẫn tự render scene thẳng ra canvas, đè lên kết quả của composer — tốn hai lần render mà hiệu ứng biến mất.",
      en: "A priority above 0 makes R3F skip its own default render and hand rendering to the callback. A negative priority does not: after running the callbacks, R3F still renders the scene straight to the canvas, over the composer's result — two renders, and the effects vanish.",
    },
  },
];
