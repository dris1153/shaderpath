import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "version-must-be-line-one",
    q: {
      vi: "Shader viết trong template literal bắt đầu bằng một dấu xuống dòng rồi mới tới `#version 300 es`. Chuyện gì xảy ra?",
      en: "A shader written in a template literal starts with a newline before `#version 300 es`. What happens?",
    },
    a: {
      vi: "Compile lỗi: `#version 300 es` phải đứng đúng dòng 1, không có gì trước nó, và trình biên dịch báo lỗi ngay tại dòng đó. Không nhận ra phiên bản, nó coi shader là ES 1.00, nên các từ khoá mới như `in`/`out` kéo theo thêm lỗi cú pháp.",
      en: "It fails to compile: `#version 300 es` must be on line 1, with nothing before it, and the compiler reports the error on that line. Without the version it treats the shader as ES 1.00, so newer keywords such as `in`/`out` add further syntax errors.",
    },
  },
  {
    id: "attrib-location-minus-one",
    q: {
      vi: "Shader khai `in vec2 aPos`, nhưng JavaScript gọi `getAttribLocation(program, 'aPosition')` và nhận `-1`. Tam giác trông thế nào, và có exception nào không?",
      en: "The shader declares `in vec2 aPos`, but JavaScript calls `getAttribLocation(program, 'aPosition')` and gets `-1`. What does the triangle look like, and is there an exception?",
    },
    a: {
      vi: "Không thấy gì: dữ liệu vị trí không bao giờ tới `aPos`, mọi đỉnh nhận cùng một giá trị mặc định, và một tam giác có diện tích 0 không sinh fragment nào. Không có exception — `enableVertexAttribArray(-1)` chỉ ghi `INVALID_VALUE` cho `gl.getError()`.",
      en: "Nothing at all: the position data never reaches `aPos`, every vertex gets the same default value, and a zero-area triangle produces no fragments. No exception — `enableVertexAttribArray(-1)` only records `INVALID_VALUE` for `gl.getError()`.",
    },
  },
];
