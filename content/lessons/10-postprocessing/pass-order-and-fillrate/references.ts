import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-outputpass-source",
    type: "repo",
    title: "three.js — OutputPass.js source",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/OutputPass.js",
    note: {
      vi: "Nguồn thật xác nhận OutputPass đọc renderer.toneMapping và renderer.outputColorSpace SỐNG mỗi lần render(), và doc comment nói rõ nên đặt nó ở cuối chuỗi pass — cơ sở trực tiếp của phần 'trật tự chuẩn' trong bài.",
      en: "The actual source confirming OutputPass reads renderer.toneMapping and renderer.outputColorSpace LIVE on every render() call, with a doc comment stating it should sit at the end of the pass chain — the direct basis for this lesson's 'canonical order' section.",
    },
  },
  {
    id: "threejs-unrealbloompass-source",
    type: "repo",
    title: "three.js — UnrealBloomPass.js source",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/UnrealBloomPass.js",
    note: {
      vi: "Nguồn xác nhận nMips = 5, mỗi mip giảm nửa độ phân giải mip trước, và mỗi mip chạy 2 lượt blur (ngang/dọc) — số liệu dùng để tính chi phí fillrate 'trung thực' của bloom trong bài.",
      en: "The source confirming nMips = 5, each mip halving the previous mip's resolution, and two blur passes (horizontal/vertical) per mip — the numbers this lesson's 'honest' bloom fillrate accounting is built on.",
    },
  },
  {
    id: "pmndrs-postprocessing-performance",
    type: "repo",
    title: "pmndrs/postprocessing — Performance",
    authors: ["Christian Cabrera (vanruesc) and contributors"],
    url: "https://github.com/pmndrs/postprocessing#performance",
    note: {
      vi: "Nguồn của tuyên bố 'EffectPass tự động gộp các effect thành một shader' — kiến trúc thay thế cho việc gộp pass thủ công mà bài này dạy.",
      en: "The source of the claim that 'EffectPass automatically organizes and merges effects' into one shader — the architectural alternative to the manual pass-merging this lesson teaches.",
    },
  },
  {
    id: "google-rendering-performance-fillrate",
    type: "article",
    title: "web.dev — Rendering Performance",
    authors: ["Paul Lewis", "Google Chrome team"],
    url: "https://web.dev/articles/rendering-performance",
    note: {
      vi: "Giải thích ngân sách frame time 60fps (~16.6ms) và vì sao mỗi thao tác toàn màn hình cạnh tranh trực tiếp trong ngân sách đó — bối cảnh chung cho phần đo frame time của bài.",
      en: "Explains the 60fps frame-time budget (~16.6ms) and why every full-screen operation competes directly inside it — the general context behind this lesson's frame-time measurement section.",
    },
  },
];
