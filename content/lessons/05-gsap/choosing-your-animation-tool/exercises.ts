import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "pick-tool-for-a-scenario",
    kind: "concept",
    prompt: {
      vi: `Bạn đang xây một ứng dụng React nội bộ. Một danh sách gồm khoảng 30 thẻ sản phẩm cần: khi bấm vào một thẻ, nó phóng to mượt từ đúng vị trí/kích thước trong lưới thành một khung xem chi tiết chiếm gần hết màn hình, các thẻ còn lại mờ dần rồi biến mất, và khi đóng khung chi tiết thẻ phải thu lại đúng vị trí ban đầu trong lưới — kể cả khi lưới đã bị cuộn hoặc sắp xếp lại lúc khung chi tiết đang mở.

Không cần viết code, hãy chọn một trong ba công cụ (\`css\`, \`motion\`, \`gsap\`) làm công cụ chính cho hiệu ứng phóng to này, và giải thích bằng đúng các trục quyết định trong bài: vì sao hai công cụ còn lại không phải lựa chọn tốt nhất cho chính tình huống này.`,
      en: `You're building an internal React app. A grid of roughly 30 product cards needs: clicking a card smoothly expands it from its exact grid position/size into a near-fullscreen detail view, the remaining cards fade out, and closing the detail view shrinks the card back to its original grid position — even if the grid has scrolled or reordered while the detail view was open.

Without writing code, pick one of the three tools (\`css\`, \`motion\`, \`gsap\`) as the primary tool for this expand effect, and justify it using this lesson's decision axes: explain why the other two aren't the best fit for this exact situation.`,
    },
    hints: [
      {
        vi: "Đây là bài toán 'vị trí A → vị trí B' của cùng một phần tử DOM khi layout đổi — đúng định nghĩa của kỹ thuật FLIP, không phải một transition hai trạng thái đơn giản.",
        en: "This is an 'element moves from position A to position B when layout changes' problem — the exact definition of FLIP, not a simple two-state transition.",
      },
      {
        vi: "Ứng dụng là React nội bộ — trục 'team/framework' trong bài đã nói thẳng công cụ nào giảm code thừa nhất cho đúng ngữ cảnh này.",
        en: "It's an internal React app — the lesson's 'team/framework' axis already names which tool cuts the most boilerplate for exactly this context.",
      },
    ],
    checklist: [
      {
        vi: "Tôi chọn Motion và giải thích lý do bằng prop `layout` (FLIP tự động, không cần tự đo getBoundingClientRect)",
        en: "I picked Motion and justified it via the `layout` prop (automatic FLIP, no manual getBoundingClientRect)",
      },
      {
        vi: "Tôi giải thích được vì sao CSS không đủ: transition thuần không biết vị trí đích khi layout đổi động",
        en: "I explained why CSS alone isn't enough: a plain transition doesn't know the destination position when layout changes dynamically",
      },
      {
        vi: "Tôi nêu được GSAP Flip vẫn làm được việc này nhưng đòi tự gọi Flip.getState/Flip.from — hợp lý hơn nếu app không phải React, không phải lựa chọn sai nhưng tốn công hơn ở đây",
        en: "I noted GSAP's Flip plugin could do this too but requires manually calling Flip.getState/Flip.from — a better fit outside React, not wrong here but more work for this exact context",
      },
    ],
    solutionCode: `// Công cụ đúng: Motion, dùng prop "layout".
//
// - Truc "do phuc tap bien dao": day la bai toan FLIP (vi tri/kich thuoc
//   A -> B khi layout doi) -- khong phai hai trang thai tinh nen CSS
//   transition thuan khong du (no khong biet toa do dich).
// - Truc "team/framework": ung dung React noi bo -- Motion hieu vong doi
//   component, animate duoc ca AnimatePresence luc the khac roi DOM.
// - GSAP Flip.getState()/Flip.from() giai duoc CHINH XAC bai toan nay,
//   nhung doi tu goi do luong thu cong quanh moi lan layout doi -- hop ly
//   hon khi app khong phai React; o day Motion it code hon cho cung ket qua.`,
  },
  {
    id: "pick-animation-tool-fn",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`pickAnimationTool\` nhận một object mô tả yêu cầu animation và trả về \`"css" | "motion" | "gsap"\` theo đúng thứ tự bốn trục quyết định đã học: nếu chỉ là toggle hai trạng thái đơn giản và không cần scrub theo scroll, trả về \`"css"\`. Nếu cần scrub theo scroll HOẶC số phần tử cần phối hợp từ 4 trở lên, trả về \`"gsap"\` bất kể có phải React hay không. Nếu không rơi vào hai trường hợp trên và đang ở trong React, trả về \`"motion"\`. Mọi trường hợp còn lại trả về \`"gsap"\`.`,
      en: `Write a function \`pickAnimationTool\` that takes an object describing an animation requirement and returns \`"css" | "motion" | "gsap"\` following the exact order of the four decision axes covered in this lesson: if it's only a simple two-state toggle and doesn't need scroll scrub, return \`"css"\`. If it needs scroll scrub OR the number of coordinated elements is 4 or more, return \`"gsap"\` regardless of framework. If neither applies and it's inside React, return \`"motion"\`. Every other case returns \`"gsap"\`.`,
    },
    starterCode: `interface ToolRequest {
  onlySimpleToggle: boolean; // e.g. a hover/focus/active two-state swap
  needsScrub: boolean;       // progress must track scroll position exactly
  elementCount: number;      // elements whose timing must stay coordinated
  isReactComponent: boolean; // will live inside a React component tree
}

type AnimationTool = "css" | "motion" | "gsap";

function pickAnimationTool(req: ToolRequest): AnimationTool {
  // TODO 1: req.onlySimpleToggle && !req.needsScrub -> "css"
  // TODO 2: req.needsScrub || req.elementCount >= 4 -> "gsap" (wins regardless of framework)
  // TODO 3: req.isReactComponent -> "motion"
  // TODO 4: otherwise -> "gsap"
  return "css";
}`,
    solutionCode: `interface ToolRequest {
  onlySimpleToggle: boolean;
  needsScrub: boolean;
  elementCount: number;
  isReactComponent: boolean;
}

type AnimationTool = "css" | "motion" | "gsap";

function pickAnimationTool(req: ToolRequest): AnimationTool {
  if (req.onlySimpleToggle && !req.needsScrub) return "css";
  if (req.needsScrub || req.elementCount >= 4) return "gsap";
  if (req.isReactComponent) return "motion";
  return "gsap";
}`,
    hints: [
      {
        vi: "Kiểm tra theo đúng thứ tự bốn trục trong bài — thứ tự if/else quyết định ai thắng khi nhiều điều kiện cùng đúng.",
        en: "Check in the exact order of the lesson's four axes — the if/else order decides which condition wins when several are true at once.",
      },
      {
        vi: "`needsScrub` luôn thắng `isReactComponent`: một app React vẫn cần GSAP nếu animation phải bám theo scroll.",
        en: "`needsScrub` always beats `isReactComponent`: a React app still needs GSAP if the animation must track scroll.",
      },
    ],
    checklist: [
      {
        vi: "`{ onlySimpleToggle: true, needsScrub: false, elementCount: 1, isReactComponent: true }` trả về `\"css\"`",
        en: "`{ onlySimpleToggle: true, needsScrub: false, elementCount: 1, isReactComponent: true }` returns `\"css\"`",
      },
      {
        vi: "`{ onlySimpleToggle: false, needsScrub: true, elementCount: 1, isReactComponent: true }` trả về `\"gsap\"`, không phải `\"motion\"`",
        en: "`{ onlySimpleToggle: false, needsScrub: true, elementCount: 1, isReactComponent: true }` returns `\"gsap\"`, not `\"motion\"`",
      },
      {
        vi: "`{ onlySimpleToggle: false, needsScrub: false, elementCount: 2, isReactComponent: true }` trả về `\"motion\"`",
        en: "`{ onlySimpleToggle: false, needsScrub: false, elementCount: 2, isReactComponent: true }` returns `\"motion\"`",
      },
    ],
  },
];
