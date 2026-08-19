import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "checkerboard-divergence",
    kind: "concept",
    prompt: {
      vi: `Giả sử một warp phủ đúng 32 pixel liên tiếp theo trục X của màn hình (thực tế phần cứng gói lane theo khối 2×2, tuỳ hãng) (pixel $x = 0, 1, 2, \\dots, 31$). Fragment shader chứa \`if (mod(pixelX, 2.0) < 1.0) { ... nhánh nặng ... } else { ... nhánh nhẹ ... }\` — rẽ nhánh theo tính chẵn/lẻ của toạ độ pixel (kiểu caro 1 pixel).

Hỏi: trong warp 32 lane này, bao nhiêu lane đi nhánh nặng, bao nhiêu lane đi nhánh nhẹ? Warp có bị coi là phân kỳ (divergent) không? So sánh tổng chi phí thực thi của warp này với chi phí của MỘT warp không phân kỳ (toàn bộ 32 lane cùng đi một nhánh).`,
      en: `Suppose a warp covers exactly 32 consecutive pixels along the screen's X axis (real hardware packs lanes in 2×2 quads, vendor-specific) (pixels $x = 0, 1, 2, \\dots, 31$). A fragment shader contains \`if (mod(pixelX, 2.0) < 1.0) { ... heavy branch ... } else { ... light branch ... }\` — branching on whether the pixel coordinate is even or odd (a 1-pixel checkerboard).

Question: in this 32-lane warp, how many lanes take the heavy branch, and how many take the light one? Is this warp divergent? Compare this warp's total execution cost to a NON-divergent warp (all 32 lanes taking the same branch).`,
    },
    hints: [
      {
        vi: "Chẵn/lẻ luân phiên từng pixel một — tự đếm phân bố trong 32 pixel liên tiếp.",
        en: "Even/odd alternates pixel by pixel — count the distribution across 32 consecutive pixels yourself.",
      },
      {
        vi: "Divergence không quan tâm tỉ lệ 50/50 hay 90/10 — chỉ quan tâm CÓ ít nhất 2 lane khác nhánh trong cùng warp hay không.",
        en: "Divergence doesn't care whether the split is 50/50 or 90/10 — it only cares whether AT LEAST 2 lanes in the same warp disagree.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng 16 lane đi nhánh nặng, 16 lane đi nhánh nhẹ",
        en: "I correctly identified 16 lanes taking the heavy branch, 16 taking the light one",
      },
      {
        vi: "Tôi kết luận đúng warp này phân kỳ (divergent), vì hai nhóm lane bất đồng",
        en: "I correctly concluded this warp is divergent, since the two lane groups disagree",
      },
      {
        vi: "Tôi giải thích được tổng chi phí ≈ chi phí nhánh nặng + chi phí nhánh nhẹ, cho TOÀN BỘ warp — không phải chỉ chi phí nhánh nặng cho 16 lane",
        en: "I can explain the total cost ≈ heavy branch cost + light branch cost, for the WHOLE warp — not just the heavy branch's cost for 16 lanes",
      },
    ],
    solutionNote: {
      vi: `32 lane liên tiếp, chẵn/lẻ xen kẽ từng pixel một → đúng 16 lane chẵn, 16 lane lẻ. Vì cả hai nhóm cùng tồn tại trong MỘT warp, warp này phân kỳ (divergent).

Chi phí thực thi: phần cứng chạy nhánh nặng cho cả 32 lane (chỉ 16 lane ghi kết quả, 16 lane còn lại bị execution-mask tắt), rồi chạy tiếp nhánh nhẹ cho cả 32 lane (đảo lại mask). Tổng chi phí xấp xỉ chi phí nhánh nặng cộng chi phí nhánh nhẹ, cho toàn bộ warp — tệ hơn nhiều so với một warp không phân kỳ, nơi chi phí chỉ là chi phí của một nhánh duy nhất vì không cần chạy nhánh còn lại.`,
      en: `32 consecutive lanes, even/odd alternating every pixel → exactly 16 even lanes, 16 odd lanes. Since both groups exist within a SINGLE warp, this warp is divergent.

Execution cost: the hardware runs the heavy branch for all 32 lanes (only 16 lanes write results, the other 16 are masked off by the execution mask), then runs the light branch for all 32 lanes (mask flipped). Total cost is roughly the heavy branch's cost plus the light branch's cost, for the whole warp — far worse than a non-divergent warp, where the cost is just a single branch's cost, since the other branch never needs to run.`,
    },
  },
  {
    id: "rewrite-radial-mask-branchless",
    kind: "shader",
    prompt: {
      vi: `Đoạn shader dưới đây tô màu một hình tròn bằng \`if/else\` rẽ nhánh theo khoảng cách tới tâm — chính kiểu \`if\` phân kỳ theo dữ liệu per-pixel mà bài này vừa phân tích. Viết lại thành một biểu thức branchless dùng \`step\`/\`mix\`, giữ nguyên kết quả hình ảnh (không đổi màu, không đổi bán kính).`,
      en: `The shader below colors a circle using \`if/else\` branching on distance-to-center — exactly the kind of per-pixel data-dependent divergent \`if\` this lesson just analyzed. Rewrite it as a branchless expression using \`step\`/\`mix\`, keeping the visual result identical (same colors, same radius).`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float d = distance(uv, vec2(0.5));

  vec3 color;
  // TODO: replace the if/else block below with ONE branchless expression
  // using step (or mix) — keep the visual result identical, no if.
  if (d < 0.3) {
    color = vec3(0.95, 0.6, 0.2);
  } else {
    color = vec3(0.08, 0.1, 0.18);
  }

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float d = distance(uv, vec2(0.5));

  vec3 inside = vec3(0.95, 0.6, 0.2);
  vec3 outside = vec3(0.08, 0.1, 0.18);
  vec3 color = mix(inside, outside, step(0.3, d));

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "step(0.3, d) trả về 0.0 khi d < 0.3 (trong hình tròn) và 1.0 khi d >= 0.3 (ngoài hình tròn) — đúng bằng điều kiện if đảo ngược.",
        en: "step(0.3, d) returns 0.0 when d < 0.3 (inside the circle) and 1.0 when d >= 0.3 (outside) — exactly the inverse of the if condition.",
      },
      {
        vi: "mix(a, b, t) trả về a khi t = 0 và b khi t = 1 — sắp xếp inside/outside đúng thứ tự để khớp giá trị của step ở trên.",
        en: "mix(a, b, t) returns a when t = 0 and b when t = 1 — order inside/outside to match the step value above.",
      },
    ],
    checklist: [
      {
        vi: "Code mới không còn từ khoá if nào",
        en: "The new code contains no if keyword at all",
      },
      {
        vi: "Màu bên trong bán kính 0.3 và bên ngoài giữ đúng như bản gốc",
        en: "The colors inside radius 0.3 and outside match the original exactly",
      },
      {
        vi: "step(0.3, d) được dùng làm hệ số nội suy t cho mix()",
        en: "step(0.3, d) is used as the interpolation factor t for mix()",
      },
    ],
  },
];
