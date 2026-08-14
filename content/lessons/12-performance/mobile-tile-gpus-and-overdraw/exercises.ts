import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "opaque-vs-transparent-overdraw-cost",
    kind: "concept",
    prompt: {
      vi: `Một cảnh mobile có một mặt đất opaque (dùng \`depthWrite: true\`, không blend) và, ngay trước camera, 4 mặt phẳng full-screen của một hiệu ứng khói (\`transparent: true\`, \`depthWrite: false\`). Trên một GPU tile với HSR/early-Z hoạt động tốt, hãy giải thích: phần mặt đất opaque được hưởng lợi gì từ HSR, và vì sao 4 lớp khói phía trước vẫn buộc GPU tô màu đúng $4\\times$ số fragment bất kể kiến trúc GPU có "thông minh" tới đâu. Sau đó giải thích thêm: nếu bật MSAA 4x, chi phí thêm cho mặt đất opaque gần như bằng 0 trên tile GPU nhưng chi phí của 4 lớp khói KHÔNG giảm đi — vì sao MSAA không "cứu" được overdraw của transparency.`,
      en: `A mobile scene has an opaque ground plane (\`depthWrite: true\`, no blending) and, right in front of the camera, 4 full-screen planes of a smoke effect (\`transparent: true\`, \`depthWrite: false\`). On a tile GPU with HSR/early-Z working well, explain what the opaque ground benefits from because of HSR, and why the 4 smoke layers in front still force the GPU to shade exactly $4\\times$ the fragments no matter how "smart" the GPU architecture is. Then explain further: if 4x MSAA is enabled, the extra cost for the opaque ground is nearly zero on a tile GPU, but the cost of the 4 smoke layers does NOT go down — why doesn't MSAA "rescue" transparency's overdraw.`,
    },
    hints: [
      {
        vi: "HSR/early-Z chỉ hoạt động khi GPU có thể biết TRƯỚC một fragment sẽ bị fragment khác che hoàn toàn — điều này chỉ đúng khi kết quả không phụ thuộc thứ tự vẽ.",
        en: "HSR/early-Z only works when the GPU can know AHEAD OF TIME that a fragment will be fully occluded by another one — that's only true when the result doesn't depend on draw order.",
      },
      {
        vi: "MSAA giải quyết vấn đề aliasing ở CẠNH hình học (edge), resolve N sample thành 1 màu mỗi pixel — nó không thay đổi việc có bao nhiêu LỚP đối tượng khác nhau cùng góp phần vào màu cuối của một pixel.",
        en: "MSAA solves edge aliasing by resolving N samples into one color per pixel — it doesn't change how many different LAYERS of objects contribute to a pixel's final color.",
      },
    ],
    checklist: [
      {
        vi: "Giải thích được HSR loại fragment mặt đất bị 4 lớp khói VÀ chính mặt đất tự che nhau (nếu có) trước khi tô màu, vì mặt đất opaque không phụ thuộc thứ tự vẽ",
        en: "Explained that HSR rejects ground fragments occluded by other opaque geometry before shading, because opaque results don't depend on draw order",
      },
      {
        vi: "Giải thích được blending là phép toán phụ thuộc thứ tự nên cả 4 lớp khói đều bắt buộc chạy shader, không lớp nào bị loại trước",
        en: "Explained that blending is order-dependent so all 4 smoke layers are forced to run their shader, none can be rejected ahead of time",
      },
      {
        vi: "Giải thích đúng vì sao MSAA (resolve trong-tile, gần miễn phí) không liên quan tới số lớp transparency chồng lên nhau — đây là hai vấn đề độc lập",
        en: "Correctly explained why MSAA (in-tile resolve, nearly free) is unrelated to how many transparent layers stack — these are two independent problems",
      },
    ],
    solutionNote: {
      vi: `Mặt đất opaque: HSR/early-Z biết trước fragment nào bị che (vì kết quả KHÔNG phụ thuộc thứ tự vẽ — 1 pixel chỉ có đúng 1 màu "đúng" bất kể thứ tự), nên loại fragment che khuất TRƯỚC khi chạy fragment shader.

4 lớp khói transparent: mỗi lớp blend phụ thuộc lớp vẽ trước nó — GPU không thể biết trước kết quả blend cuối nếu chưa chạy shader của TỪNG lớp theo đúng thứ tự back-to-front. Không có cách "bỏ qua" lớp nào — đúng 4x chi phí fragment shading, không hơn không kém.

MSAA chỉ thay đổi cách RESOLVE nhiều sample trong CÙNG một lần shade (anti-alias cạnh hình học) — nó không giảm số LẦN shader phải chạy do có nhiều lớp đối tượng khác nhau che nhau theo chiều sâu. Overdraw do transparency và chi phí của MSAA là hai trục hoàn toàn độc lập.`,
      en: `Opaque ground: HSR/early-Z knows ahead of time which fragments are occluded (because the result does NOT depend on draw order — one pixel has exactly one "correct" color regardless of order), so it rejects occluded fragments BEFORE running the fragment shader.

4 transparent smoke layers: each layer's blend depends on the layer drawn before it — the GPU cannot know the final blended result without running EACH layer's shader in the correct back-to-front order. There's no way to "skip" any layer — exactly 4x the fragment-shading cost, no more, no less.

MSAA only changes how multiple samples from the SAME shading pass are RESOLVED (anti-aliasing geometric edges) — it doesn't reduce how many TIMES the shader has to run because of multiple depth-overlapping object layers. Overdraw from transparency and MSAA's cost are two completely independent axes.`,
    },
  },
  {
    id: "quad-overdraw-area-multiplier",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`quadOverdrawMultiplier(tightSidePx, looseSidePx)\` trả về số lần diện tích fragment shading của một quad "loose" (to, thừa nhiều pixel trong suốt) tốn hơn so với quad "tight" (khít sát nội dung sprite), với cùng một sprite tròn hiển thị y hệt nhau. Cả hai chỉ khác kích thước cạnh quad tính bằng pixel màn hình. Sau đó tính \`quadOverdrawMultiplier(24, 96)\` và diễn giải kết quả bằng một câu.`,
      en: `Write a function \`quadOverdrawMultiplier(tightSidePx, looseSidePx)\` returning how many times more fragment-shading area a "loose" quad (large, wasting many transparent pixels) costs compared to a "tight" quad (fitted closely to the sprite's content), for the same visible circular sprite. Both quads only differ in their side length in screen pixels. Then compute \`quadOverdrawMultiplier(24, 96)\` and interpret the result in one sentence.`,
    },
    starterCode: `function quadOverdrawMultiplier(tightSidePx: number, looseSidePx: number): number {
  // TODO: quad area scales with the SQUARE of the side — return the area ratio
  return 0;
}

console.log(quadOverdrawMultiplier(24, 96));`,
    solutionCode: `function quadOverdrawMultiplier(tightSidePx: number, looseSidePx: number): number {
  const tightArea = tightSidePx * tightSidePx;
  const looseArea = looseSidePx * looseSidePx;
  return looseArea / tightArea;
}

console.log(quadOverdrawMultiplier(24, 96)); // 16 — the loose quad costs 16x
// the fragment-shading area even though the visible circle looks identical,
// because the cost scales with the SQUARE of the quad's side, not the real
// sprite's area.`,
    hints: [
      {
        vi: "Diện tích một quad vuông cạnh $s$ là $s^2$ — tỉ số diện tích giữa hai quad chính là $(looseSidePx / tightSidePx)^2$.",
        en: "The area of a square quad with side $s$ is $s^2$ — the area ratio between two quads is exactly $(looseSidePx / tightSidePx)^2$.",
      },
      {
        vi: "Đừng tính diện tích hình tròn hiển thị — nó GIỐNG NHAU ở cả hai trường hợp. Cái khác nhau, và cái tốn chi phí GPU, là diện tích cả QUAD (kể cả phần trong suốt).",
        en: "Don't compute the visible circle's area — it's the SAME in both cases. What differs, and what costs GPU time, is the area of the whole QUAD (including its transparent padding).",
      },
    ],
    checklist: [
      {
        vi: "Hàm trả về đúng tỉ số diện tích (bình phương của tỉ số cạnh), không phải hiệu số",
        en: "The function returns the correct area ratio (square of the side ratio), not a difference",
      },
      {
        vi: "quadOverdrawMultiplier(24, 96) cho ra đúng 16",
        en: "quadOverdrawMultiplier(24, 96) evaluates to exactly 16",
      },
      {
        vi: "Câu diễn giải nói rõ chi phí phụ thuộc kích thước QUAD, không phụ thuộc nội dung hiển thị",
        en: "The interpretation sentence makes clear the cost depends on QUAD size, not on the visible content",
      },
    ],
  },
];
