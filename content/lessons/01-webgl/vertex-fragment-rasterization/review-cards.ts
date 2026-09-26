import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "missing-gl-position",
    q: {
      vi: "Vertex shader quên ghi `gl_Position`. Compile và link có báo lỗi không, và tam giác trông ra sao?",
      en: "A vertex shader forgets to write `gl_Position`. Do compile and link report an error, and what does the triangle look like?",
    },
    a: {
      vi: "Không có lỗi nào. `gl_Position` không được ghi thì không xác định theo spec (phần lớn driver coi là `vec4(0.0)`), một điểm suy biến mà rasterizer không sinh được fragment nào — tam giác không hiện.",
      en: "No error at all. An unwritten `gl_Position` is undefined by the spec (most drivers treat it as `vec4(0.0)`), a degenerate point from which the rasterizer produces no fragments — the triangle does not appear.",
    },
  },
  {
    id: "varying-mismatch-is-a-link-error",
    q: {
      vi: "Vertex shader khai `out vec3 vColor`, fragment shader khai `in vec4 vColor` và có dùng nó. Lỗi xuất hiện ở bước nào, và vì sao không sớm hơn?",
      en: "The vertex shader declares `out vec3 vColor`; the fragment shader declares `in vec4 vColor` and uses it. At which step does the error appear, and why not earlier?",
    },
    a: {
      vi: "Ở bước link. Mỗi shader tự compile đều hợp lệ; chỉ khi link hai shader lại, hợp đồng `out`/`in` mới được so — tên và kiểu phải khớp.",
      en: "At link time. Each shader compiles fine on its own; only when the two are linked is the `out`/`in` contract compared — name and type must match.",
    },
  },
  {
    id: "perspective-correct-interpolation",
    q: {
      vi: "Tự viết rasterizer, bạn nội suy UV tuyến tính theo toạ độ màn hình cho một tam giác đã chiếu phối cảnh. Texture bị gì, và vì sao?",
      en: "Writing your own rasterizer, you interpolate UVs linearly in screen space across a perspective-projected triangle. What happens to the texture, and why?",
    },
    a: {
      vi: "Bị méo dọc theo phần xa của tam giác: sau phép chiếu phối cảnh, khoảng cách trên màn hình không còn tỉ lệ với khoảng cách trên bề mặt. Phải nội suy perspective-correct, có bước chia cho $w$.",
      en: "It warps along the far part of the triangle: after perspective projection, distances on screen are no longer proportional to distances on the surface. Interpolation must be perspective-correct, with a divide by $w$.",
    },
  },
];
