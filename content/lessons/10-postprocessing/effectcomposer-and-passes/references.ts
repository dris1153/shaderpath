import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-effect-composer",
    type: "article",
    title: "Three.js Docs — EffectComposer",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/pages/EffectComposer.html",
    note: {
      vi: "Chữ ký constructor, addPass/render/setSize/dispose — tra cứu API chính thức đi cùng phần đọc mã nguồn thật trong bài.",
      en: "The constructor signature, addPass/render/setSize/dispose — the official API reference alongside this lesson's real source reading.",
    },
  },
  {
    id: "threejs-source-effect-composer",
    type: "repo",
    title: "three.js source — EffectComposer.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/EffectComposer.js",
    note: {
      vi: "Mã nguồn thật của vòng lặp render() và readBuffer/writeBuffer/swapBuffers trích dẫn trong bài — không phải diễn giải lại.",
      en: "The actual render() loop and readBuffer/writeBuffer/swapBuffers source quoted in this lesson — not a paraphrase.",
    },
  },
  {
    id: "threejs-source-pass-base-class",
    type: "repo",
    title: "three.js source — Pass.js (base Pass class + FullScreenQuad)",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/Pass.js",
    note: {
      vi: "Định nghĩa gốc của enabled/needsSwap/renderToScreen và FullScreenQuad dùng chung cho mọi pass — nguồn cho phần 'Anatomy của một pass'.",
      en: "The original definition of enabled/needsSwap/renderToScreen and the shared FullScreenQuad every pass reuses — the source for the 'Anatomy of a Pass' section.",
    },
  },
  {
    id: "webglfundamentals-image-processing-continued",
    type: "article",
    title: "WebGL Fundamentals — WebGL Image Processing Continued",
    authors: ["Gregg Tavares"],
    url: "https://webglfundamentals.org/webgl/lessons/webgl-image-processing-continued.html",
    note: {
      vi: "Giải thích ping-pong framebuffer bằng WebGL thuần, không qua Three.js — cùng ý tưởng readBuffer/writeBuffer nhưng viết tay từng bước.",
      en: "Explains framebuffer ping-ponging in raw WebGL, no Three.js involved — the same readBuffer/writeBuffer idea, hand-written step by step.",
    },
  },
];
