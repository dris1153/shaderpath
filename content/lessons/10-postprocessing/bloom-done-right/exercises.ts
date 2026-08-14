import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "trace-tonemapping-clamp-before-bloom",
    kind: "concept",
    prompt: {
      vi: `Một renderer có \`toneMapping = THREE.ACESFilmicToneMapping\` (mặc định của R3F). Cảnh có hai quả cầu cùng \`emissive\` màu trắng, \`emissiveIntensity = 2.4\`: quả cầu A dùng material mặc định (\`toneMapped: true\`), quả cầu B có \`toneMapped: false\`. \`UnrealBloomPass\` được đặt \`threshold = 1.3\`.

Không chạy code, hãy giải thích quả cầu nào thật sự bị pass bloom "nhìn thấy" là đủ sáng để phát glow, và vì sao — bám theo đúng điều kiện \`toneMapping = material.toneMapped ? renderer.toneMapping : NoToneMapping\` và việc mọi đường cong tonemapping kết thúc bằng \`saturate()\`.`,
      en: `A renderer has \`toneMapping = THREE.ACESFilmicToneMapping\` (R3F's default). The scene has two spheres, both with white \`emissive\` and \`emissiveIntensity = 2.4\`: sphere A uses the default material (\`toneMapped: true\`), sphere B has \`toneMapped: false\`. \`UnrealBloomPass\` is set to \`threshold = 1.3\`.

Without running any code, explain which sphere the bloom pass actually "sees" as bright enough to glow, and why — follow exactly the condition \`toneMapping = material.toneMapped ? renderer.toneMapping : NoToneMapping\` and the fact that every tonemapping curve ends with \`saturate()\`.`,
    },
    hints: [
      {
        vi: "Với sphere A, material.toneMapped=true nên toneMapping thật sự áp dụng = renderer.toneMapping (ACESFilmic) — luminance 2.4 bị saturate() kẹp về gần 1.0 ngay trong RenderPass, trước khi bloom kịp đọc.",
        en: "For sphere A, material.toneMapped=true so the effective toneMapping = renderer.toneMapping (ACESFilmic) — a luminance of 2.4 gets clamped near 1.0 by saturate() right inside RenderPass, before bloom ever reads it.",
      },
      {
        vi: "Với sphere B, toneMapped=false ép toneMapping thành NoToneMapping cho riêng material đó — giá trị linear 2.4 đi thẳng vào buffer không bị chạm tới, dù renderer chung vẫn đang bật ACESFilmic cho mọi thứ khác.",
        en: "For sphere B, toneMapped=false forces toneMapping to NoToneMapping for that specific material — the raw linear value 2.4 goes straight into the buffer untouched, even though the renderer overall still has ACESFilmic on for everything else.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích đúng sphere A bị clamp về gần 1.0, thấp hơn threshold 1.3, nên KHÔNG bloom",
        en: "I correctly explain sphere A gets clamped near 1.0, below the 1.3 threshold, so it does NOT bloom",
      },
      {
        vi: "Tôi giải thích đúng sphere B giữ nguyên giá trị 2.4, vượt threshold 1.3, nên CÓ bloom",
        en: "I correctly explain sphere B keeps its raw 2.4 value, above the 1.3 threshold, so it DOES bloom",
      },
      {
        vi: "Tôi nêu được saturate()/clamp trong đường cong tonemapping là nguyên nhân cơ chế, không chỉ nói chung chung 'A bị tối hơn'",
        en: "I identify saturate()/clamp inside the tonemapping curve as the mechanism, not just a vague 'A looks dimmer' explanation",
      },
    ],
    solutionCode: `// Sphere A (toneMapped: true, mặc định):
// toneMapping hiệu lực = material.toneMapped ? renderer.toneMapping : NoToneMapping
//                       = true ? ACESFilmicToneMapping : ...
//                       = ACESFilmicToneMapping
// -> fragment shader gọi ACESFilmicToneMapping(color), hàm này return saturate(color)
// -> luminance 2.4 bị clamp về xấp xỉ ~1.0 trước khi ghi vào readBuffer
// -> UnrealBloomPass đọc luminance ~1.0 < threshold 1.3 -> KHÔNG bloom

// Sphere B (toneMapped: false):
// toneMapping hiệu lực = false ? ... : NoToneMapping = NoToneMapping
// -> #if defined(TONE_MAPPING) là false cho riêng material này -> không saturate
// -> luminance 2.4 đi thẳng vào buffer HalfFloat, nguyên vẹn
// -> UnrealBloomPass đọc luminance 2.4 > threshold 1.3 -> CÓ bloom`,
  },
  {
    id: "write-emitter-vs-surface-materials",
    kind: "code",
    prompt: {
      vi: `Viết hai hàm helper bằng \`three\`: \`makeEmitterMaterial(color, intensity)\` trả về một \`MeshStandardMaterial\` thật sự đóng góp vào bloom HDR (giữ nguyên cường độ linear, không bị tonemapping kẹp), và \`makeSurfaceMaterial(color)\` cho vật thể thường (được tonemap bình thường như mọi vật khác trong cảnh).`,
      en: `Write two helper functions using \`three\`: \`makeEmitterMaterial(color, intensity)\` returning a \`MeshStandardMaterial\` that genuinely contributes to HDR bloom (keeps its raw linear intensity, never clamped by tonemapping), and \`makeSurfaceMaterial(color)\` for an ordinary object (tonemapped normally like everything else in the scene).`,
    },
    starterCode: `import * as THREE from "three";

function makeEmitterMaterial(color: THREE.ColorRepresentation, intensity: number) {
  // TODO: base color can stay black/dim — the glow comes entirely from emissive
  // TODO: set emissive + emissiveIntensity so raw luminance can exceed 1.0
  // TODO: opt this material OUT of the renderer's tonemapping clamp
  return new THREE.MeshStandardMaterial({ color });
}

function makeSurfaceMaterial(color: THREE.ColorRepresentation) {
  // TODO: an ordinary material — tonemapped normally, no special emissive setup
  return new THREE.MeshStandardMaterial({ color });
}`,
    solutionCode: `import * as THREE from "three";

function makeEmitterMaterial(color: THREE.ColorRepresentation, intensity: number) {
  return new THREE.MeshStandardMaterial({
    color: 0x000000, // no diffuse contribution — the glow is entirely emissive
    emissive: color,
    emissiveIntensity: intensity, // can exceed 1.0 — that's the point
    toneMapped: false, // opts OUT of renderer.toneMapping's saturate() clamp
  });
}

function makeSurfaceMaterial(color: THREE.ColorRepresentation) {
  return new THREE.MeshStandardMaterial({
    color,
    // toneMapped defaults to true — tonemapped and clamped like the rest
    // of the scene, exactly as it should be for a non-emitting surface.
  });
}`,
    hints: [
      {
        vi: "emissiveIntensity không có giới hạn trên trong API — giá trị >1.0 hợp lệ, chỉ là bình thường bị tonemapping kẹp lại nếu không set toneMapped: false.",
        en: "emissiveIntensity has no upper bound in the API — values above 1.0 are valid, they just get clamped by tonemapping unless you set toneMapped: false.",
      },
      {
        vi: "makeSurfaceMaterial không cần đổi gì đặc biệt — toneMapped mặc định đã đúng là true, đó chính là điểm khác biệt cần thể hiện so với makeEmitterMaterial.",
        en: "makeSurfaceMaterial doesn't need anything special — toneMapped already defaults to true, and that default IS the contrast this exercise wants you to show against makeEmitterMaterial.",
      },
    ],
    checklist: [
      {
        vi: "makeEmitterMaterial đặt toneMapped: false một cách tường minh",
        en: "makeEmitterMaterial explicitly sets toneMapped: false",
      },
      {
        vi: "makeEmitterMaterial dùng emissive + emissiveIntensity thay vì chỉ đổi color",
        en: "makeEmitterMaterial uses emissive + emissiveIntensity instead of just changing color",
      },
      {
        vi: "makeSurfaceMaterial không set toneMapped (giữ mặc định true), thể hiện đúng sự tương phản với emitter",
        en: "makeSurfaceMaterial leaves toneMapped unset (default true), correctly showing the contrast against the emitter",
      },
    ],
  },
];
