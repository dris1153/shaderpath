import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gpugems3-ch28-post-process-dof",
    type: "article",
    title: "GPU Gems 3 — Chapter 28: Practical Post-Process Depth of Field",
    authors: ["Earl Hammon Jr."],
    url: "https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-28-practical-post-process-depth-field",
    note: {
      vi: "Chương gốc mô tả kỹ thuật depth-of-field hậu kỳ dựa trên circle of confusion và gather biến bán kính — đúng lớp thuật toán mà BokehPass của Three.js hiện thực hoá ở mức đơn giản hơn.",
      en: "The original chapter describing post-process depth of field via the circle of confusion and variable-radius gathers — the same technique family Three.js's BokehPass implements in simplified form.",
    },
  },
  {
    id: "gpugems3-ch27-motion-blur",
    type: "article",
    title: "GPU Gems 3 — Chapter 27: Motion Blur as a Post-Processing Effect",
    authors: ["Gilberto Rosado"],
    url: "https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-27-motion-blur-post-processing-effect",
    note: {
      vi: "Nguồn gốc của kỹ thuật velocity-buffer motion blur dạy trong bài này: tái tạo vị trí clip-space frame trước từ depth và ma trận camera, blur dọc vector hiệu số.",
      en: "The source of the velocity-buffer motion blur technique this lesson teaches: reconstructing the previous frame's clip-space position from depth and camera matrices, then blurring along the difference vector.",
    },
  },
  {
    id: "wikipedia-circle-of-confusion",
    type: "article",
    title: "Circle of Confusion",
    url: "https://en.wikipedia.org/wiki/Circle_of_confusion",
    note: {
      vi: "Suy luận đầy đủ công thức CoC từ mô hình thin-lens, gồm cả dạng dùng trong bài ($c = f^2/N \\cdot |S_2-S_1| / (S_2(S_1-f))$) và các dạng tương đương khác.",
      en: "The full derivation of the CoC formula from the thin-lens model, including the exact form used in this lesson ($c = f^2/N \\cdot |S_2-S_1| / (S_2(S_1-f))$) and other equivalent forms.",
    },
  },
  {
    id: "threejs-bokehshader-source",
    type: "repo",
    title: "three.js — BokehShader.js source",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/BokehShader.js",
    note: {
      vi: "Nguồn thật của shader BokehPass dùng: xác nhận chính xác công thức dofblur xấp xỉ tuyến tính và pattern 41-mẫu/16-góc/4-bán kính tạo hình bokeh, thay vì suy đoán.",
      en: "The actual shader source BokehPass runs: confirms the exact linear dofblur approximation and the 41-sample/16-angle/4-radius pattern that shapes the bokeh, instead of guessing.",
    },
  },
];
