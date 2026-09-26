import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "raw-is-not-faster",
    q: {
      vi: "Một bạn chọn `RawShaderMaterial` vì nghĩ bỏ phần prelude Three tự chèn sẽ giúp shader chạy nhanh hơn. Lập luận đó sai ở đâu, và lý do đúng để chọn Raw là gì?",
      en: "Someone picks `RawShaderMaterial` believing that dropping Three's injected prelude makes the shader run faster. Where does that reasoning fail, and what is a good reason to choose Raw?",
    },
    a: {
      vi: "Prelude chỉ là text nối vào chuỗi shader trước khi biên dịch, một lần duy nhất, và program được cache — nó không tốn gì lúc chạy. Chọn Raw vì kiểm soát và tương thích: chia sẻ shader với code ngoài Three, hoặc tránh trùng tên với các khai báo Three chèn sẵn.",
      en: "The prelude is just text prepended before compilation, once, and the program is cached — it costs nothing at run time. Choose Raw for control and compatibility: sharing shaders with code outside Three, or avoiding clashes with the names Three injects.",
    },
  },
  {
    id: "raw-declares-everything",
    q: {
      vi: "Copy nguyên một shader chạy tốt trên `ShaderMaterial` sang `RawShaderMaterial`, và nó báo lỗi biên dịch ngay. Vì sao?",
      en: "A shader that works on `ShaderMaterial` is copied as-is to `RawShaderMaterial`, and it fails to compile right away. Why?",
    },
    a: {
      vi: "Raw không chèn khai báo attribute, uniform hay precision nào: `position`, `uv`, `projectionMatrix`, `modelViewMatrix`, cả dòng `precision` cho fragment shader — tất cả phải tự khai báo. Thiếu bất kỳ cái nào, lỗi báo ngay dòng đầu tiên dùng đến nó.",
      en: "Raw injects no attribute, uniform or precision declarations: `position`, `uv`, `projectionMatrix`, `modelViewMatrix`, even the fragment shader's `precision` line — you declare them all. Miss any one, and the error points at the first line that uses it.",
    },
  },
];
