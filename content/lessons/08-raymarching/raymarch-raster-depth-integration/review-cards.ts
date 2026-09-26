import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "depth-needs-its-own-target",
    q: {
      vi: "Vì sao quad raymarch không thể đọc thẳng depth mà mesh đã ghi vào canvas, mà phải render mesh thêm một lần vào render target?",
      en: "Why can't the raymarch quad simply read the depth the mesh already wrote to the canvas, instead of rendering the mesh a second time into a render target?",
    },
    a: {
      vi: "Depth buffer của canvas thuộc framebuffer mặc định và không phải một texture, nên không shader nào lấy mẫu được nó; còn một depth texture thì không thể vừa được lấy mẫu vừa là depth attachment đang được vẽ vào — WebGL từ chối feedback loop đó bằng `INVALID_OPERATION`. Nên mesh được render trước vào một target riêng có depth texture, rồi shader raymarch lấy mẫu nó như mọi texture khác.",
      en: "The canvas's depth buffer belongs to the default framebuffer and is not a texture, so no shader can sample it; and a depth texture can't be sampled while it is the depth attachment being drawn into — WebGL rejects that feedback loop with `INVALID_OPERATION`. So the mesh is first rendered into a separate target with a depth texture, which the raymarch shader then samples like any other texture.",
    },
  },
  {
    id: "frag-depth-kills-early-z",
    q: {
      vi: "Ngoài phần toán thêm vào, ghi `gl_FragDepth` còn khiến GPU mất gì?",
      en: "Besides the extra math, what does writing `gl_FragDepth` cost the GPU?",
    },
    a: {
      vi: "Early-Z. Bình thường GPU có thể loại một fragment bị che dựa vào depth raster trước khi chạy fragment shader; khi shader tự ghi depth, depth thật chỉ có sau khi shader chạy xong, nên mọi fragment được phủ đều phải chạy shader, cả vòng march, trước khi depth test loại được nó.",
      en: "Early-Z. Normally the GPU can reject a hidden fragment by its rasterized depth before running the fragment shader; once the shader writes its own depth, the real depth exists only after the shader finishes, so every covered fragment runs the shader, march included, before the depth test can reject it.",
    },
  },
];
