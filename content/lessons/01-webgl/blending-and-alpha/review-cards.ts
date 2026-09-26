import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "transparent-depth-write",
    q: {
      vi: "Hai tấm kính trong suốt chồng nhau, tấm gần được vẽ trước. Tấm xa mất hẳn một mảng dù công thức blend đúng. Vì sao?",
      en: "Two transparent panes overlap, and the nearer one is drawn first. Part of the farther pane is missing, even though the blend formula is right. Why?",
    },
    a: {
      vi: "Tấm gần đã ghi depth, nên fragment của tấm xa thua depth test và bị loại hẳn, không được trộn. Tắt ghi depth bằng `gl.depthMask(false)` khi vẽ vật trong suốt, và vẽ chúng từ xa tới gần.",
      en: "The nearer pane wrote depth, so the farther pane's fragments fail the depth test and are discarded, never blended. Turn off depth writes with `gl.depthMask(false)` for transparent objects, and draw them far to near.",
    },
  },
  {
    id: "additive-needs-no-sort",
    q: {
      vi: "Particle lửa vẽ với `gl.depthMask(false)`. Vì sao dùng additive (`ONE, ONE`) thì không cần sort theo khoảng cách, còn alpha blending thì cần?",
      en: "Fire particles are drawn with `gl.depthMask(false)`. Why does additive blending (`ONE, ONE`) need no sorting by distance, while alpha blending does?",
    },
    a: {
      vi: "Phép cộng giao hoán: cộng các lớp theo thứ tự nào cũng ra cùng kết quả. Alpha blending trộn màu mới với thứ đã có bên dưới theo tỉ lệ alpha, nên đổi thứ tự vẽ là đổi màu cuối.",
      en: "Addition commutes: adding the layers in any order gives the same result. Alpha blending mixes the new color with what is already underneath by alpha, so changing the drawing order changes the final color.",
    },
  },
  {
    id: "straight-alpha-into-premultiplied-canvas",
    q: {
      vi: "Canvas WebGL mặc định `premultipliedAlpha: true`, nhưng shader xuất alpha thẳng, ví dụ `vec4(1.0, 0.0, 0.0, 0.5)`. Sửa bằng dòng nào, và vì sao?",
      en: "The WebGL canvas defaults to `premultipliedAlpha: true`, but the shader outputs straight alpha, such as `vec4(1.0, 0.0, 0.0, 0.5)`. Which line fixes it, and why?",
    },
    a: {
      vi: "Xuất `vec4(rgb * a, a)`. Trình duyệt ghép canvas lên trang như thể màu đã nhân sẵn alpha; màu chưa nhân làm vùng bán trong suốt sáng quá trên nền tối và hiện viền halo ở mép vật. Khi rgb lớn hơn a, spec còn để kết quả không xác định.",
      en: "Output `vec4(rgb * a, a)`. The browser composites the canvas as if its colors were already multiplied by alpha; unmultiplied colors make semi-transparent areas too bright over dark backgrounds and leave halos at object edges. With rgb greater than a, the spec even leaves the result undefined.",
    },
  },
];
