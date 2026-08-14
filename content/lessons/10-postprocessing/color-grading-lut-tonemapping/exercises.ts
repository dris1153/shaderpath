import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "reinhard-desaturation-by-the-numbers",
    kind: "concept",
    prompt: {
      vi: `Một pixel highlight màu cam trong ảnh HDR (giá trị linear, chưa tone map) là $(R, G, B) = (6.0,\\ 1.5,\\ 0.2)$, với \`toneMappingExposure = 1\`. Không chạy code, tính $(R', G', B')$ sau Reinhard bằng công thức $c' = \\dfrac{c}{1 + c}$ cho từng kênh.

Sau đó trả lời: tỉ lệ $R:G:B$ trước tone map là bao nhiêu (rút gọn), và tỉ lệ $R':G':B'$ sau tone map là bao nhiêu? Từ hai tỉ lệ đó, giải thích cơ chế cụ thể khiến Reinhard "làm bạc màu" (desaturate) vùng sáng — không phải vì nó cố tình trộn màu về xám, mà vì lý do toán học nào trong công thức?`,
      en: `An orange highlight pixel in an HDR image (linear, not yet tone mapped) is $(R, G, B) = (6.0,\\ 1.5,\\ 0.2)$, with \`toneMappingExposure = 1\`. Without running code, compute $(R', G', B')$ after Reinhard using $c' = \\dfrac{c}{1 + c}$ per channel.

Then answer: what is the $R:G:B$ ratio before tone mapping (simplified), and what is the $R':G':B'$ ratio after? From those two ratios, explain the specific mechanism that makes Reinhard desaturate highlights — not because it intentionally blends toward gray, but because of what in the formula's math?`,
    },
    hints: [
      {
        vi: "Thay số trực tiếp: R' = 6/(1+6) = 6/7, G' = 1.5/2.5, B' = 0.2/1.2. Giữ dạng phân số hoặc ít nhất 3 chữ số thập phân.",
        en: "Substitute directly: R' = 6/(1+6) = 6/7, G' = 1.5/2.5, B' = 0.2/1.2. Keep fractions or at least 3 decimal places.",
      },
      {
        vi: "So sánh tỉ lệ kênh lớn nhất trên kênh nhỏ nhất TRƯỚC (6/0.2 = 30) và SAU (R'/B'). Hàm x/(1+x) tiệm cận 1 rất nhanh với x lớn — hai input rất khác nhau (6.0 và 60.0) đều cho ra gần 1, nén mất chênh lệch.",
        en: "Compare the largest-channel-over-smallest-channel ratio BEFORE (6/0.2 = 30) and AFTER (R'/B'). x/(1+x) approaches 1 quickly for large x — very different inputs (6.0 and 60.0) both land near 1, compressing away the difference.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng R' ≈ 0.857, G' = 0.6, B' ≈ 0.167",
        en: "I correctly computed R' ≈ 0.857, G' = 0.6, B' ≈ 0.167",
      },
      {
        vi: "Tôi tính đúng tỉ lệ trước ≈ 30 : 7.5 : 1 và sau ≈ 5.13 : 3.59 : 1 — biên độ co lại rõ rệt",
        en: "I correctly computed the before ratio ≈ 30 : 7.5 : 1 and after ≈ 5.13 : 3.59 : 1 — the spread visibly shrinks",
      },
      {
        vi: "Tôi giải thích được desaturation đến từ việc x/(1+x) nén MẠNH các giá trị lớn về gần 1 bất kể chênh lệch ban đầu, không phải một bước trộn màu riêng biệt nào trong công thức",
        en: "I explained that the desaturation comes from x/(1+x) heavily compressing large values toward 1 regardless of their original spread, not from any separate blending step in the formula",
      },
    ],
    solutionNote: {
      vi: `$R' = 6.0/(1+6.0) = 6/7 \\approx 0.857$, $G' = 1.5/(1+1.5) = 1.5/2.5 = 0.6$, $B' = 0.2/(1+0.2) = 0.2/1.2 \\approx 0.167$.

Tỉ lệ trước: $6.0 : 1.5 : 0.2 = 30 : 7.5 : 1$. Tỉ lệ sau: $0.857 : 0.6 : 0.167 \\approx 5.13 : 3.59 : 1$.

$x/(1+x)$ là hàm tiệm cận $1$ rất nhanh khi $x$ lớn: đạo hàm giảm theo $1/(1+x)^2$, nên hai input rất khác nhau (ví dụ $6.0$ và $60.0$) đều bị kéo gần sát $1$ như nhau. Vì tone map từng kênh độc lập (không qua luminance chung), kênh càng mạnh càng bị nén tỉ lệ mạnh hơn kênh yếu, khiến khoảng cách giữa các kênh thu hẹp lại — màu bạc dần về trắng ở vùng rất sáng, đúng như hiện tượng "desaturates highlights".`,
      en: `$R' = 6.0/(1+6.0) = 6/7 \\approx 0.857$, $G' = 1.5/(1+1.5) = 1.5/2.5 = 0.6$, $B' = 0.2/(1+0.2) = 0.2/1.2 \\approx 0.167$.

Ratio before: $6.0 : 1.5 : 0.2 = 30 : 7.5 : 1$. Ratio after: $0.857 : 0.6 : 0.167 \\approx 5.13 : 3.59 : 1$.

$x/(1+x)$ is a function that approaches $1$ very quickly as $x$ grows: its derivative falls off as $1/(1+x)^2$, so two very different inputs (say $6.0$ and $60.0$) both get pulled nearly as close to $1$ as each other. Because tone mapping runs per channel independently (not through a shared luminance), the stronger a channel is, the more its ratio gets compressed relative to a weaker channel — the spread between channels narrows, and color drains toward white in very bright regions, exactly what "desaturates highlights" describes.`,
    },
  },
  {
    id: "half-texel-lut-lookup",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`lutSampleCoord\` nhận màu \`rgb\` trong $[0,1]^3$ và \`lutSize\` (số cell mỗi trục), trả về toạ độ \`uvw\` để sample 3D LUT — ĐÃ áp dụng phép inset nửa-texel giống \`grading-pass.frag\`: $uvw = rgb \\cdot (1 - \\frac{1}{N}) + \\frac{1}{2N}$ với $N$ = \`lutSize\`. Sau đó dùng nó để chứng minh: với \`lutSize = 16\`, \`rgb = [0,0,0]\` phải map tới \`uvw = [1/32, 1/32, 1/32]\`, không phải \`[0,0,0]\`.`,
      en: `Write a \`lutSampleCoord\` function taking a \`rgb\` color in $[0,1]^3$ and \`lutSize\` (cells per axis), returning the \`uvw\` coordinate to sample a 3D LUT — WITH the half-texel inset from \`grading-pass.frag\` applied: $uvw = rgb \\cdot (1 - \\frac{1}{N}) + \\frac{1}{2N}$ where $N$ = \`lutSize\`. Then use it to show: with \`lutSize = 16\`, \`rgb = [0,0,0]\` must map to \`uvw = [1/32, 1/32, 1/32]\`, not \`[0,0,0]\`.`,
    },
    starterCode: `function lutSampleCoord(
  rgb: [number, number, number],
  lutSize: number,
): [number, number, number] {
  // TODO: cell = 1/lutSize, uvw = rgb * (1 - cell) + cell * 0.5
  return [0, 0, 0];
}

// Expected: lutSampleCoord([0, 0, 0], 16) => [1/32, 1/32, 1/32] (~0.03125 per axis)
console.log(lutSampleCoord([0, 0, 0], 16));`,
    solutionCode: `function lutSampleCoord(
  rgb: [number, number, number],
  lutSize: number,
): [number, number, number] {
  const cell = 1 / lutSize;
  const [r, g, b] = rgb;
  return [
    r * (1 - cell) + cell * 0.5,
    g * (1 - cell) + cell * 0.5,
    b * (1 - cell) + cell * 0.5,
  ];
}

// lutSampleCoord([0, 0, 0], 16) => [0.03125, 0.03125, 0.03125] = [1/32, 1/32, 1/32]
console.log(lutSampleCoord([0, 0, 0], 16));`,
    hints: [
      {
        vi: "cell = 1/lutSize là bề rộng UV của MỘT cell LUT. Nửa cell = cell/2 chính là khoảng cách từ mép texture tới tâm cell đầu tiên — đúng logic pixelToUV ở Track 0, chỉ đổi từ pixel-count sang lut-cell-count.",
        en: "cell = 1/lutSize is the UV width of ONE LUT cell. Half a cell = cell/2 is exactly the distance from the texture edge to the first cell's center — the same logic as Track 0's pixelToUV, just swapping pixel count for lut-cell count.",
      },
      {
        vi: "Nhân rgb với (1 - cell) TRƯỚC khi cộng cell/2 — thứ tự này nén dải [0,1] vào đúng bên trong [cell/2, 1 - cell/2] thay vì tràn ra ngoài mép texture ở đầu 1.0.",
        en: "Multiply rgb by (1 - cell) BEFORE adding cell/2 — this order compresses the [0,1] range to land exactly inside [cell/2, 1 - cell/2] instead of overshooting the texture edge at the 1.0 end.",
      },
    ],
    checklist: [
      {
        vi: "lutSampleCoord([0,0,0], 16) trả về [0.03125, 0.03125, 0.03125], không phải [0,0,0]",
        en: "lutSampleCoord([0,0,0], 16) returns [0.03125, 0.03125, 0.03125], not [0,0,0]",
      },
      {
        vi: "lutSampleCoord([1,1,1], 16) trả về [0.96875, 0.96875, 0.96875], không phải [1,1,1]",
        en: "lutSampleCoord([1,1,1], 16) returns [0.96875, 0.96875, 0.96875], not [1,1,1]",
      },
      {
        vi: "Hàm áp dụng đúng thứ tự nhân-rồi-cộng (không phải cộng nửa-texel rồi mới nhân)",
        en: "The function applies the correct multiply-then-add order (not add-half-texel-then-multiply)",
      },
    ],
  },
];
