import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-webgl2-spec-rasterization",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác clip space, clipping và rasterization — nơi tra cứu khi cần biết công thức chính xác hơn ví dụ đơn giản hoá trong bài này.",
      en: "The authoritative source defining clip space, clipping and rasterization precisely — the reference to reach for when this lesson's simplified walkthrough isn't precise enough.",
    },
  },
  {
    id: "webgl2fundamentals-how-it-works",
    type: "article",
    title: "WebGL2 Fundamentals — WebGL How It Works",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-how-it-works.html",
    note: {
      vi: "Giải thích từng trạm của pipeline kèm hình minh hoạ trực quan, cùng cách chia bài với lesson này nhưng đi sâu hơn vào phần rasterization và varying interpolation.",
      en: "Walks through every pipeline station with visual diagrams, structured much like this lesson but going deeper into rasterization and varying interpolation.",
    },
  },
  {
    id: "scratchapixel-rasterization-stage",
    type: "article",
    title: "The Rasterization Stage",
    authors: ["Scratchapixel"],
    url: "https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/rasterization-stage.html",
    note: {
      vi: "Đi sâu vào chính xác cách rasterizer quyết định pixel nào thuộc về một tam giác (edge function, coverage test) — chi tiết mà bài này chỉ nói ở mức khái niệm.",
      en: "Digs into exactly how a rasterizer decides which pixels belong to a triangle (the edge function, the coverage test) — detail this lesson only covers at a conceptual level.",
    },
  },
  {
    id: "learnopengl-hello-triangle",
    type: "article",
    title: "LearnOpenGL — Hello Triangle",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Getting-started/Hello-Triangle",
    note: {
      vi: "Cùng một pipeline, viết bằng OpenGL native thay vì WebGL — đối chiếu để thấy các trạm cố định/lập trình được giống hệt nhau giữa hai API, chỉ khác cú pháp gọi.",
      en: "The same pipeline, written against native OpenGL instead of WebGL — a useful cross-check that the fixed/programmable stations are identical between the two APIs, only the call syntax differs.",
    },
  },
];
