import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "bandwidth-vs-js-cost",
    kind: "concept",
    prompt: {
      vi: `Một hệ $250{,}000$ particle, mỗi particle giữ vị trí \`vec3\` (4 byte mỗi thành phần), cập nhật ở 60fps. Tính lượng dữ liệu phải upload lên GPU mỗi giây (byte/s), rồi so sánh với băng thông PCIe Gen3 x16 (khoảng 16GB/s một chiều, ước lượng).

Sau đó giải thích: nếu con số này chỉ chiếm một phần rất nhỏ của băng thông khả dụng, vì sao hệ particle này vẫn có thể giật khi chạy trên CPU?`,
      en: `A system of $250{,}000$ particles, each holding a \`vec3\` position (4 bytes per component), updates at 60fps. Compute how much data must be uploaded to the GPU per second (bytes/s), then compare it against PCIe Gen3 x16 bandwidth (roughly 16GB/s one-way, an estimate).

Then explain: if this number is only a tiny fraction of the available bandwidth, why can this particle system still stutter when it runs on the CPU?`,
    },
    hints: [
      {
        vi: "Nhân số particle × 3 thành phần × 4 byte để ra byte/frame, rồi nhân với 60 để ra byte/s.",
        en: "Multiply particle count × 3 components × 4 bytes for bytes/frame, then multiply by 60 for bytes/s.",
      },
      {
        vi: "Băng thông bus gần như không bao giờ là nút thắt ở quy mô particle system điển hình trên web — nghĩ tới ba thứ khác đang cạnh tranh cùng main thread: vòng lặp JS, garbage collector, và overhead cố định của mỗi lệnh gọi upload.",
        en: "Bus bandwidth is almost never the bottleneck at typical web particle-system scale — think about three other things competing on the same main thread: the JS loop, the garbage collector, and the fixed overhead of each upload call.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng byte/frame và byte/s cho 250.000 particle",
        en: "I correctly computed bytes/frame and bytes/s for 250,000 particles",
      },
      {
        vi: "Tôi so sánh được con số đó với băng thông PCIe và kết luận bus không phải nút thắt",
        en: "I compared that figure against PCIe bandwidth and concluded the bus isn't the bottleneck",
      },
      {
        vi: "Tôi nêu được ít nhất hai nguyên nhân phía JS gây giật dù bus còn dư băng thông",
        en: "I named at least two JS-side causes of stutter even when the bus has bandwidth to spare",
      },
    ],
    solutionNote: {
      vi: `$\\text{byte/frame} = 250{,}000 \\times 3 \\times 4 = 3{,}000{,}000$ byte $\\approx 2.86$ MB (quy ước $1\\text{MB} = 1024^2$ byte).

$\\text{byte/s} = 2.86 \\times 60 \\approx 171.6$ MB/s.

So với PCIe Gen3 x16 $\\approx 16$ GB/s một chiều: $171.6$ MB/s chỉ chiếm khoảng $1\\%$ băng thông khả dụng, nên bus không phải là nút thắt.

Giật thực tế đến từ phía JS, không phải từ bus: (1) GC pause khi vòng lặp tạo ra các allocation ẩn (Vector3 tạm, spread mảng...); (2) overhead cố định của mỗi lần gọi bufferSubData, lặp lại mỗi frame; (3) tất cả chạy chung main thread với việc React re-render và xử lý input, cộng dồn đúng vào ngân sách 16.6ms cần cho 60fps.`,
      en: `$\\text{bytes/frame} = 250{,}000 \\times 3 \\times 4 = 3{,}000{,}000$ bytes $\\approx 2.86$ MB (using $1\\text{MB} = 1024^2$ bytes).

$\\text{bytes/s} = 2.86 \\times 60 \\approx 171.6$ MB/s.

Against PCIe Gen3 x16 $\\approx 16$ GB/s one-way: $171.6$ MB/s is only about $1\\%$ of the available bandwidth, so the bus isn't the bottleneck.

The actual stutter comes from the JS side, not the bus: (1) GC pauses when the loop creates hidden allocations (temporary Vector3s, array spreads...); (2) the fixed overhead of every bufferSubData call, repeated every frame; (3) everything shares the main thread with React re-renders and input handling, all competing for the same 16.6ms budget needed for 60fps.`,
    },
  },
  {
    id: "estimate-cpu-gpu-threshold",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`estimateStrategy\` nhận số particle, chi phí ước lượng (mili-giây) cho mỗi 1000 particle khi cập nhật trên CPU, và FPS mục tiêu; trả về chi phí CPU ước tính (\`costMs\`) cùng khuyến nghị \`"cpu"\` hoặc \`"gpu"\`.

Quy tắc: ngân sách frame (ms) là $1000 / \\text{fps}$; nếu \`costMs\` vượt quá 30% ngân sách đó, khuyến nghị chuyển sang GPU (70% còn lại dành cho render và logic khác).`,
      en: `Write an \`estimateStrategy\` function taking a particle count, an estimated cost (milliseconds) per 1000 particles updated on the CPU, and a target FPS; return the estimated CPU cost (\`costMs\`) and a \`"cpu"\` or \`"gpu"\` recommendation.

Rule: the frame budget (ms) is $1000 / \\text{fps}$; if \`costMs\` exceeds 30% of that budget, recommend moving to the GPU (the remaining 70% is for rendering and other logic).`,
    },
    starterCode: `interface StrategyEstimate {
  costMs: number;
  recommendation: "cpu" | "gpu";
}

function estimateStrategy(
  particleCount: number,
  msPerThousandParticles: number,
  targetFps: number,
): StrategyEstimate {
  // TODO: costMs = (particleCount / 1000) * msPerThousandParticles
  // TODO: frameBudgetMs = 1000 / targetFps
  // TODO: recommendation = "gpu" if costMs > frameBudgetMs * 0.3, otherwise "cpu"
  return { costMs: 0, recommendation: "cpu" };
}`,
    solutionCode: `interface StrategyEstimate {
  costMs: number;
  recommendation: "cpu" | "gpu";
}

function estimateStrategy(
  particleCount: number,
  msPerThousandParticles: number,
  targetFps: number,
): StrategyEstimate {
  const costMs = (particleCount / 1000) * msPerThousandParticles;
  const frameBudgetMs = 1000 / targetFps;
  const recommendation = costMs > frameBudgetMs * 0.3 ? "gpu" : "cpu";
  return { costMs, recommendation };
}`,
    hints: [
      {
        vi: "costMs tỉ lệ thuận với particleCount: chia particleCount cho 1000 rồi nhân với chi phí mỗi 1000 particle.",
        en: "costMs scales linearly with particleCount: divide particleCount by 1000, then multiply by the per-1000-particle cost.",
      },
      {
        vi: "Ngân sách frame (ms) = 1000 / targetFps; so sánh costMs với 30% của ngân sách đó, không phải 100%.",
        en: "Frame budget (ms) = 1000 / targetFps; compare costMs against 30% of that budget, not 100%.",
      },
    ],
    checklist: [
      {
        vi: "estimateStrategy(300000, 0.05, 60) trả về costMs = 15 và recommendation \"gpu\" (ngân sách 60fps ≈16.67ms, 30% ≈5ms, 15 > 5)",
        en: "estimateStrategy(300000, 0.05, 60) returns costMs = 15 and recommendation \"gpu\" (60fps budget ≈16.67ms, 30% ≈5ms, 15 > 5)",
      },
      {
        vi: "estimateStrategy(5000, 0.05, 60) trả về recommendation \"cpu\"",
        en: "estimateStrategy(5000, 0.05, 60) returns recommendation \"cpu\"",
      },
      {
        vi: "Hàm không có side-effect, chỉ tính toán thuần từ tham số đầu vào",
        en: "The function has no side effects, computing purely from its input parameters",
      },
    ],
  },
];
