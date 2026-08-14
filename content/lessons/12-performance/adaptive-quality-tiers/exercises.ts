import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "benchmark-vs-heuristic-mismatch",
    kind: "concept",
    prompt: {
      vi: `Một laptop báo \`navigator.deviceMemory = 8\` và \`navigator.hardwareConcurrency = 8\` — theo heuristic phần cứng thuần tuý, đây trông như một máy "cao cấp". Nhưng benchmark 2 giây chạy ngay trên cảnh thật (đúng particle count, đúng vật liệu của bạn) đo được frame-time EMA khoảng $28$ms (~$36$fps) trên CHÍNH máy đó, tại CÙNG một thời điểm. Hãy giải thích tín hiệu nào nên quyết định tier khởi điểm, và nêu ít nhất một lý do thực tế khiến một máy có thông số "đẹp" trên giấy vẫn có context WebGL chậm (gợi ý: không phải mọi GPU tích hợp đều mạnh như RAM/số lõi CPU gợi ý, và không phải mọi lúc trình duyệt đều dùng GPU rời nếu máy có cả hai).`,
      en: `A laptop reports \`navigator.deviceMemory = 8\` and \`navigator.hardwareConcurrency = 8\` — by pure hardware heuristics, this looks like a "high-end" machine. But a 2-second benchmark run directly on the real scene (your actual particle count, your actual materials) measures a frame-time EMA of about $28$ms (~$36$fps) on that SAME machine, at the SAME moment. Explain which signal should decide the starting tier, and state at least one real-world reason a device with "nice" specs on paper can still have a slow WebGL context (hint: not every integrated GPU is as strong as the RAM/CPU core count would suggest, and the browser doesn't always pick the discrete GPU even when one is present).`,
    },
    hints: [
      {
        vi: "deviceMemory và hardwareConcurrency chỉ nói về RAM hệ thống và số lõi CPU — không nói gì trực tiếp về GPU, và hoàn toàn không đo được trạng thái THỰC TẾ của context WebGL đang chạy (throttle nhiệt, driver, GPU rời/tích hợp nào được chọn).",
        en: "deviceMemory and hardwareConcurrency only speak to system RAM and CPU core count — they say nothing directly about the GPU, and they measure nothing about the ACTUAL running WebGL context's state (thermal throttling, drivers, which discrete/integrated GPU got picked).",
      },
      {
        vi: "Một benchmark render đúng nội dung cảnh thật đo được TẤT CẢ những yếu tố đó cộng lại thành một con số duy nhất: frame time thật.",
        en: "A benchmark rendering the actual scene content measures ALL of those factors combined into one single number: real frame time.",
      },
    ],
    checklist: [
      {
        vi: "Chọn benchmark làm tín hiệu quyết định, không phải deviceMemory/hardwareConcurrency",
        en: "Picked the benchmark as the deciding signal, not deviceMemory/hardwareConcurrency",
      },
      {
        vi: "Giải thích được deviceMemory/hardwareConcurrency không đo GPU hay context WebGL thực tế",
        en: "Explained that deviceMemory/hardwareConcurrency don't measure the GPU or the actual WebGL context",
      },
      {
        vi: "Nêu được ít nhất một lý do cụ thể (GPU tích hợp yếu, driver, chọn nhầm GPU rời/tích hợp, throttle nhiệt...) cho sự chênh lệch",
        en: "Named at least one concrete reason (weak integrated GPU, drivers, wrong GPU selected, thermal throttling...) for the mismatch",
      },
    ],
    solutionCode: `// Tín hiệu quyết định: benchmark (28ms EMA đo trực tiếp trên cảnh thật),
// KHÔNG PHẢI deviceMemory/hardwareConcurrency.
//
// Lý do: deviceMemory và hardwareConcurrency chỉ mô tả RAM và số lõi CPU —
// một máy có RAM/CPU dồi dào vẫn có thể mang GPU tích hợp yếu (phổ biến ở
// laptop văn phòng cấu hình cao về CPU nhưng GPU tối thiểu), hoặc trình
// duyệt/OS chọn nhầm GPU tích hợp thay vì GPU rời có sẵn trên máy, hoặc máy
// đang throttle nhiệt tại thời điểm đo. Không API tĩnh nào phản ánh được
// những yếu tố này — chỉ một benchmark render THẬT mới đo trực tiếp kết quả
// cuối cùng mà người dùng sẽ trải nghiệm.`,
  },
  {
    id: "thermostat-tier-watchdog",
    kind: "code",
    prompt: {
      vi: `Viết hàm thuần \`nextTierIndex(emaMs, currentIndex, streak, dropMs, riseMs, holdSamples)\` triển khai đúng thermostat pattern: trả về chỉ số tier mới VÀ streak mới sau khi nhận một mẫu \`emaMs\`. Hạ tier (index giảm) chỉ khi \`emaMs > dropMs\` liên tục đủ \`holdSamples\` mẫu; nâng tier (index tăng) chỉ khi \`emaMs < riseMs\` liên tục đủ \`holdSamples\` mẫu; mọi mẫu "trung tính" (giữa hai ngưỡng) hoặc đổi hướng phải RESET streak về 0 — đây chính là hysteresis chống flip-flop.`,
      en: `Write a pure function \`nextTierIndex(emaMs, currentIndex, streak, dropMs, riseMs, holdSamples)\` implementing the thermostat pattern correctly: return the new tier index AND the new streak after receiving one \`emaMs\` sample. Drop a tier (lower index) only when \`emaMs > dropMs\` holds for \`holdSamples\` consecutive samples; raise a tier (higher index) only when \`emaMs < riseMs\` holds for \`holdSamples\` consecutive samples; any "neutral" sample (between the two thresholds) or a direction change must RESET the streak to 0 — this is the hysteresis that prevents flip-flopping.`,
    },
    starterCode: `interface TierStreak {
  direction: -1 | 0 | 1;
  count: number;
}

function nextTierIndex(
  emaMs: number,
  currentIndex: number,
  streak: TierStreak,
  dropMs: number,
  riseMs: number,
  holdSamples: number,
  maxIndex: number,
): { index: number; streak: TierStreak } {
  // TODO 1: xác định direction của mẫu này: -1 (xấu, > dropMs), 1 (tốt, < riseMs), 0 (trung tính)
  // TODO 2: nếu direction khác streak.direction hiện tại (hoặc bằng 0) -> reset streak về { direction, count: direction === 0 ? 0 : 1 }
  // TODO 3: nếu direction giống streak.direction VÀ khác 0 -> tăng count; nếu count đạt holdSamples -> đổi index (clamp 0..maxIndex) và reset count về 0
  return { index: currentIndex, streak };
}`,
    solutionCode: `interface TierStreak {
  direction: -1 | 0 | 1;
  count: number;
}

function nextTierIndex(
  emaMs: number,
  currentIndex: number,
  streak: TierStreak,
  dropMs: number,
  riseMs: number,
  holdSamples: number,
  maxIndex: number,
): { index: number; streak: TierStreak } {
  const direction: -1 | 0 | 1 = emaMs > dropMs ? -1 : emaMs < riseMs ? 1 : 0;

  if (direction === 0 || direction !== streak.direction) {
    return { index: currentIndex, streak: { direction, count: direction === 0 ? 0 : 1 } };
  }

  const count = streak.count + 1;
  if (count >= holdSamples) {
    const index = Math.min(maxIndex, Math.max(0, currentIndex + direction));
    return { index, streak: { direction, count: 0 } };
  }
  return { index: currentIndex, streak: { direction, count } };
}`,
    hints: [
      {
        vi: "direction = -1 nghĩa là 'đang tệ, có xu hướng hạ tier' (index giảm), direction = 1 nghĩa là 'đang tốt, có xu hướng nâng tier' (index tăng) — index thấp hơn = tier thấp hơn (giả sử mảng tier sắp theo thứ tự low→high).",
        en: "direction = -1 means 'currently bad, tending toward dropping a tier' (lower index), direction = 1 means 'currently good, tending toward raising a tier' (higher index) — assume the tier array is ordered low→high.",
      },
      {
        vi: "Bất kỳ lúc nào direction đổi (kể cả đổi từ -1 sang 0, hay 0 sang 1) đều phải reset streak — chỉ tích luỹ count khi hai mẫu LIÊN TIẾP có CÙNG direction khác 0.",
        en: "Any time direction changes (even from -1 to 0, or 0 to 1) the streak must reset — only accumulate count when two CONSECUTIVE samples share the SAME nonzero direction.",
      },
    ],
    checklist: [
      {
        vi: "Một mẫu emaMs xấu đơn lẻ (streak trước đó khác hướng hoặc bằng 0) KHÔNG đổi index ngay — chỉ reset streak về 1",
        en: "A single bad emaMs sample (previous streak in a different or zero direction) does NOT change index immediately — it only resets the streak to 1",
      },
      {
        vi: "index chỉ đổi sau đúng holdSamples mẫu liên tiếp cùng hướng, và count reset về 0 ngay sau khi đổi",
        en: "index only changes after exactly holdSamples consecutive same-direction samples, and count resets to 0 right after changing",
      },
      {
        vi: "index luôn được clamp trong khoảng [0, maxIndex], không bao giờ vượt biên",
        en: "index is always clamped within [0, maxIndex], never out of bounds",
      },
    ],
  },
];
