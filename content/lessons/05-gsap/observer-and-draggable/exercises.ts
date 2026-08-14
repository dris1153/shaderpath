import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "inertia-velocity-sampling",
    kind: "concept",
    prompt: {
      vi: `Draggable với \`inertia: true\` tính vận tốc thả tay không phải từ đúng hai điểm \`pointermove\` liền kề nhau, mà từ một cửa sổ ngắn các mẫu vị trí gần nhất (khoảng vài chục mili-giây, do InertiaPlugin quản lý).

Giả sử một component tự viết tính vận tốc bằng \`(x2 - x1) / (t2 - t1)\` chỉ từ đúng hai mẫu cuối cùng trước khi người dùng nhấc tay. Nếu đúng frame cuối đó trình duyệt bị giật (dropped frame — khoảng cách \`t2 - t1\` tăng đột biến so với bình thường, trong khi \`x2 - x1\` gần như không đổi), vận tốc tính ra sẽ lệch theo hướng nào — tăng hay giảm bất thường? Và vì sao lấy trung bình trên một cửa sổ nhiều mẫu (thay vì đúng 2 điểm) làm giảm hẳn ảnh hưởng của lỗi này?`,
      en: `Draggable with \`inertia: true\` computes release velocity not from exactly two adjacent \`pointermove\` samples, but from a short recent window of position samples (roughly a few dozen milliseconds, managed by InertiaPlugin).

Suppose a hand-rolled component computes velocity as \`(x2 - x1) / (t2 - t1)\` from just the last two samples before the user lifts their finger. If that final frame is dropped (a dropped frame — \`t2 - t1\` spikes abnormally while \`x2 - x1\` barely changes), which direction does the computed velocity skew — abnormally higher or lower? And why does averaging over a window of many samples (instead of exactly 2 points) sharply reduce this error's impact?`,
    },
    hints: [
      {
        vi: "Vận tốc = quãng đường / thời gian. Nếu tử số (Δx) gần như không đổi nhưng mẫu số (Δt) tăng đột biến, kết quả của phép chia thay đổi theo hướng nào?",
        en: "Velocity = distance / time. If the numerator (Δx) barely changes but the denominator (Δt) spikes, which way does the division result move?",
      },
      {
        vi: "Lấy trung bình trên nhiều mẫu làm một khoảng Δt bất thường chỉ đóng góp một phần nhỏ vào kết quả tổng, thay vì quyết định toàn bộ vận tốc tính ra.",
        en: "Averaging over many samples means one abnormal Δt interval only contributes a small fraction to the overall result, instead of single-handedly determining the computed velocity.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được vận tốc bị TỤT xuống thấp bất thường (Δt tăng, Δx không đổi → thương số giảm), không phải tăng lên",
        en: "I explained that velocity drops abnormally LOW (Δt increases, Δx unchanged → the quotient decreases), not that it spikes higher",
      },
      {
        vi: "Tôi giải thích được lấy mẫu theo cửa sổ pha loãng ảnh hưởng của một khoảng Δt bất thường",
        en: "I explained that windowed sampling dilutes the impact of one abnormal Δt interval",
      },
      {
        vi: "Tôi nêu được đây là lý do nên dùng InertiaPlugin thay vì tự viết deltaX/deltaTime thủ công cho hiệu ứng throw",
        en: "I stated that this is why InertiaPlugin is preferable to hand-rolled deltaX/deltaTime for a throw effect",
      },
    ],
    solutionNote: {
      vi: `$\\Delta x$ gần như không đổi nhưng $\\Delta t$ tăng đột biến (frame giật) → $\\Delta x / \\Delta t$ TỤT xuống bất thường thấp, không phải tăng — một cú throw nhanh thật sẽ bị tính ra thành throw yếu, cảm giác "hụt" ngay lúc thả tay.

Lấy trung bình trên một cửa sổ N mẫu gần nhất khiến MỘT khoảng $\\Delta t$ bất thường chỉ đóng góp $1/N$ vào kết quả cuối, thay vì một mình nó quyết định toàn bộ vận tốc — đây chính xác là cách InertiaPlugin làm, và là lý do throw của Draggable ổn định hơn nhiều so với deltaX/deltaTime tự viết từ đúng 2 điểm cuối.`,
      en: `$\\Delta x$ barely changes but $\\Delta t$ spikes (a dropped frame) → $\\Delta x / \\Delta t$ drops abnormally LOW, not higher — a genuinely fast throw ends up computed as a weak one, feeling like it "stumbles" right at release.

Averaging over a window of the N most recent samples means ONE abnormal $\\Delta t$ interval only contributes $1/N$ to the final result, instead of single-handedly determining the whole velocity — this is exactly what InertiaPlugin does, and why Draggable's throw is far more stable than a hand-rolled deltaX/deltaTime from just the last 2 points.`,
    },
  },
  {
    id: "compute-snap-angle",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`computeSnapAngle(rotation, step)\` mô phỏng lại logic \`snap\` mà Draggable dùng cho \`type: "rotation"\`: trả về góc \`rotation\` (độ) đã được làm tròn về bội số gần nhất của \`step\` độ. Trường hợp đặc biệt: \`step <= 0\` nghĩa là không snap — trả nguyên \`rotation\`, không được chia cho 0.`,
      en: `Write a \`computeSnapAngle(rotation, step)\` function that mirrors the \`snap\` logic Draggable uses for \`type: "rotation"\`: return the \`rotation\` angle (degrees) rounded to the nearest multiple of \`step\` degrees. Special case: \`step <= 0\` means no snapping — return \`rotation\` unchanged, and never divide by zero.`,
    },
    starterCode: `function computeSnapAngle(rotation: number, step: number): number {
  // TODO: step <= 0 → return rotation unchanged (no snap)
  // TODO: otherwise, round rotation to the nearest multiple of step
  return rotation;
}`,
    solutionCode: `function computeSnapAngle(rotation: number, step: number): number {
  if (step <= 0) return rotation;
  return Math.round(rotation / step) * step;
}`,
    hints: [
      {
        vi: "step <= 0 là trường hợp đặc biệt phải xử lý trước tiên — trả nguyên rotation, đừng bao giờ chia cho step trong nhánh này.",
        en: "step <= 0 is a special case to handle first — return rotation unchanged, never divide by step in this branch.",
      },
      {
        vi: "Math.round(rotation / step) cho biết rotation gần bội số thứ mấy của step nhất; nhân lại step để ra góc đã snap.",
        en: "Math.round(rotation / step) tells you which multiple of step rotation is closest to; multiply back by step to get the snapped angle.",
      },
    ],
    checklist: [
      {
        vi: "computeSnapAngle(100, 45) trả về 90 (bội số 45 gần nhất)",
        en: "computeSnapAngle(100, 45) returns 90 (the nearest multiple of 45)",
      },
      {
        vi: "computeSnapAngle(100, 0) trả về đúng 100 (không snap, không lỗi chia 0)",
        en: "computeSnapAngle(100, 0) returns exactly 100 (no snap, no divide-by-zero)",
      },
      {
        vi: "computeSnapAngle(-10, 90) trả về 0, không phải -90 (Math.round làm tròn đúng cả với số âm)",
        en: "computeSnapAngle(-10, 90) returns 0, not -90 (Math.round rounds correctly for negative numbers too)",
      },
    ],
  },
];
