import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "john-chapman-ssao-tutorial",
    type: "article",
    title: "SSAO Tutorial",
    authors: ["John Chapman"],
    url: "http://john-chapman-graphics.blogspot.com/2013/01/ssao-tutorial.html",
    note: {
      vi: "Bài viết Three.js tự trích dẫn ngay trong source của SSAOShader — giải thích hemisphere kernel, reconstruct view-space position và bias theo đúng thứ tự bài này dạy.",
      en: "The article Three.js itself cites right inside SSAOShader's source — explains the hemisphere kernel, view-space position reconstruction and bias in the exact order this lesson teaches them.",
    },
  },
  {
    id: "learnopengl-ssao",
    type: "article",
    title: "Advanced Lighting: SSAO",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-Lighting/SSAO",
    note: {
      vi: "Nguồn thứ hai mà SSAOShader trích dẫn — có sơ đồ minh hoạ kernel/noise texture trực quan hơn, tốt để đối chiếu khi đọc code GLSL thô.",
      en: "The second source SSAOShader cites — includes clearer visual diagrams of the kernel/noise texture, useful to cross-reference while reading the raw GLSL.",
    },
  },
  {
    id: "threejs-ssaopass-source",
    type: "repo",
    title: "three.js — SSAOPass.js source",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/SSAOPass.js",
    note: {
      vi: "Nguồn thật xác nhận các tham số dùng trong bài: kernelRadius, minDistance, maxDistance, output modes — đọc trực tiếp thay vì suy đoán từ tài liệu cũ.",
      en: "The actual source confirming every parameter this lesson uses: kernelRadius, minDistance, maxDistance, output modes — read directly instead of guessing from stale docs.",
    },
  },
  {
    id: "threejs-gtaopass-source",
    type: "repo",
    title: "three.js — GTAOPass.js source",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/GTAOPass.js",
    note: {
      vi: "Xác nhận GTAOPass tồn tại song song SSAOPass trong bản three.js dùng cho dự án, cùng dòng docstring so sánh chất lượng/chi phí trích trong bài.",
      en: "Confirms GTAOPass exists alongside SSAOPass in the three.js version this project uses, including the exact quality/cost docstring comparison quoted in the lesson.",
    },
  },
];
