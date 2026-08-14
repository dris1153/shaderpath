import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-animationmixer",
    type: "article",
    title: "Three.js Docs — AnimationMixer",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/animation/AnimationMixer",
    note: {
      vi: "Tài liệu chính thức của lớp runtime phát clip — tra cứu chính xác chữ ký `clipAction`, `update(delta)` và `stopAllAction` dùng trong bài.",
      en: "The official reference for the clip-playback runtime — the exact signatures for `clipAction`, `update(delta)` and `stopAllAction` used in this lesson.",
    },
  },
  {
    id: "threejs-docs-animationaction",
    type: "article",
    title: "Three.js Docs — AnimationAction",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/animation/AnimationAction",
    note: {
      vi: "Liệt kê đầy đủ `.weight`, `.timeScale`, `.setLoop`, `.clampWhenFinished` và `.crossFadeTo` — đúng bề mặt API bài này dùng cho play state và crossfade.",
      en: "Documents `.weight`, `.timeScale`, `.setLoop`, `.clampWhenFinished` and `.crossFadeTo` in full — exactly the API surface this lesson uses for play state and crossfading.",
    },
  },
  {
    id: "threejs-docs-animationclip",
    type: "article",
    title: "Three.js Docs — AnimationClip",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/animation/AnimationClip",
    note: {
      vi: "Định nghĩa chính xác cấu trúc `name`/`duration`/`tracks` và constructor dùng để dựng clip bằng tay trong bài.",
      en: "The precise `name`/`duration`/`tracks` structure and the constructor this lesson uses to hand-build a clip.",
    },
  },
  {
    id: "threejs-example-skinning-blending",
    type: "repo",
    title: "Three.js Example — webgl_animation_skinning_blending",
    authors: ["three.js contributors"],
    url: "https://threejs.org/examples/#webgl_animation_skinning_blending",
    note: {
      vi: "Demo chính thức crossfade nhiều action (idle/walk/run) bằng weight trên cùng một mixer — bản đầy đủ của cơ chế được rút gọn ở bài này.",
      en: "The official demo crossfading several actions (idle/walk/run) via weight on the same mixer — the full-scale version of the mechanism this lesson distills.",
    },
  },
];
