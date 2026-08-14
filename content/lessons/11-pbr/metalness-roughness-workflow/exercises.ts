import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "rerouting-by-hand",
    kind: "concept",
    prompt: {
      vi: `Albedo (màu bạn sơn vào baseColorTexture) là $(0.8, 0.5, 0.2)$ — một tông đồng nhạt. Không chạy code: (1) tính $F_0$ và diffuse contribution tại \`metalness = 0\`; (2) tính lại tại \`metalness = 1\`. Three.js thực ra không nhảy đột ngột giữa hai cực trị mà nội suy tuyến tính (đúng theo shader chunk \`lights_physical_fragment\`): $F_0 = 0.04(1-m) + \\text{albedo} \\cdot m$ và $\\text{diffuse} = \\text{albedo}(1-m)$. (3) Tính cả hai tại $m = 0.5$.

Sau đó giải thích: kết quả ở bước (3) — dù tính đúng theo đúng công thức Three.js dùng — vì sao vẫn là một tổ hợp "không vật lý" nếu sơn cố định cho cả một bề mặt lớn, thay vì chỉ ở ranh giới một mask?`,
      en: `Albedo (the color painted into baseColorTexture) is $(0.8, 0.5, 0.2)$ — a light bronze tone. Without running code: (1) compute $F_0$ and the diffuse contribution at \`metalness = 0\`; (2) compute both again at \`metalness = 1\`. Three.js doesn't actually jump discontinuously between the two extremes — it linearly interpolates (per the \`lights_physical_fragment\` shader chunk): $F_0 = 0.04(1-m) + \\text{albedo} \\cdot m$ and $\\text{diffuse} = \\text{albedo}(1-m)$. (3) Compute both at $m = 0.5$.

Then explain: why is the result from step (3) — even though it's computed with the exact formula Three.js uses — still a "non-physical" combination if painted as a fixed value across a large surface, rather than only at a mask boundary?`,
    },
    hints: [
      {
        vi: "Ở $m=0$: $F_0 = (0.04, 0.04, 0.04)$ hằng số, diffuse = albedo nguyên vẹn. Ở $m=1$: $F_0 = \\text{albedo}$, diffuse = $(0,0,0)$.",
        en: "At $m=0$: $F_0 = (0.04, 0.04, 0.04)$, a constant, diffuse = albedo unchanged. At $m=1$: $F_0 = \\text{albedo}$, diffuse = $(0,0,0)$.",
      },
      {
        vi: "Ở $m=0.5$, tính riêng từng kênh R, G, B: $F_0^R = 0.04 \\times 0.5 + 0.8 \\times 0.5$, tương tự cho G, B.",
        en: "At $m=0.5$, compute each of R, G, B separately: $F_0^R = 0.04 \\times 0.5 + 0.8 \\times 0.5$, and similarly for G, B.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng hai trường hợp cực trị: $m=0$ → $F_0=(0.04,0.04,0.04)$, diffuse$=(0.8,0.5,0.2)$; $m=1$ → $F_0=(0.8,0.5,0.2)$, diffuse$=(0,0,0)$",
        en: "I correctly computed both extremes: $m=0$ → $F_0=(0.04,0.04,0.04)$, diffuse$=(0.8,0.5,0.2)$; $m=1$ → $F_0=(0.8,0.5,0.2)$, diffuse$=(0,0,0)$",
      },
      {
        vi: "Tôi tính đúng $m=0.5$: $F_0 \\approx (0.42, 0.27, 0.12)$, diffuse$=(0.4, 0.25, 0.1)$",
        en: "I correctly computed $m=0.5$: $F_0 \\approx (0.42, 0.27, 0.12)$, diffuse$=(0.4, 0.25, 0.1)$",
      },
      {
        vi: "Tôi giải thích được: kết quả vừa có phản xạ tinted-nhạt (không xám 0.04 thuần như nhựa) vừa còn diffuse dư (kim loại thật không có) — không khớp vật liệu thật nào",
        en: "I can explain that the result has both a lightly-tinted reflectance (not a pure gray 0.04 like plastic) AND leftover diffuse (real metals have none) — matching no real material",
      },
    ],
    solutionCode: `// m = 0: F0 = (0.04, 0.04, 0.04)              diffuse = (0.8, 0.5, 0.2)
// m = 1: F0 = (0.8, 0.5, 0.2)                  diffuse = (0, 0, 0)
//
// m = 0.5, per channel: F0 = 0.04*0.5 + albedo*0.5, diffuse = albedo*0.5
// F0.r = 0.02 + 0.40 = 0.42   diffuse.r = 0.40
// F0.g = 0.02 + 0.25 = 0.27   diffuse.g = 0.25
// F0.b = 0.02 + 0.10 = 0.12   diffuse.b = 0.10
//
// Ket qua nay vua phan xa mau dong nhat (tinted, khong xam 0.04 nhu nhua
// that) vua con diffuse du (kim loai that = 0) -- khong khop bat ky vat
// lieu don le nao. Chi hop ly khi day la MOT PIXEL o ranh gioi mask giua
// vung kim loai sach va vung son/ri set ben canh, khong phai gia tri co
// dinh cho toan bo be mat lon.`,
  },
  {
    id: "resolve-material-inputs",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`resolveMaterialInputs(albedo, metalness)\` trả về \`{ f0, diffuse }\`, cài đúng hai công thức Three.js dùng trong \`lights_physical_fragment\`: \`f0 = mix(0.04, albedo, metalness)\` và \`diffuse = albedo * (1 - metalness)\`, áp dụng độc lập cho từng kênh R, G, B của \`albedo\`.`,
      en: `Write a \`resolveMaterialInputs(albedo, metalness)\` function returning \`{ f0, diffuse }\`, implementing the exact two formulas Three.js uses in \`lights_physical_fragment\`: \`f0 = mix(0.04, albedo, metalness)\` and \`diffuse = albedo * (1 - metalness)\`, applied independently to each of albedo's R, G, B channels.`,
    },
    starterCode: `type RGB = [number, number, number];

const DIELECTRIC_F0 = 0.04;

function resolveMaterialInputs(
  albedo: RGB,
  metalness: number,
): { f0: RGB; diffuse: RGB } {
  // TODO: f0 = mix(DIELECTRIC_F0, albedo[i], metalness) per channel
  const f0: RGB = [0, 0, 0];

  // TODO: diffuse = albedo[i] * (1 - metalness) per channel
  const diffuse: RGB = [0, 0, 0];

  return { f0, diffuse };
}`,
    solutionCode: `type RGB = [number, number, number];

const DIELECTRIC_F0 = 0.04;

function resolveMaterialInputs(
  albedo: RGB,
  metalness: number,
): { f0: RGB; diffuse: RGB } {
  const m = Math.min(Math.max(metalness, 0), 1);

  const f0 = albedo.map(
    (c) => DIELECTRIC_F0 * (1 - m) + c * m,
  ) as RGB;

  const diffuse = albedo.map((c) => c * (1 - m)) as RGB;

  return { f0, diffuse };
}`,
    hints: [
      {
        vi: "`mix(a, b, t)` trong GLSL là `a * (1 - t) + b * t` — viết lại y hệt bằng JS cho từng phần tử của mảng albedo.",
        en: "GLSL's `mix(a, b, t)` is `a * (1 - t) + b * t` — replicate that exactly in JS for each element of the albedo array.",
      },
      {
        vi: "Diffuse KHÔNG dùng F0 — nó chỉ scale albedo gốc theo `(1 - metalness)`, một công thức hoàn toàn tách biệt.",
        en: "Diffuse does NOT involve F0 — it just scales the raw albedo by `(1 - metalness)`, a completely separate formula.",
      },
    ],
    checklist: [
      {
        vi: "`resolveMaterialInputs([0.8,0.5,0.2], 0)` trả về `f0=[0.04,0.04,0.04]`, `diffuse=[0.8,0.5,0.2]`",
        en: "`resolveMaterialInputs([0.8,0.5,0.2], 0)` returns `f0=[0.04,0.04,0.04]`, `diffuse=[0.8,0.5,0.2]`",
      },
      {
        vi: "`resolveMaterialInputs([0.8,0.5,0.2], 1)` trả về `f0=[0.8,0.5,0.2]`, `diffuse=[0,0,0]`",
        en: "`resolveMaterialInputs([0.8,0.5,0.2], 1)` returns `f0=[0.8,0.5,0.2]`, `diffuse=[0,0,0]`",
      },
      {
        vi: "`resolveMaterialInputs([0.8,0.5,0.2], 0.5)` khớp với kết quả tính tay ở bài tập concept phía trên",
        en: "`resolveMaterialInputs([0.8,0.5,0.2], 0.5)` matches the by-hand result from the concept exercise above",
      },
    ],
  },
];
