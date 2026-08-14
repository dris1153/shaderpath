import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "divergence-and-jacobi-by-hand",
    kind: "concept",
    prompt: {
      vi: `Một ô lưới có bốn hàng xôm với vận tốc: trái $L_x = -0.10$, phải $R_x = 0.30$, dưới $B_y = -0.05$, trên $T_y = 0.15$ (chỉ thành phần cần thiết). Dùng đúng công thức sai phân trung tâm không chia cho texelSize như trong bài (quy ước lưới đơn vị $h=1$ của GPU Gems ch.38): $\\text{div} = 0.5 \\times ((R_x - L_x) + (T_y - B_y))$.

Tính divergence tại ô đó. Sau đó, với divergence vừa tính và áp suất bốn hàng xóm hiện tại $p_L=0.10$, $p_R=0.05$, $p_B=0.0$, $p_T=0.02$, chạy MỘT bước lặp Jacobi: $p = (p_L+p_R+p_B+p_T-\\text{div}) \\times 0.25$.

Giải thích bằng lời: divergence dương ở ô này nói lên điều gì về dòng chảy tại đó, và vì sao kết quả Jacobi lại âm dù bốn áp suất hàng xóm đều không âm?`,
      en: `A grid cell has four neighbor velocities: left $L_x = -0.10$, right $R_x = 0.30$, bottom $B_y = -0.05$, top $T_y = 0.15$ (only the needed component each). Using the exact central-difference formula from the lesson, without dividing by texelSize (the GPU Gems ch.38 unit-grid convention $h=1$): $\\text{div} = 0.5 \\times ((R_x - L_x) + (T_y - B_y))$.

Compute the divergence at that cell. Then, with that divergence and the current neighbor pressures $p_L=0.10$, $p_R=0.05$, $p_B=0.0$, $p_T=0.02$, run ONE Jacobi iteration: $p = (p_L+p_R+p_B+p_T-\\text{div}) \\times 0.25$.

Explain in words: what does a positive divergence at this cell say about the flow there, and why does the Jacobi result come out negative even though all four neighbor pressures are non-negative?`,
    },
    hints: [
      {
        vi: "Cộng hai hiệu trước, cộng lại, rồi mới nhân 0.5 — đừng nhân 0.5 từng số hạng riêng rồi cộng, dễ lẫn dấu.",
        en: "Add the two differences first, sum them, then multiply by 0.5 last — don't multiply each term by 0.5 separately, it's easy to lose a sign.",
      },
      {
        vi: "Divergence dương nghĩa là 'nhiều dòng ra hơn dòng vào' tại ô đó (một nguồn cục bộ) — bước project sẽ cần một áp suất giảm quanh đó để hút dòng chảy quay lại, đúng vì sao kết quả Jacobi âm dù đầu vào bốn áp suất dương.",
        en: "Positive divergence means 'more outflow than inflow' at that cell (a local source) — the project step needs a dip in pressure around it to pull flow back in, which is exactly why the Jacobi result comes out negative even with four non-negative pressure inputs.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng divergence = 0.30",
        en: "Computed divergence = 0.30",
      },
      {
        vi: "Tính đúng kết quả Jacobi = -0.0325",
        en: "Computed the Jacobi result = -0.0325",
      },
      {
        vi: "Giải thích được divergence dương = nguồn cục bộ (outflow ròng), không phải 'lỗi tính toán'",
        en: "Can explain positive divergence as a local source (net outflow), not a 'calculation error'",
      },
    ],
    solutionCode: `// div = 0.5 * ((0.30 - (-0.10)) + (0.15 - (-0.05)))
//     = 0.5 * (0.40 + 0.20) = 0.5 * 0.60 = 0.30
//
// p = (0.10 + 0.05 + 0.0 + 0.02 - 0.30) * 0.25
//   = (0.17 - 0.30) * 0.25 = (-0.13) * 0.25 = -0.0325
//
// Divergence dương = ô này là "nguồn" cục bộ (dòng ra > dòng vào theo phép
// đo sai phân). Project sẽ trừ gradient áp suất khỏi vận tốc; để việc trừ
// đó ĐẨY dòng chảy quay ngược vào ô (triệt tiêu nguồn giả này), áp suất
// quanh ô phải THẤP hơn các ô xung quanh — nên dù 4 áp suất hàng xóm đều
// không âm, kết quả Jacobi vẫn âm: đó chính là cách nghiệm "kéo" divergence
// về 0 sau đủ vòng lặp.`,
  },
  {
    id: "jacobi-pressure-step-ts",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`jacobiPressureStep\` nhận \`pressure\` và \`divergence\` (hai \`Float32Array\` phẳng kích thước \`size*size\`, hàng-chính) cùng \`size\`, trả về MỘT mảng áp suất mới sau đúng một vòng lặp Jacobi — không sửa mảng đầu vào. Hàng xóm ngoài biên lưới phải lấy theo kiểu **clamp-to-edge** (giống \`ClampToEdgeWrapping\` trên GPU), không phải wrap vòng hay coi là 0.`,
      en: `Write a \`jacobiPressureStep\` function taking \`pressure\` and \`divergence\` (two row-major, flat \`Float32Array\`s of size \`size*size\`) plus \`size\`, returning a NEW pressure array after exactly one Jacobi iteration — never mutate the input arrays. Out-of-grid neighbors must use **clamp-to-edge** (matching \`ClampToEdgeWrapping\` on the GPU), not wraparound or zero.`,
    },
    starterCode: `function jacobiPressureStep(
  pressure: Float32Array,
  divergence: Float32Array,
  size: number,
): Float32Array {
  const next = new Float32Array(size * size);

  // TODO 1: helper that reads pressure at (x, y), clamping BOTH x and y to
  // [0, size - 1] independently before indexing the flat array.
  const at = (x: number, y: number): number => pressure[y * size + x]!;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      // TODO 2: L, R, B, T neighbor pressure via at(), then
      // next[idx] = (L + R + B + T - divergence[idx]) * 0.25
      next[idx] = 0;
    }
  }

  return next;
}`,
    solutionCode: `function jacobiPressureStep(
  pressure: Float32Array,
  divergence: Float32Array,
  size: number,
): Float32Array {
  const next = new Float32Array(size * size);
  const clamp = (v: number) => Math.min(size - 1, Math.max(0, v));
  const at = (x: number, y: number): number =>
    pressure[clamp(y) * size + clamp(x)]!;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const L = at(x - 1, y);
      const R = at(x + 1, y);
      const B = at(x, y - 1);
      const T = at(x, y + 1);
      next[idx] = (L + R + B + T - divergence[idx]!) * 0.25;
    }
  }

  return next;
}`,
    hints: [
      {
        vi: "Clamp x và y RIÊNG BIỆT trước khi ghép thành chỉ số phẳng `y*size+x` — clamp mỗi chỉ số phẳng cuối cùng sẽ cho hàng xóm sai khi x hoặc y vượt biên.",
        en: "Clamp x and y SEPARATELY before combining into the flat index `y*size+x` — clamping the final flat index instead gives the wrong neighbor whenever x or y goes out of range.",
      },
      {
        vi: "Thứ tự đúng là `(L+R+B+T-divergence[idx])*0.25` — đảo thành `(divergence[idx]-L-R-B-T)*0.25` cho ra áp suất ngược dấu hoàn toàn, dòng chảy sẽ tự khuếch đại thay vì hội tụ.",
        en: "The correct order is `(L+R+B+T-divergence[idx])*0.25` — flipping it to `(divergence[idx]-L-R-B-T)*0.25` produces pressure with the opposite sign everywhere, and the flow amplifies instead of converging.",
      },
    ],
    checklist: [
      {
        vi: "Hàm không sửa `pressure`/`divergence` đầu vào — luôn trả về mảng `next` mới",
        en: "The function never mutates the input `pressure`/`divergence` — always returns a new `next` array",
      },
      {
        vi: "Hàng xóm ngoài biên clamp về ô biên gần nhất (x hoặc y = 0 hoặc size-1), không throw, không NaN",
        en: "Out-of-grid neighbors clamp to the nearest edge cell (x or y = 0 or size-1), no throw, no NaN",
      },
      {
        vi: "Chạy với `size=1` (một ô, tự làm hàng xóm của chính nó theo cả 4 hướng) không crash và trả về một số hữu hạn",
        en: "Running with `size=1` (a single cell, its own neighbor in all 4 directions) doesn't crash and returns a finite number",
      },
    ],
  },
];
