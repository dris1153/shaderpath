import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "enable-vertex-attrib-array",
    q: {
      vi: "`vertexAttribPointer` đã gọi đúng, nhưng hình học biến mất và console im lặng. Thiếu lệnh gì, và vì sao không có lỗi?",
      en: "`vertexAttribPointer` is called correctly, but the geometry vanishes and the console is silent. Which call is missing, and why is there no error?",
    },
    a: {
      vi: "`enableVertexAttribArray`. Thiếu nó, attribute đọc một giá trị hằng mặc định thay vì dữ liệu trong buffer — hoàn toàn hợp lệ về mặt API nên không có gì để báo lỗi.",
      en: "`enableVertexAttribArray`. Without it the attribute reads a constant default value instead of the buffer data — perfectly valid as far as the API is concerned, so there is nothing to report.",
    },
  },
  {
    id: "vao-records-binding-at-pointer-time",
    q: {
      vi: "Cấu hình VAO xong, bạn bind một buffer khác vào `ARRAY_BUFFER` để upload dữ liệu cho việc khác. Cấu hình VAO có bị phá không, và vì sao?",
      en: "With the VAO set up, you bind a different buffer to `ARRAY_BUFFER` to upload data for something else. Does that break the VAO's setup, and why?",
    },
    a: {
      vi: "Không. VAO ghi lại buffer nào đang bind vào đúng lúc mỗi lệnh `vertexAttribPointer` chạy, riêng cho từng attribute — nó không theo dõi điểm bind `ARRAY_BUFFER` sau đó. (Riêng `ELEMENT_ARRAY_BUFFER` thì VAO có ghi.)",
      en: "No. The VAO records which buffer was bound at the moment each `vertexAttribPointer` call ran, per attribute — it does not track the `ARRAY_BUFFER` binding afterwards. (`ELEMENT_ARRAY_BUFFER` is the exception: the VAO does record that.)",
    },
  },
  {
    id: "usage-hint",
    q: {
      vi: "Buffer vị trí của particle được nạp lại mỗi frame nhưng tạo với `STATIC_DRAW`. Hình vẽ ra có sai không, và cái giá là gì?",
      en: "A particle position buffer is re-uploaded every frame but was created with `STATIC_DRAW`. Is the image wrong, and what does it cost?",
    },
    a: {
      vi: "Hình vẫn đúng: usage chỉ là gợi ý để driver chọn chỗ đặt buffer trong bộ nhớ, không phải ràng buộc. Nói dối driver chỉ hại hiệu năng — mỗi lần nạp lại có thể buộc nó chuyển buffer sang vùng nhớ khác. Dùng `DYNAMIC_DRAW` — hoặc `STREAM_DRAW` nếu mỗi lần nạp chỉ vẽ một lần.",
      en: "The image is still right: usage is only a hint for where the driver places the buffer in memory, not a constraint. Lying to the driver only hurts performance — each re-upload may force it to move the buffer elsewhere. Use `DYNAMIC_DRAW` — or `STREAM_DRAW` if each upload is drawn only once.",
    },
  },
];
