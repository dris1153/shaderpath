import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "stride-sampling-cost",
    kind: "concept",
    prompt: {
      vi: `Ở quy mô $N = 65{,}536$ boid (lưới $256\\times256$), quét đầy đủ mọi cặp tốn $N^2$ lần đọc texture mỗi frame. Giả sử đổi sang lấy mẫu stride: mỗi boid chỉ đọc texel thứ $0, k, 2k, \\dots$ (theo chỉ số texel, không theo khoảng cách thực) thay vì cả $N$ texel.

Với $k = 8$: tính số lần đọc mỗi boid, tổng số lần đọc mỗi frame cho cả đàn, và tỉ lệ giảm so với quét đầy đủ. Sau đó giải thích vì sao lấy mẫu theo chỉ số texel (không theo vị trí không gian) vẫn là một xấp xỉ hợp lý cho hành vi flocking — và nêu một tình huống cụ thể $k$ quá lớn có thể làm hỏng cảm giác bầy đàn ở một vùng cụ thể trên lưới.`,
      en: `At $N = 65{,}536$ boids (a $256\\times256$ grid), a full scan of every pair costs $N^2$ texture reads per frame. Suppose you switch to stride sampling: each boid only reads texel $0, k, 2k, \\dots$ (by texel INDEX, not real distance) instead of all $N$ texels.

With $k = 8$: compute the reads per boid, the total reads per frame for the whole flock, and the reduction ratio versus a full scan. Then explain why sampling by texel index (not spatial position) is still a reasonable approximation for flocking behavior — and describe one concrete situation where too large a $k$ could break the flocking feel in a specific region of the grid.`,
    },
    hints: [
      {
        vi: "Số lần đọc mỗi boid với stride k là N/k (không phải N) — nhân với N boid để ra tổng mỗi frame.",
        en: "Reads per boid with stride k is N/k (not N) — multiply by N boids for the per-frame total.",
      },
      {
        vi: "Tỉ lệ giảm so với quét đầy đủ luôn đúng bằng k, vì N²/(N × N/k) = k — suy luận trực tiếp từ công thức cũng ra kết quả, không cần tính hai số lớn rồi chia.",
        en: "The reduction ratio versus a full scan always equals k exactly, since N²/(N × N/k) = k — reasoning straight from the formula gets you there without dividing two huge numbers.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng số lần đọc mỗi boid (N/k = 8192) và tổng mỗi frame (~536.9 triệu)",
        en: "Correctly computes reads per boid (N/k = 8192) and the per-frame total (~536.9 million)",
      },
      {
        vi: "Nêu đúng tỉ lệ giảm là k = 8 lần so với quét đầy đủ N² (~4.295 tỷ)",
        en: "States the correct reduction ratio of k = 8x versus the full N² scan (~4.295 billion)",
      },
      {
        vi: "Giải thích được vì sao chỉ số texel không tương ứng vị trí không gian nên stride vẫn cho mẫu đại diện hợp lý cho một quy tắc chỉ cần ước lượng thống kê",
        en: "Explains why texel index has no relationship to spatial position, so stride sampling still gives a representative sample for a rule that only needs a statistical estimate",
      },
      {
        vi: "Nêu được một tình huống k quá lớn khiến một vùng cụ thể của lưới hiếm khi được bất kỳ boid nào lấy mẫu, gây flocking patchy/desynced ở đó",
        en: "Describes a situation where too large a k leaves a specific region of the grid rarely sampled by any boid, causing patchy/desynced flocking there",
      },
    ],
    solutionCode: `// samples per boid = N / k = 65536 / 8 = 8192
// total reads/frame  = N * (N / k) = 65536 * 8192 = 536,870,912 (~536.9M)
// full scan          = N * N       = 65536 * 65536 = 4,294,967,296 (~4.295B)
// reduction ratio     = N^2 / (N * N/k) = k = 8x
//
// Texel INDEX has no relationship to spatial position (two boids next to
// each other in index space can be at opposite ends of the flock), so a
// fixed index stride still lands on a pseudo-random spread of boids across
// the whole grid — flocking rules only need an approximate local average,
// not an exact neighbor set, so that noise doesn't visibly break the result.
// Failure mode: if k is close to N (very few samples), a boid's stride
// might skip every texel actually near it in space for several frames in a
// row, making flocking look patchy/desynced in whichever region got unlucky.`,
  },
  {
    id: "flocking-steering-in-ts",
    kind: "code",
    prompt: {
      vi: `Viết hàm TypeScript \`computeSteering(self, others, perceptionRadius)\` mô phỏng chính xác logic của compute shader trong bài: separation dùng bán kính $0.4 \\times$ perceptionRadius (cộng dồn $(\\text{self} - \\text{other})/d^2$ cho mỗi hàng xóm trong bán kính đó), alignment dùng bán kính $0.7 \\times$ perceptionRadius (trả về vận tốc trung bình của hàng xóm trong bán kính đó), cohesion dùng trọn perceptionRadius (trả về vị trí trung bình của hàng xóm trong bán kính đó). Bỏ qua chính \`self\` và bất kỳ ai ngoài perceptionRadius bằng một điều kiện \`continue\` duy nhất.`,
      en: `Write a TypeScript \`computeSteering(self, others, perceptionRadius)\` function that mirrors this lesson's compute shader exactly: separation uses a radius of $0.4 \\times$ perceptionRadius (accumulates $(\\text{self} - \\text{other})/d^2$ for each neighbor within it), alignment uses $0.7 \\times$ perceptionRadius (returns the AVERAGE velocity of neighbors within it), cohesion uses the full perceptionRadius (returns the AVERAGE position of neighbors within it). Skip self and anyone past perceptionRadius with a single early \`continue\`.`,
    },
    starterCode: `interface Boid {
  position: [number, number, number];
  velocity: [number, number, number];
}

function computeSteering(
  self: Boid,
  others: Boid[],
  perceptionRadius: number,
): {
  separation: [number, number, number];
  alignment: [number, number, number];
  cohesion: [number, number, number];
} {
  const sepRadius = perceptionRadius * 0.4;
  const aliRadius = perceptionRadius * 0.7;

  // TODO: loop over \`others\`, skip self (dist < 1e-4) and anyone beyond
  // perceptionRadius with one early continue, then accumulate:
  // - separation: sum of (self.position - other.position) / dist^2, only
  //   within sepRadius
  // - alignment: AVERAGE velocity of neighbors within aliRadius
  // - cohesion: AVERAGE position of neighbors within perceptionRadius

  return {
    separation: [0, 0, 0],
    alignment: [0, 0, 0],
    cohesion: [0, 0, 0],
  };
}`,
    solutionCode: `interface Boid {
  position: [number, number, number];
  velocity: [number, number, number];
}

function computeSteering(
  self: Boid,
  others: Boid[],
  perceptionRadius: number,
) {
  const sepRadius = perceptionRadius * 0.4;
  const aliRadius = perceptionRadius * 0.7;

  let sep: [number, number, number] = [0, 0, 0];
  let aliSum: [number, number, number] = [0, 0, 0];
  let cohSum: [number, number, number] = [0, 0, 0];
  let aliCount = 0;
  let cohCount = 0;

  for (const other of others) {
    const dx = self.position[0] - other.position[0];
    const dy = self.position[1] - other.position[1];
    const dz = self.position[2] - other.position[2];
    const dist = Math.hypot(dx, dy, dz);
    if (dist < 1e-4 || dist > perceptionRadius) continue;

    if (dist < sepRadius) {
      const inv = 1 / (dist * dist);
      sep = [sep[0] + dx * inv, sep[1] + dy * inv, sep[2] + dz * inv];
    }
    if (dist < aliRadius) {
      aliSum = [
        aliSum[0] + other.velocity[0],
        aliSum[1] + other.velocity[1],
        aliSum[2] + other.velocity[2],
      ];
      aliCount++;
    }
    cohSum = [
      cohSum[0] + other.position[0],
      cohSum[1] + other.position[1],
      cohSum[2] + other.position[2],
    ];
    cohCount++;
  }

  const alignment: [number, number, number] =
    aliCount > 0
      ? [aliSum[0] / aliCount, aliSum[1] / aliCount, aliSum[2] / aliCount]
      : [0, 0, 0];
  const cohesion: [number, number, number] =
    cohCount > 0
      ? [cohSum[0] / cohCount, cohSum[1] / cohCount, cohSum[2] / cohCount]
      : self.position;

  return { separation: sep, alignment, cohesion };
}`,
    hints: [
      {
        vi: "Zone radii khớp GLSL: sepRadius = 0.4 * perceptionRadius, aliRadius = 0.7 * perceptionRadius, cohesion dùng trọn perceptionRadius — đúng thứ tự lồng nhau đã học trong lý thuyết.",
        en: "Zone radii match the GLSL: sepRadius = 0.4 * perceptionRadius, aliRadius = 0.7 * perceptionRadius, cohesion uses the full perceptionRadius — the same nested ordering from the theory.",
      },
      {
        vi: "Bỏ qua self và ngoài bán kính bằng đúng một continue sớm, y hệt `if (dist < 0.0001 || dist > uPerceptionRadius) continue;` trong shader.",
        en: "Skip self and anything past the radius with exactly one early continue, just like `if (dist < 0.0001 || dist > uPerceptionRadius) continue;` in the shader.",
      },
    ],
    checklist: [
      {
        vi: "separation cộng dồn (self - other)/dist² chỉ trong sepRadius, không phải toàn bộ perceptionRadius",
        en: "separation accumulates (self - other)/dist² only within sepRadius, not the full perceptionRadius",
      },
      {
        vi: "alignment trả về trung bình (chia cho aliCount), không phải tổng thô",
        en: "alignment returns the average (divided by aliCount), not the raw sum",
      },
      {
        vi: "cohesion trả về trung bình vị trí trong cả perceptionRadius, có fallback hợp lý khi không có hàng xóm nào",
        en: "cohesion returns the average position across the full perceptionRadius, with a sensible fallback when there are no neighbors",
      },
    ],
  },
];
