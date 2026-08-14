import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "flip-invert-math",
    kind: "concept",
    prompt: {
      vi: `Một thẻ ở trạng thái First có bounding rect $x=24, y=40, w=160, h=120$. Sau khi bạn đổi class để nó trở thành panel nổi bật, trạng thái Last đo được $x=320, y=40, w=480, h=320$.

Không chạy code, tính bốn giá trị mà bước Invert của Flip sẽ dùng để dựng \`transform\`: $\\Delta x$, $\\Delta y$, $s_x$, $s_y$ theo đúng công thức trong bài học. Sau đó giải thích bằng lời: ngay sau khi \`transform: translate(\\Delta x, \\Delta y) scale(s_x, s_y)\` được áp, vì sao phần tử vẫn TRÔNG như đang ở vị trí/kích thước First, dù DOM/layout bên dưới đã hoàn toàn ở trạng thái Last?`,
      en: `A card in the First state has bounding rect $x=24, y=40, w=160, h=120$. After you swap a class to turn it into a featured panel, the Last state measures $x=320, y=40, w=480, h=320$.

Without running any code, compute the four values Flip's Invert step uses to build its \`transform\`: $\\Delta x$, $\\Delta y$, $s_x$, $s_y$, using the exact formula from the lesson. Then explain in words: right after \`transform: translate(\\Delta x, \\Delta y) scale(s_x, s_y)\` is applied, why does the element still LOOK like it's at the First position/size, even though the underlying DOM/layout has fully moved to the Last state?`,
    },
    hints: [
      {
        vi: "Δx = x_first - x_last, Δy = y_first - y_last — hai phép trừ đơn giản, tính trước.",
        en: "Δx = x_first - x_last, Δy = y_first - y_last — two plain subtractions, work these out first.",
      },
      {
        vi: "s_x = w_first / w_last, s_y = h_first / h_last — là TỈ SỐ, không phải hiệu số; kết quả luôn nhỏ hơn 1 khi phần tử phóng to từ First sang Last.",
        en: "s_x = w_first / w_last, s_y = h_first / h_last — a RATIO, not a difference; the result is always under 1 when the element grows from First to Last.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng Δx = -296 và Δy = 0",
        en: "I computed Δx = -296 and Δy = 0 correctly",
      },
      {
        vi: "Tôi tính đúng s_x = 160/480 ≈ 0.333 và s_y = 120/320 = 0.375",
        en: "I computed s_x = 160/480 ≈ 0.333 and s_y = 120/320 = 0.375 correctly",
      },
      {
        vi: "Tôi giải thích được vì sao transform này che giấu đúng sự thay đổi layout đã xảy ra, khiến mắt không thấy bước nhảy",
        en: "I can explain why this transform exactly cancels the layout change that already happened, so the eye never sees a jump",
      },
    ],
    solutionNote: {
      vi: `$\\Delta x = x_{first} - x_{last} = 24 - 320 = -296$
$\\Delta y = y_{first} - y_{last} = 40 - 40 = 0$
$s_x = w_{first} / w_{last} = 160 / 480 \\approx 0.333$
$s_y = h_{first} / h_{last} = 120 / 320 = 0.375$

\`transform: translate(-296px, 0px) scale(0.333, 0.375)\` đặt phần tử đúng vào vị trí/kích thước First về mặt hình ảnh — dịch nó lùi lại 296px theo x và co nhỏ đúng theo tỉ lệ width/height cũ-trên-mới.

DOM/layout bên dưới đã ở Last ($x=320, w=480$) từ trước khi transform này được áp, nhưng transform là hiệu ứng THỊ GIÁC thuần tuý (không ảnh hưởng box model), nên trình duyệt vẫn coi phần tử "chiếm chỗ" đúng như Last, chỉ có VẺ NGOÀI của nó bị dịch/co để trông giống First.`,
      en: `$\\Delta x = x_{first} - x_{last} = 24 - 320 = -296$
$\\Delta y = y_{first} - y_{last} = 40 - 40 = 0$
$s_x = w_{first} / w_{last} = 160 / 480 \\approx 0.333$
$s_y = h_{first} / h_{last} = 120 / 320 = 0.375$

\`transform: translate(-296px, 0px) scale(0.333, 0.375)\` places the element exactly at the First position/size visually — shifting it back 296px on x and shrinking it by the old-over-new width/height ratio.

The underlying DOM/layout is already at Last ($x=320, w=480$) before this transform is applied, but transform is a purely VISUAL effect (it doesn't affect the box model), so the browser still treats the element as "occupying" exactly the Last box — only its APPEARANCE is shifted/scaled to look like First.`,
    },
  },
  {
    id: "flip-compute-delta-fn",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`computeFlipDelta(first, last)\` nhận vào hai object dạng \`{x, y, width, height}\` (First và Last), trả về đúng transform mà bước Invert của Flip sẽ áp: \`{ dx, dy, sx, sy }\`. Đây chính là công thức lõi mà GSAP tính bên trong \`Flip.getState\`/\`Flip.from\` — viết lại thủ công để nắm chắc cơ chế trước khi dùng plugin như một hộp đen.`,
      en: `Write a \`computeFlipDelta(first, last)\` function taking two \`{x, y, width, height}\` objects (First and Last), returning exactly the transform Flip's Invert step would apply: \`{ dx, dy, sx, sy }\`. This is the core formula GSAP computes internally inside \`Flip.getState\`/\`Flip.from\` — write it by hand to lock in the mechanism before treating the plugin as a black box.`,
    },
    starterCode: `interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlipDelta {
  dx: number;
  dy: number;
  sx: number;
  sy: number;
}

function computeFlipDelta(first: Rect, last: Rect): FlipDelta {
  // TODO: dx/dy = position offset First - Last
  // TODO: sx/sy = size ratio First / Last
  return { dx: 0, dy: 0, sx: 1, sy: 1 };
}`,
    solutionCode: `interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlipDelta {
  dx: number;
  dy: number;
  sx: number;
  sy: number;
}

function computeFlipDelta(first: Rect, last: Rect): FlipDelta {
  return {
    dx: first.x - last.x,
    dy: first.y - last.y,
    sx: first.width / last.width,
    sy: first.height / last.height,
  };
}`,
    hints: [
      {
        vi: "dx/dy chỉ là phép trừ toạ độ đơn giản — không cần biết gì về CSS transform để viết đúng.",
        en: "dx/dy are just plain coordinate subtraction — no CSS transform knowledge needed to get this right.",
      },
      {
        vi: "sx/sy là TỈ SỐ kích thước (chia), không phải hiệu số (trừ) — nhầm phép tính ở đây là lỗi hay gặp nhất.",
        en: "sx/sy are a size RATIO (division), not a difference (subtraction) — mixing these up is the most common mistake here.",
      },
    ],
    checklist: [
      {
        vi: "computeFlipDelta trả về dx âm khi First nằm bên trái Last",
        en: "computeFlipDelta returns a negative dx when First sits to the left of Last",
      },
      {
        vi: "sx < 1 khi phần tử phóng to từ First sang Last (khớp với ví dụ ở bài tập concept)",
        en: "sx < 1 when the element grows from First to Last (matches the concept exercise's example)",
      },
      {
        vi: "Hàm không phụ thuộc DOM thật — chạy được với object thuần, dễ viết unit test",
        en: "The function has no real-DOM dependency — it runs on plain objects, easy to unit test",
      },
    ],
  },
];
