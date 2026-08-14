import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-source-object3d",
    type: "repo",
    title: "three.js — src/core/Object3D.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/core/Object3D.js",
    note: {
      vi: "Chính file định nghĩa position/quaternion/scale, updateMatrix, updateMatrixWorld, add/remove/attach và traverse — mọi trích dẫn dòng trong bài này lấy thẳng từ đây.",
      en: "The actual file defining position/quaternion/scale, updateMatrix, updateMatrixWorld, add/remove/attach and traverse — every line citation in this lesson comes straight from here.",
    },
  },
  {
    id: "threejs-source-webglrenderer",
    type: "repo",
    title: "three.js — src/renderers/WebGLRenderer.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/WebGLRenderer.js",
    note: {
      vi: "render() thật: projScreenMatrix, bước frustum culling (_frustum.intersectsObject) và gọi sort render list — nguồn cho phần giữa bài.",
      en: "The real render(): projScreenMatrix, the frustum culling step (_frustum.intersectsObject) and the render-list sort call — the source for the lesson's middle section.",
    },
  },
  {
    id: "threejs-source-renderlists",
    type: "repo",
    title: "three.js — src/renderers/webgl/WebGLRenderLists.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/webgl/WebGLRenderLists.js",
    note: {
      vi: "painterSortStable và reversePainterSortStable — định nghĩa chính xác thứ tự vẽ opaque vs transparent bài này giải thích.",
      en: "painterSortStable and reversePainterSortStable — the exact definitions of the opaque vs transparent draw order this lesson explains.",
    },
  },
  {
    id: "threejs-source-webglstate",
    type: "repo",
    title: "three.js — src/renderers/webgl/WebGLState.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/webgl/WebGLState.js",
    note: {
      vi: "enable()/disable() bọc gl.enable/gl.disable bằng một cache trạng thái — nơi API WebGL thuần của Track 1 thực sự chạy bên dưới Three.js.",
      en: "enable()/disable() wrapping gl.enable/gl.disable behind a state cache — where the raw WebGL API from Track 1 actually runs underneath Three.js.",
    },
  },
  {
    id: "threejs-docs-object3d",
    type: "article",
    title: "Three.js Docs — Object3D",
    url: "https://threejs.org/docs/#api/en/core/Object3D",
    note: {
      vi: "Tài liệu chính thức tóm tắt API bề mặt của Object3D — đối chiếu với source để thấy chỗ docs mô tả Ý ĐỊNH còn source mô tả CƠ CHẾ.",
      en: "The official docs summarizing Object3D's surface API — compare against the source to see where docs describe INTENT and the source describes MECHANISM.",
    },
  },
];
