import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-scrolltrigger-docs",
    type: "article",
    title: "ScrollTrigger | GSAP Docs",
    authors: ["GSAP (Webflow)"],
    url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/",
    note: {
      vi: "Tài liệu chính thức của ScrollTrigger — nguồn chuẩn cho start/end, scrub và cách gắn `scroller` khi trang dùng một container cuộn nội bộ thay vì window.",
      en: "The official ScrollTrigger docs — the canonical source for start/end, scrub, and wiring a custom `scroller` when the page scrolls inside a container instead of the window.",
    },
  },
  {
    id: "threejs-gltfloader-docs",
    type: "article",
    title: "Three.js Docs — GLTFLoader",
    url: "https://threejs.org/docs/#examples/en/loaders/GLTFLoader",
    note: {
      vi: "API load()/parse() và cách gắn setDRACOLoader/setKTX2Loader trước khi load — đúng thứ tự wiring bài này yêu cầu cho asset thật.",
      en: "The load()/parse() API and how to attach setDRACOLoader/setKTX2Loader before loading — the exact wiring order this project requires for a real asset.",
    },
  },
  {
    id: "gltf-transform-cli-docs",
    type: "article",
    title: "glTF Transform — CLI Documentation",
    authors: ["Don McCurdy"],
    url: "https://gltf-transform.dev/cli",
    note: {
      vi: "Nguồn cho lệnh CLI nén asset thật (`optimize --compress draco --texture-compress ktx2`) mà mốc 1 yêu cầu chạy trước khi model vào dự án.",
      en: "The source for the real asset-compression CLI command (`optimize --compress draco --texture-compress ktx2`) milestone 1 requires running before the model enters the project.",
    },
  },
  {
    id: "threejs-source-unreal-bloom-pass",
    type: "repo",
    title: "three.js source — UnrealBloomPass.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/UnrealBloomPass.js",
    note: {
      vi: "Mã nguồn thật của constructor (resolution, strength, radius, threshold) dùng trong chuỗi post-processing tiết chế ở mốc 5.",
      en: "The actual constructor source (resolution, strength, radius, threshold) used in the restrained post-processing chain at milestone 5.",
    },
  },
];
