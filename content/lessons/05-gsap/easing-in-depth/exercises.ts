import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "power-ease-by-hand",
    kind: "concept",
    prompt: {
      vi: `\`power1\` (bậc hai) có $ease_{in}(t) = t^2$ và $ease_{out}(t) = 1-(1-t)^2$. Không dùng code, tính $ease_{in}(0.3)$ và $ease_{out}(0.3)$.

Sau đó trả lời: tại $t=0.3$ (mới trôi qua $30\\%$ thời gian), mỗi ease đã hoàn thành bao nhiêu phần trăm QUÃNG ĐƯỜNG chuyển động — và vì sao con số của \`ease_out\` lớn hơn hẳn \`ease_in\`, đúng như tên gọi "out: nhanh lúc đầu, chậm lúc cuối"?`,
      en: `\`power1\` (quadratic) has $ease_{in}(t) = t^2$ and $ease_{out}(t) = 1-(1-t)^2$. Without running code, compute $ease_{in}(0.3)$ and $ease_{out}(0.3)$.

Then answer: at $t=0.3$ (only $30\\%$ of the time elapsed), what percentage of the motion's DISTANCE has each ease already covered — and why is \`ease_out\`'s number so much higher than \`ease_in\`'s, exactly matching the name "out: fast at first, slow at the end"?`,
    },
    hints: [
      {
        vi: `$(1-0.3)^2 = 0.7^2 = 0.49$ — tính bước này trước rồi mới lấy $1$ trừ đi để ra $ease_{out}(0.3)$.`,
        en: `$(1-0.3)^2 = 0.7^2 = 0.49$ — compute that first, then subtract from $1$ to get $ease_{out}(0.3)$.`,
      },
      {
        vi: `So sánh hai kết quả với chính $t=0.3$: \`ease_in\` đi CHẬM hơn thời gian trôi ($0.09 < 0.3$), \`ease_out\` đi NHANH hơn thời gian trôi ($0.51 > 0.3$).`,
        en: `Compare both results with $t=0.3$ itself: \`ease_in\` moves SLOWER than time is passing ($0.09 < 0.3$), \`ease_out\` moves FASTER than time is passing ($0.51 > 0.3$).`,
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng ease_in(0.3) = 0.09",
        en: "I correctly computed ease_in(0.3) = 0.09",
      },
      {
        vi: "Tôi tính đúng ease_out(0.3) = 0.51",
        en: "I correctly computed ease_out(0.3) = 0.51",
      },
      {
        vi: "Tôi giải thích được vì sao ease_out nhanh hơn hẳn ease_in tại cùng t=0.3, khớp với tên gọi in/out",
        en: "I can explain why ease_out is far ahead of ease_in at the same t=0.3, matching the in/out naming",
      },
    ],
    solutionCode: `// ease_in(0.3)  = 0.3^2 = 0.09              -> mới đi được 9% quãng đường
// ease_out(0.3) = 1 - (1 - 0.3)^2
//               = 1 - 0.7^2 = 1 - 0.49 = 0.51 -> đã đi được 51% quãng đường
//
// Tại t=0.3 (30% thời gian trôi qua):
// - ease_in chỉ đạt 9% quãng đường  (9% < 30%)  -> khởi động CHẬM, đúng "in"
// - ease_out đã đạt 51% quãng đường (51% > 30%) -> xuất phát NHANH, đúng "out"
//
// Hai đường cong là ảnh phản chiếu của nhau qua điểm (0.5, 0.5): ease_out
// "mượn" tốc độ mà ease_in để dành ở đoạn cuối, dùng ngay từ đầu.`,
  },
  {
    id: "pick-ease-by-intent",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`pickEase(context)\` nhận vào một trong bốn ngữ cảnh \`"entrance"\`, \`"exit"\`, \`"feedback"\`, \`"ambient"\`, trả về đúng chuỗi tên ease GSAP phù hợp ý đồ cho từng ngữ cảnh đó (theo đúng bảng chọn ease trong bài lý thuyết).`,
      en: `Write a \`pickEase(context)\` function taking one of four contexts — \`"entrance"\`, \`"exit"\`, \`"feedback"\`, \`"ambient"\` — and returning the GSAP ease name string matching each context's intent (following this lesson's ease-by-intent table).`,
    },
    starterCode: `type MotionContext = "entrance" | "exit" | "feedback" | "ambient";

function pickEase(context: MotionContext): string {
  // TODO: trả về ease đúng ý đồ cho từng ngữ cảnh:
  // - entrance: ease-out mạnh vừa
  // - exit: ease-in TƯƠNG ỨNG với entrance (không phải ease-out lặp lại)
  // - feedback: ngắn, dứt khoát
  // - ambient: mượt, không giật ở hai đầu
  return "power1.out";
}`,
    solutionCode: `type MotionContext = "entrance" | "exit" | "feedback" | "ambient";

function pickEase(context: MotionContext): string {
  switch (context) {
    case "entrance":
      return "power2.out";
    case "exit":
      return "power2.in";
    case "feedback":
      return "power1.out";
    case "ambient":
      return "sine.inOut";
  }
}`,
    hints: [
      {
        vi: `entrance và exit dùng CÙNG họ \`power2\` nhưng khác biến thể — \`.out\` để giảm tốc VÀO điểm cuối, \`.in\` để tăng tốc RA khỏi điểm đầu.`,
        en: `entrance and exit use the SAME \`power2\` family but different variants — \`.out\` decelerates INTO the end, \`.in\` accelerates OUT of the start.`,
      },
      {
        vi: `ambient là chuyển động lặp không có điểm dừng gấp ở hai đầu — nghĩ tới họ ease nào mượt đều cả lúc bắt đầu lẫn kết thúc chu kỳ.`,
        en: `ambient is looping motion with no abrupt stop at either end — think of the ease family that stays smooth at both the start and end of a cycle.`,
      },
    ],
    checklist: [
      {
        vi: `entrance trả về "power2.out"`,
        en: `entrance returns "power2.out"`,
      },
      {
        vi: `exit trả về "power2.in" (không lặp lại power2.out của entrance)`,
        en: `exit returns "power2.in" (not a repeat of entrance's power2.out)`,
      },
      {
        vi: `ambient trả về "sine.inOut", không phải một ease họ power hay linear`,
        en: `ambient returns "sine.inOut", not a power-family ease or linear`,
      },
    ],
  },
];
