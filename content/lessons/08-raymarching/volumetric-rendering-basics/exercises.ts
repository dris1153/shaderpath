import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "transmittance-decay-and-early-exit",
    kind: "concept",
    prompt: {
      vi: `Một volumetric march đi qua một đám mây đồng nhất sao cho MỖI bước làm transmittance $T$ nhân thêm hệ số $0.85$ (mỗi lát hấp thụ 15% ánh sáng còn lại). $T$ bắt đầu bằng $1$. Không chạy code, tính $T$ sau $5$ bước và sau $15$ bước.

Sau đó: nếu vòng lặp early-exit khi $T < 0.01$, bước thứ mấy là bước ĐẦU TIÊN thoả điều kiện dừng?`,
      en: `A volumetric march through a uniform cloud is set up so EACH step multiplies transmittance $T$ by a factor of $0.85$ (each slab absorbs 15% of the remaining light). $T$ starts at $1$. Without running code, compute $T$ after $5$ steps and after $15$ steps.

Then: if the loop early-exits once $T < 0.01$, which step is the FIRST one to satisfy that condition?`,
    },
    hints: [
      {
        vi: "Sau $n$ bước, $T = 0.85^n$ — đây chính là dạng rời rạc của $e^{-\\rho \\Delta s \\cdot n}$ từ phần lý thuyết, chỉ viết bằng phép nhân lặp lại thay vì một `exp()` liên tục.",
        en: "After $n$ steps, $T = 0.85^n$ — this is exactly the discrete form of $e^{-\\rho \\Delta s \\cdot n}$ from the theory, just written as repeated multiplication instead of a continuous `exp()`.",
      },
      {
        vi: "Muốn tìm $n$ nhỏ nhất sao cho $0.85^n < 0.01$, lấy log hai vế: $n > \\ln(0.01)/\\ln(0.85)$. Cả hai log đều âm, chia hai số âm ra một số dương.",
        en: "To find the smallest $n$ with $0.85^n < 0.01$, take logs of both sides: $n > \\ln(0.01)/\\ln(0.85)$. Both logs are negative, so dividing two negatives gives a positive.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $T(5) \\approx 0.444$ và $T(15) \\approx 0.0874$",
        en: "I correctly computed $T(5) \\approx 0.444$ and $T(15) \\approx 0.0874$",
      },
      {
        vi: "Tôi tìm đúng bước thứ 29 là bước đầu tiên có $T < 0.01$ (bước 28 vẫn còn $T \\approx 0.0106$)",
        en: "I correctly found step 29 as the first step with $T < 0.01$ (step 28 still has $T \\approx 0.0106$)",
      },
      {
        vi: "Tôi giải thích được vì sao early-exit ở bước 29 tiết kiệm march so với luôn chạy hết một ngân sách cố định 64 hoặc 96 bước",
        en: "I can explain why early-exiting at step 29 saves marching compared to always running a fixed budget of 64 or 96 steps",
      },
    ],
    solutionNote: {
      vi: `$T(n) = 0.85^n$. $T(5) = 0.85^5 \\approx 0.4437$. $T(15) = 0.85^{15} \\approx 0.0874$.

$n$ nhỏ nhất thoả $0.85^n < 0.01$: $n > \\ln(0.01) / \\ln(0.85) = (-4.6052) / (-0.16252) \\approx 28.33$, nên $n = 29$ (bước 28 vẫn còn $T \\approx 0.0106$, vẫn lớn hơn $0.01$).`,
      en: `$T(n) = 0.85^n$. $T(5) = 0.85^5 \\approx 0.4437$. $T(15) = 0.85^{15} \\approx 0.0874$.

Smallest $n$ with $0.85^n < 0.01$: $n > \\ln(0.01) / \\ln(0.85) = (-4.6052) / (-0.16252) \\approx 28.33$, so $n = 29$ (step 28 still has $T \\approx 0.0106$, still above $0.01$).`,
    },
  },
  {
    id: "playground-volume-march",
    kind: "shader",
    prompt: {
      vi: `Trong playground, \`densityAt(x)\` mô tả một "lát mây" 1D dọc trục $x \\in [0,1]$ (một hình chuông quanh $x=0.5$). Với mỗi pixel, march từ $x=0$ tới đúng giá trị \`uv.x\` của pixel đó bằng \`steps\` bước đều nhau, cài đặt đúng vòng lặp tích luỹ front-to-back: cộng \`T * density * stepLen * emitted\` vào \`acc\` TRƯỚC, rồi mới nhân $T$ với \`exp(-density * stepLen)\`, và \`break\` sớm khi $T < 0.01$. Kết quả đúng: quét từ trái sang phải, màu chuyển dần từ nền sang màu mây quanh $x=0.5$ rồi giữ nguyên (không đổi màu ngược lại).`,
      en: `In the playground, \`densityAt(x)\` describes a 1D "cloud slice" along $x \\in [0,1]$ (a bell shape centered at $x=0.5$). For each pixel, march from $x=0$ to that pixel's own \`uv.x\` value in \`steps\` equal steps, implementing the correct front-to-back accumulation loop: add \`T * density * stepLen * emitted\` to \`acc\` FIRST, then multiply $T$ by \`exp(-density * stepLen)\`, and \`break\` early once $T < 0.01$. Correct result: scanning left to right, the color fades from background toward the cloud color around $x=0.5$, then holds steady (never reverses).`,
    },
    starterCode: `float densityAt(float x) {
  float d = exp(-pow((x - 0.5) * 6.0, 2.0));
  return d * 3.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  int steps = 40;
  float stepLen = uv.x / float(steps);
  vec3 emitted = vec3(1.0, 0.97, 0.9);

  float T = 1.0;
  vec3 acc = vec3(0.0);

  for (int i = 0; i < steps; i++) {
    float x = float(i) * stepLen;
    float density = densityAt(x);
    // TODO 1: acc += T * density * stepLen * emitted (use T BEFORE updating it)
    // TODO 2: T *= exp(-density * stepLen)
    // TODO 3: break early once T < 0.01
  }

  vec3 bg = vec3(0.05, 0.06, 0.1);
  vec3 color = acc + T * bg;
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float densityAt(float x) {
  float d = exp(-pow((x - 0.5) * 6.0, 2.0));
  return d * 3.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  int steps = 40;
  float stepLen = uv.x / float(steps);
  vec3 emitted = vec3(1.0, 0.97, 0.9);

  float T = 1.0;
  vec3 acc = vec3(0.0);

  for (int i = 0; i < steps; i++) {
    float x = float(i) * stepLen;
    float density = densityAt(x);
    acc += T * density * stepLen * emitted;
    T *= exp(-density * stepLen);
    if (T < 0.01) break;
  }

  vec3 bg = vec3(0.05, 0.06, 0.1);
  vec3 color = acc + T * bg;
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "`stepLen` đã tính sẵn theo `uv.x` — mỗi pixel march một quãng khác nhau, không cần đổi hằng số `steps`.",
        en: "`stepLen` is already computed from `uv.x` — every pixel marches a different span, no need to change the `steps` constant.",
      },
      {
        vi: "TODO 1 và TODO 2 không hoán đổi thứ tự được: cộng vào `acc` bằng `T` CÒN NGUYÊN của bước này, chỉ SAU ĐÓ mới suy hao `T` để dùng cho bước kế tiếp.",
        en: "TODO 1 and TODO 2 cannot swap order: add to `acc` using this step's UN-attenuated `T`, and only THEN attenuate `T` for the next step.",
      },
    ],
    checklist: [
      {
        vi: "Vùng gần $x=0$ giữ gần như nguyên màu nền (background)",
        en: "The region near $x=0$ stays close to the background color",
      },
      {
        vi: "Màu chuyển dần rõ rệt sang màu mây khi quét qua $x \\approx 0.5$",
        en: "The color visibly shifts toward the cloud color when scanning past $x \\approx 0.5$",
      },
      {
        vi: "Sau khi qua đỉnh mây, màu giữ ổn định (không dao động ngược lại) cho tới $x=1$",
        en: "After passing the cloud's peak, the color holds steady (no reversal) out to $x=1$",
      },
    ],
  },
];
