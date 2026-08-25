import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "trace-tonemapping-clamp-before-bloom",
    kind: "concept",
    prompt: {
      vi: `Một renderer có \`toneMapping = THREE.ACESFilmicToneMapping\` (mặc định của R3F). Cảnh có hai quả cầu cùng \`emissive\` màu trắng, \`emissiveIntensity = 2.4\`: quả cầu A dùng material mặc định (\`toneMapped: true\`), quả cầu B có \`toneMapped: false\`. \`UnrealBloomPass\` được đặt \`threshold = 1.3\`.

Xét HAI cách render: (X) qua \`EffectComposer\` — \`RenderPass → UnrealBloomPass → OutputPass\`; (Y) gọi thẳng \`renderer.render()\` ra màn hình, không composer.

Không chạy code: trong (X), pass bloom "thấy" mỗi quả cầu ở giá trị luminance bao nhiêu, quả nào bloom, và cờ \`toneMapped\` đóng vai trò gì? Trong (Y), hai quả cầu khác nhau thế nào trên màn hình? Bám đúng điều kiện thật trong \`WebGLPrograms.getParameters\`: tonemapping của material chỉ được giữ khi \`material.toneMapped\` VÀ render target hiện tại là \`null\` — và mọi đường cong tonemapping kết thúc bằng \`saturate()\`.`,
      en: `A renderer has \`toneMapping = THREE.ACESFilmicToneMapping\` (R3F's default). The scene has two spheres, both with white \`emissive\` and \`emissiveIntensity = 2.4\`: sphere A uses the default material (\`toneMapped: true\`), sphere B has \`toneMapped: false\`. \`UnrealBloomPass\` is set to \`threshold = 1.3\`.

Consider TWO ways to render: (X) through an \`EffectComposer\` — \`RenderPass → UnrealBloomPass → OutputPass\`; (Y) calling \`renderer.render()\` straight to the screen, no composer.

Without running any code: in (X), at what luminance does the bloom pass "see" each sphere, which spheres bloom, and what role does the \`toneMapped\` flag play? In (Y), how do the two spheres differ on screen? Follow the REAL condition in \`WebGLPrograms.getParameters\`: a material's tone mapping is kept only when \`material.toneMapped\` AND the current render target is \`null\` — and every tonemapping curve ends with \`saturate()\`.`,
    },
    hints: [
      {
        vi: "Trong (X), RenderPass render vào readBuffer — một render target. Điều kiện render-target-null fail cho CẢ HAI quả cầu, bất kể cờ toneMapped của từng material đang là gì.",
        en: "In (X), RenderPass renders into readBuffer — a render target. The render-target-null condition fails for BOTH spheres, regardless of what each material's toneMapped flag says.",
      },
      {
        vi: "Trong (Y), render thẳng ra màn hình — render target là null, điều kiện chỉ còn phụ thuộc cờ của từng material; và saturate() ở cuối đường cong quyết định giá trị hiển thị của quả cầu bị tonemap.",
        en: "In (Y), rendering straight to the screen — the render target is null, so the condition reduces to each material's own flag; and the saturate() ending the curve decides the tonemapped sphere's displayed value.",
      },
    ],
    checklist: [
      {
        vi: "Tôi trả lời đúng: trong (X), CẢ A lẫn B đều ghi 2.4 vào buffer và ĐỀU bloom (2.4 > 1.3) — toneMapped là no-op bên trong composer",
        en: "I correctly answer: in (X), BOTH A and B write 2.4 into the buffer and BOTH bloom (2.4 > 1.3) — toneMapped is a no-op inside the composer",
      },
      {
        vi: "Tôi trả lời đúng: trong (Y), A bị tonemap + saturate() nên hiển thị ~1.0 (tối hơn), B bỏ qua tonemap nên cháy sáng — và không có bloom nào vì không có composer",
        en: "I correctly answer: in (Y), A is tonemapped + saturate()d to ~1.0 (dimmer) while B skips tone mapping and blows out — and nothing blooms because there is no composer",
      },
      {
        vi: "Tôi chỉ đúng điều kiện render-target-null là cơ chế quyết định, không phải riêng cờ toneMapped",
        en: "I identify the render-target-null condition as the deciding mechanism, not the toneMapped flag alone",
      },
    ],
    solutionNote: {
      vi: `(X) Composer: \`RenderPass\` render vào \`readBuffer\` — một render target, không phải \`null\` — nên \`WebGLPrograms.getParameters\` ép toneMapping của MỌI material về \`NoToneMapping\`, cờ \`toneMapped\` không có tiếng nói. Cả A lẫn B ghi đúng luminance $2.4$ vào buffer HalfFloat; \`UnrealBloomPass\` đọc $2.4 > 1.3$ cho cả hai, nên CẢ HAI đều bloom như nhau. Tonemap chỉ xảy ra một lần, ở \`OutputPass\` cuối chuỗi.

(Y) Render thẳng ra màn hình: render target là \`null\`, điều kiện chỉ còn cờ material. A (\`toneMapped: true\`) đi qua \`ACESFilmicToneMapping(color)\` kết thúc bằng \`saturate()\` — hiển thị $\\approx 1.0$, tối hơn. B (\`toneMapped: false\`) bỏ qua tonemap — giá trị $2.4$ đổ thẳng, cháy sáng trắng. Và không có bloom nào cả: bloom là một pass của composer, (Y) không có composer.`,
      en: `(X) Composer: \`RenderPass\` renders into \`readBuffer\` — a render target, not \`null\` — so \`WebGLPrograms.getParameters\` forces EVERY material's toneMapping to \`NoToneMapping\`; the \`toneMapped\` flag gets no say. Both A and B write a raw luminance of $2.4$ into the HalfFloat buffer; \`UnrealBloomPass\` reads $2.4 > 1.3$ for both, so BOTH bloom identically. Tone mapping happens exactly once, in the chain-ending \`OutputPass\`.

(Y) Straight to the screen: the render target is \`null\`, so the condition reduces to each material's flag. A (\`toneMapped: true\`) runs through \`ACESFilmicToneMapping(color)\` ending in \`saturate()\` — displayed at $\\approx 1.0$, dimmer. B (\`toneMapped: false\`) skips tone mapping — the raw $2.4$ lands directly, blowing out to white. And nothing blooms at all: bloom is a composer pass, and (Y) has no composer.`,
    },
  },
  {
    id: "write-emitter-vs-surface-materials",
    kind: "code",
    prompt: {
      vi: `Viết hai hàm helper bằng \`three\`: \`makeEmitterMaterial(color, intensity)\` trả về một \`MeshStandardMaterial\` thật sự đóng góp HDR cho bloom trong một chuỗi composer (điểm mấu chốt: emissive vượt 1.0 — buffer composer vốn linear nên KHÔNG cần cờ nào để "giữ HDR"), và \`makeSurfaceMaterial(color)\` cho vật thể thường. Khác biệt duy nhất giữa hai helper là emissive, không phải tonemapping.`,
      en: `Write two helper functions using \`three\`: \`makeEmitterMaterial(color, intensity)\` returning a \`MeshStandardMaterial\` that genuinely contributes HDR to bloom inside a composer chain (the key: emissive above 1.0 — composer buffers are linear by construction, so NO flag is needed to "keep HDR"), and \`makeSurfaceMaterial(color)\` for an ordinary object. The only difference between the two helpers is emissive, not tonemapping.`,
    },
    starterCode: `import * as THREE from "three";

function makeEmitterMaterial(color: THREE.ColorRepresentation, intensity: number) {
  // TODO: base color can stay black/dim — the glow comes entirely from emissive
  // TODO: set emissive + emissiveIntensity so raw luminance can exceed 1.0
  // NOTE (not a TODO): no tonemapping opt-out needed — composer buffers
  // are linear HDR by construction; toneMapped only matters for
  // direct-to-screen rendering, where there is no bloom anyway
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
    // No toneMapped flag: inside a composer, RenderPass targets a render
    // target and three skips material tone mapping there anyway.
  });
}

function makeSurfaceMaterial(color: THREE.ColorRepresentation) {
  return new THREE.MeshStandardMaterial({
    color,
    // Nothing special: in-composer, neither material is tone-mapped at
    // draw time — the whole frame is tone-mapped once, in OutputPass.
  });
}`,
    hints: [
      {
        vi: "emissiveIntensity không có giới hạn trên trong API — giá trị > 1.0 đi thẳng vào buffer composer (vốn linear), và threshold > 1.0 của bloom bắt đúng nó.",
        en: "emissiveIntensity has no upper bound in the API — values above 1.0 flow straight into the composer buffer (linear by construction), and a bloom threshold above 1.0 catches exactly them.",
      },
      {
        vi: "makeSurfaceMaterial không cần gì đặc biệt — điểm khác biệt duy nhất giữa hai helper là bộ emissive (màu + cường độ), không phải cờ tonemapping nào.",
        en: "makeSurfaceMaterial needs nothing special — the only difference between the two helpers is the emissive setup (color + intensity), not any tonemapping flag.",
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
