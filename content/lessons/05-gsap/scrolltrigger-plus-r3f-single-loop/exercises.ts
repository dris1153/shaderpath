import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "double-render-frame-budget",
    kind: "concept",
    prompt: {
      vi: `Ước lượng: một lệnh \`renderer.render(scene, camera)\` cho một scene tầm trung tốn khoảng $3\\text{ms}$ trên GPU tầm trung. Ở $60\\text{fps}$, ngân sách mỗi frame là $\\frac{1000}{60} \\approx 16.67\\text{ms}$.

Nếu một component đăng ký anti-pattern \`gsap.ticker.add(() => renderer.render(...))\` bên cạnh vòng lặp \`<Canvas>\` của R3F, mỗi frame logic sẽ có 2 lệnh render thay vì 1. Tính số ms bị lãng phí mỗi giây (không phải mỗi frame) do lệnh render thừa này, giả sử ổn định ở 60fps.

Sau đó giải thích: vì sao bộ đếm FPS trong DevTools vẫn thường đọc ra ~60fps ngay cả khi có lệnh render thừa này — con số lãng phí đó thực sự lộ ra ở đâu trong tab Performance?`,
      en: `Estimate: a single \`renderer.render(scene, camera)\` call for a mid-complexity scene costs about $3\\text{ms}$ on a mid-tier GPU. At $60\\text{fps}$, the per-frame budget is $\\frac{1000}{60} \\approx 16.67\\text{ms}$.

If a component registers the anti-pattern \`gsap.ticker.add(() => renderer.render(...))\` alongside R3F's \`<Canvas>\` loop, every logical frame now runs 2 render calls instead of 1. Compute how many ms per second (not per frame) are wasted by this extra render call, assuming a steady 60fps.

Then explain: why does the DevTools FPS counter usually still read ~60fps even with this extra render call running — where does that wasted time actually show up in the Performance tab?`,
    },
    hints: [
      {
        vi: "Mỗi giây có 60 frame; mỗi frame thừa ra đúng 1 lệnh render tốn 3ms. Nhân hai số đó lại để ra tổng ms lãng phí mỗi giây.",
        en: "There are 60 frames per second; each frame has exactly 1 extra render call costing 3ms. Multiply those two numbers for the total wasted ms per second.",
      },
      {
        vi: "FPS đếm số lần trình duyệt composite một frame lên màn hình (số lần RAF hoàn tất), không đếm số lệnh render() bên trong mỗi frame đó — hai khái niệm khác nhau.",
        en: "FPS counts how many times the browser composites a frame to the screen (completed RAF ticks), not how many render() calls happened inside each one — those are two different things.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng 60 × 3ms = 180ms bị lãng phí mỗi giây do lệnh render thừa",
        en: "I correctly computed 60 × 3ms = 180ms wasted per second from the extra render call",
      },
      {
        vi: "Tôi giải thích được vì sao 180ms đó nằm gọn trong 1 giây (1000ms) nên không làm giảm số lần composite (FPS) cho tới khi ngân sách frame bị vượt",
        en: "I explained why that 180ms fits inside 1 second (1000ms) so it doesn't reduce the composite count (FPS) until the per-frame budget is actually exceeded",
      },
      {
        vi: "Tôi nêu được thời gian lãng phí này lộ ra ở khối \"Rendering\"/GPU trong DevTools Performance, không phải ở con số FPS",
        en: "I identified that this wasted time shows up in the \"Rendering\"/GPU block in DevTools Performance, not in the FPS number itself",
      },
    ],
    solutionCode: `// 60 frame/giây × 1 lệnh render thừa/frame × 3ms/lệnh = 180ms lãng phí MỖI GIÂY.
// Tính theo % ngân sách: 3ms thừa trên 16.67ms ngân sách mỗi frame ≈ 18% mỗi frame.
//
// FPS đếm số lần trình duyệt hoàn tất một RAF tick và composite lên màn hình —
// chừng nào tổng công việc trong tick đó (bao gồm cả 2 lệnh render) còn dưới
// 16.67ms, trình duyệt vẫn kịp 60 tick/giây, nên FPS không đổi. Thời gian lãng
// phí không "biến mất" — nó cộng dồn vào khối Rendering/GPU trong tab
// Performance, và chỉ khi tổng công việc mỗi frame VƯỢT 16.67ms (scene phức
// tạp hơn, hoặc GPU yếu hơn) thì FPS mới thực sự tụt xuống nhìn thấy được.`,
  },
  {
    id: "fix-competing-render-loops",
    kind: "code",
    prompt: {
      vi: `Hàm \`wireCamera\` bên dưới mô phỏng lại đúng anti-pattern của bài học: nó vừa cập nhật \`progress.value\` từ ScrollTrigger, vừa tự đăng ký một lệnh render thứ hai qua \`ticker.add\`. Sửa lại \`wireCamera\` theo quy tắc single-render-loop: chỉ còn đúng một nguồn ghi \`progress\`, không được gọi \`render\` hay \`ticker.add\` ở bất kỳ đâu trong hàm này — việc render vẫn thuộc về \`useFrame\` phía R3F, không phải file này.`,
      en: `The \`wireCamera\` function below reproduces the lesson's exact anti-pattern: it updates \`progress.value\` from ScrollTrigger, but also registers a second render call via \`ticker.add\`. Fix \`wireCamera\` to follow the single-render-loop rule: keep exactly one writer for \`progress\`, and never call \`render\` or \`ticker.add\` anywhere in this function — rendering still belongs to \`useFrame\` on the R3F side, not this file.`,
    },
    starterCode: `interface Progress {
  value: number;
}

interface FakeTicker {
  add: (fn: () => void) => void;
}

interface FakeScrollTrigger {
  onUpdate: (fn: (progress: number) => void) => void;
}

// SAI: hàm này vừa ghi progress, vừa tự gọi render qua ticker — hai
// nguồn render cạnh tranh cho cùng một cảnh.
function wireCamera(
  scrollTrigger: FakeScrollTrigger,
  ticker: FakeTicker,
  render: () => void,
): Progress {
  const progress: Progress = { value: 0 };
  scrollTrigger.onUpdate((p) => {
    progress.value = p;
  });
  // TODO: xoá render loop thứ hai này — R3F đã tự render qua useFrame
  ticker.add(() => render());
  return progress;
}`,
    solutionCode: `interface Progress {
  value: number;
}

interface FakeScrollTrigger {
  onUpdate: (fn: (progress: number) => void) => void;
}

// Đúng: ScrollTrigger chỉ mutate progress — không có lệnh render nào ở
// đây cả. useFrame bên R3F đọc progress.value và tự quyết định khi render.
function wireCamera(scrollTrigger: FakeScrollTrigger): Progress {
  const progress: Progress = { value: 0 };
  scrollTrigger.onUpdate((p) => {
    progress.value = p;
  });
  return progress;
}`,
    hints: [
      {
        vi: "render() và ticker.add(...) không nên xuất hiện trong file này ở đâu cả — chúng thuộc về vòng lặp mà R3F đã quản lý.",
        en: "render() and ticker.add(...) shouldn't appear anywhere in this file — they belong to the loop R3F already manages.",
      },
      {
        vi: "wireCamera vẫn cần trả về đúng object progress để phía useFrame còn có gì mà đọc.",
        en: "wireCamera still needs to return the progress object so the useFrame side has something to read.",
      },
    ],
    checklist: [
      {
        vi: "solutionCode không gọi render() hay ticker.add ở bất kỳ dòng nào",
        en: "solutionCode never calls render() or ticker.add anywhere",
      },
      {
        vi: "wireCamera vẫn trả về đúng object progress mà useFrame có thể đọc value",
        en: "wireCamera still returns the progress object that useFrame can read value from",
      },
      {
        vi: "Tham số render/ticker không còn cần thiết đã được bỏ khỏi chữ ký hàm",
        en: "The now-unnecessary render/ticker parameters were removed from the function signature",
      },
    ],
  },
];
