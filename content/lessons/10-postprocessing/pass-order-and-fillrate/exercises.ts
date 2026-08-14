import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "dpr-fillrate-multiplier",
    kind: "concept",
    prompt: {
      vi: `Một demo có canvas CSS-size $1280 \\times 720$. Thiết bị báo \`devicePixelRatio = 2\`, nên render target thật là $2560 \\times 1440$ texel. Chuỗi hậu kỳ có 4 pass đơn giản (mỗi pass 1 lần đọc + 1 lần ghi) trên buffer HDR nửa-float (16 byte/texel cho cả đọc lẫn ghi, theo đúng mô hình trong bài).

Tính tổng số byte di chuyển mỗi frame ở DPR 2, rồi ở DPR 1 (cùng canvas, cùng 4 pass). Tính tỉ lệ giữa hai kết quả, và giải thích bằng một câu vì sao tỉ lệ đó KHÔNG phụ thuộc vào số pass trong chuỗi.`,
      en: `A demo has CSS canvas size $1280 \\times 720$. The device reports \`devicePixelRatio = 2\`, so the real render target is $2560 \\times 1440$ texels. The postfx chain has 4 simple passes (each one read + one write) on a half-float HDR buffer (16 bytes/texel for read+write combined, matching this lesson's model).

Compute the total bytes moved per frame at DPR 2, then at DPR 1 (same canvas, same 4 passes). Compute the ratio between the two results, and explain in one sentence why that ratio does NOT depend on how many passes are in the chain.`,
    },
    hints: [
      {
        vi: "DPR 2: texel = 2560*1440 = 3.686.400; 1 pass ≈ 3.686.400*16 ≈ 58,98MB; 4 pass ≈ 235,9MB. DPR 1: texel = 1280*720 = 921.600; 4 pass ≈ 58,98MB.",
        en: "DPR 2: texels = 2560*1440 = 3,686,400; 1 pass ≈ 3,686,400*16 ≈ 58.98MB; 4 passes ≈ 235.9MB. DPR 1: texels = 1280*720 = 921,600; 4 passes ≈ 58.98MB.",
      },
      {
        vi: "Số pass là một thừa số nhân CHUNG cho cả hai phép tính (DPR 1 và DPR 2) — nó triệt tiêu khi lấy tỉ lệ, chỉ còn lại đúng $(\\text{DPR}_2/\\text{DPR}_1)^2$.",
        en: "The pass count is a COMMON multiplying factor in both computations (DPR 1 and DPR 2) — it cancels out when you take the ratio, leaving exactly $(\\text{DPR}_2/\\text{DPR}_1)^2$.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng tổng byte ở DPR 2 ≈ 235,9MB/frame và ở DPR 1 ≈ 58,98MB/frame",
        en: "Correctly computed total bytes at DPR 2 ≈ 235.9MB/frame and at DPR 1 ≈ 58.98MB/frame",
      },
      {
        vi: "Tính đúng tỉ lệ = 4, đúng bằng $2^2$ (bình phương của tỉ lệ DPR)",
        en: "Correctly computed the ratio = 4, exactly $2^2$ (the square of the DPR ratio)",
      },
      {
        vi: "Giải thích được số pass là thừa số chung nên triệt tiêu khi lấy tỉ lệ — tỉ lệ chỉ phụ thuộc DPR",
        en: "Explained that the pass count is a common factor that cancels in the ratio — the ratio depends on DPR alone",
      },
    ],
  },
  {
    id: "estimate-chain-bytes",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`estimateChainBytes\` ước lượng tổng byte di chuyển mỗi frame cho một chuỗi pass, theo đúng mô hình "trung thực" của bài: mỗi pass có \`resScale\` (tỉ lệ độ phân giải so với full-res, ví dụ bloom's mip chạy ở 0.5, 0.25...) và \`draws\` (số lượt đọc+ghi ở độ phân giải đó). Байte mỗi texel cố định 16 (đọc 8 + ghi 8, HDR half-float).`,
      en: `Write \`estimateChainBytes\`, estimating total bytes moved per frame for a pass chain using this lesson's "honest" model: each pass has a \`resScale\` (resolution scale relative to full-res, e.g. a bloom mip running at 0.5, 0.25...) and \`draws\` (number of read+write draws at that scale). Bytes per texel is fixed at 16 (8 read + 8 write, HDR half-float).`,
    },
    starterCode: `interface PassCost {
  resScale: number; // 1 = full res, 0.5 = half width AND half height, etc.
  draws: number;    // number of read+write draws at that resolution
}

function estimateChainBytes(
  width: number,
  height: number,
  passes: PassCost[],
): number {
  // TODO: for each pass, texels = width*resScale * height*resScale,
  // bytes = texels * 16 * draws — sum across all passes.
  return 0;
}`,
    solutionCode: `interface PassCost {
  resScale: number;
  draws: number;
}

function estimateChainBytes(
  width: number,
  height: number,
  passes: PassCost[],
): number {
  return passes.reduce((total, pass) => {
    const texels = width * pass.resScale * (height * pass.resScale);
    return total + texels * 16 * pass.draws;
  }, 0);
}`,
    hints: [
      {
        vi: "resScale áp cho CẢ width lẫn height — texel count giảm theo BÌNH PHƯƠNG của resScale, giống hệt lý do DPR gây ra số nhân bình phương ở phần lý thuyết.",
        en: "resScale applies to BOTH width and height — texel count shrinks by the SQUARE of resScale, exactly why DPR produces a squared multiplier in the theory section.",
      },
      {
        vi: "Một pass đơn giản là { resScale: 1, draws: 1 }. Bloom xấp xỉ theo bài có thể mô hình bằng nhiều entry resScale nhỏ dần (0.5, 0.25, 0.125...), mỗi entry draws: 2 (ngang + dọc).",
        en: "A simple pass is { resScale: 1, draws: 1 }. This lesson's bloom approximation can be modeled as several entries with shrinking resScale (0.5, 0.25, 0.125...), each with draws: 2 (horizontal + vertical).",
      },
    ],
    checklist: [
      {
        vi: "estimateChainBytes(1920, 1080, [{resScale:1, draws:1}]) trả về đúng 1920*1080*16 = 33.177.600",
        en: "estimateChainBytes(1920, 1080, [{resScale:1, draws:1}]) returns exactly 1920*1080*16 = 33,177,600",
      },
      {
        vi: "Gọi với resScale: 0.5 trả về đúng 1/4 giá trị so với resScale: 1 (cùng draws)",
        en: "Calling with resScale: 0.5 returns exactly 1/4 the value of resScale: 1 (same draws)",
      },
      {
        vi: "Hàm cộng dồn đúng qua nhiều entry trong mảng passes, không chỉ tính entry cuối",
        en: "The function correctly sums across multiple entries in the passes array, not just the last one",
      },
    ],
  },
];
