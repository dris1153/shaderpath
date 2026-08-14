import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "footprint-ratio-1024-vs-4096-half-float",
    kind: "concept",
    prompt: {
      vi: `Tính dung lượng GPU thật (theo công thức $B = W \\times H \\times b \\times k$ của bài học) cho hai texture, cả hai đều BẬT mipmap: (1) một texture RGBA8 $1024\\times1024$, và (2) một texture half-float RGBA $4096\\times4096$. Sau đó tính tỉ lệ dung lượng giữa (2) và (1), và giải thích tỉ lệ đó bằng đúng hai yếu tố tạo ra nó — đừng chỉ nói "4096 gấp 4 lần 1024 nên tốn gấp 4 lần".`,
      en: `Compute the real GPU footprint (using this lesson's $B = W \\times H \\times b \\times k$ formula) for two textures, BOTH with mipmaps on: (1) a $1024\\times1024$ RGBA8 texture, and (2) a $4096\\times4096$ half-float RGBA texture. Then compute the ratio between (2) and (1), and explain that ratio using the exact two factors that produce it — don't just say "4096 is 4x bigger than 1024 so it costs 4x more."`,
    },
    hints: [
      {
        vi: "b của RGBA8 là 4, b của half-float là 8 — đây là một yếu tố nhân riêng, độc lập với kích thước.",
        en: "RGBA8's b is 4, half-float's is 8 — that's one separate multiplying factor, independent of size.",
      },
      {
        vi: "Tăng cạnh từ 1024 lên 4096 là gấp 4 lần MỖI chiều — số texel (W×H) tăng theo bình phương của tỉ lệ cạnh, tức gấp 16 lần, không phải 4.",
        en: "Going from 1024 to 4096 is 4x per side — texel count (W×H) scales with the SQUARE of that ratio, i.e. 16x, not 4x.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng (1) ≈ 5,33 MB và (2) ≈ 170,67 MB",
        en: "Correctly computes (1) ≈ 5.33 MB and (2) ≈ 170.67 MB",
      },
      {
        vi: "Tính đúng tỉ lệ ≈ 32×",
        en: "Correctly computes the ratio ≈ 32×",
      },
      {
        vi: "Giải thích đúng 32× = 16× (diện tích, do cạnh gấp 4) × 2× (half-float so với RGBA8), không phải một con số đơn lẻ đoán mò",
        en: "Correctly explains 32× = 16× (area, from a 4× side ratio) × 2× (half-float vs RGBA8), not a single guessed number",
      },
    ],
    solutionCode: `// (1) RGBA8 1024²: base = 1024*1024*4 = 4,194,304 B = 4 MB; ×4/3 ≈ 5.33 MB
// (2) half-float 4096²: base = 4096*4096*8 = 134,217,728 B = 128 MB; ×4/3 ≈ 170.67 MB
//
// ratio = 170.67 / 5.33 ≈ 32
//
// The 4/3 mip factor is IDENTICAL on both sides, so it cancels out of the
// ratio entirely. What's left: (4096/1024)^2 = 4^2 = 16 (area scales with
// the SQUARE of the side ratio) times (8/4) = 2 (half-float bytes vs
// RGBA8) = 16 * 2 = 32.`,
  },
  {
    id: "implement-texture-footprint-formula",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`textureFootprintMB(sizePx, format, mipmaps)\` áp đúng công thức $B = W \\times H \\times b \\times k$ của bài học (texture vuông nên $W=H=$\`sizePx\`), trả về megabyte (chia cho $1024^2$), làm tròn 2 chữ số thập phân.`,
      en: `Write a \`textureFootprintMB(sizePx, format, mipmaps)\` function applying this lesson's $B = W \\times H \\times b \\times k$ formula (the texture is square, so $W=H=$\`sizePx\`), returning megabytes (divide by $1024^2$), rounded to 2 decimal places.`,
    },
    starterCode: `type TextureFormat = "rgba8" | "half";

// bytes per texel: 4 for RGBA8 (1 byte/channel), 8 for half-float RGBA (2 bytes/channel)
const BYTES_PER_TEXEL: Record<TextureFormat, number> = { rgba8: 4, half: 8 };

function textureFootprintMB(
  sizePx: number,
  format: TextureFormat,
  mipmaps: boolean,
): number {
  // TODO: base = sizePx * sizePx * BYTES_PER_TEXEL[format]
  // TODO: apply the 4/3 mip tax when mipmaps is true
  // TODO: convert bytes -> MB (divide by 1024*1024) and round to 2 decimals
  return 0;
}`,
    solutionCode: `type TextureFormat = "rgba8" | "half";

const BYTES_PER_TEXEL: Record<TextureFormat, number> = { rgba8: 4, half: 8 };

function textureFootprintMB(
  sizePx: number,
  format: TextureFormat,
  mipmaps: boolean,
): number {
  const base = sizePx * sizePx * BYTES_PER_TEXEL[format];
  const bytes = mipmaps ? base * (4 / 3) : base;
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}`,
    hints: [
      {
        vi: "`sizePx * sizePx` là số texel — nhân thêm byte/texel của đúng format trước khi tính tới mipmap.",
        en: "`sizePx * sizePx` is the texel count — multiply by the format's bytes-per-texel BEFORE applying the mip factor.",
      },
      {
        vi: "Làm tròn 2 chữ số bằng `Math.round(x * 100) / 100`, đừng dùng `toFixed` vì hàm cần trả về `number` chứ không phải `string`.",
        en: "Round to 2 decimals with `Math.round(x * 100) / 100` — don't reach for `toFixed`, it returns a `string`, not a `number`.",
      },
    ],
    checklist: [
      {
        vi: '`textureFootprintMB(2048, "rgba8", false)` trả về 16',
        en: '`textureFootprintMB(2048, "rgba8", false)` returns 16',
      },
      {
        vi: '`textureFootprintMB(2048, "rgba8", true)` trả về ≈21.33',
        en: '`textureFootprintMB(2048, "rgba8", true)` returns ≈21.33',
      },
      {
        vi: '`textureFootprintMB(4096, "half", true)` trả về ≈170.67',
        en: '`textureFootprintMB(4096, "half", true)` returns ≈170.67',
      },
    ],
  },
];
