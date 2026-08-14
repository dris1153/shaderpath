import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "context-budget-reasoning",
    kind: "concept",
    prompt: {
      vi: `Một trang tổng hợp muốn hiện đồng thời 24 khung nhìn 3D nhỏ — ví dụ một lưới xem trước 24 model sản phẩm — trên cùng một trang. Cách 1: mỗi khung nhìn là một \`<Canvas>\` riêng, tức 24 context WebGL. Cách 2: một \`<Canvas>\` duy nhất, 24 vùng vẽ bằng \`View\` của drei — 1 context WebGL, nhưng \`gl.render()\` được gọi 24 lần mỗi frame với scissor khác nhau.

Biết trình duyệt thường giới hạn khoảng 8 đến 16 context WebGL sống cùng lúc, hãy giải thích cách 1 sẽ hỏng ở đâu, và vì sao cách 2 không chạm ngưỡng đó — dù vẫn phải trả giá bằng thứ gì.`,
      en: `A dashboard page wants to show 24 small 3D viewports at once — say, a preview grid of 24 product models — on the same page. Approach 1: one \`<Canvas>\` per viewport, meaning 24 WebGL contexts. Approach 2: a single \`<Canvas>\`, 24 regions drawn via drei's \`View\` — 1 WebGL context, but \`gl.render()\` gets called 24 times per frame with a different scissor rect each time.

Given that browsers typically cap live WebGL contexts around 8 to 16, explain where approach 1 breaks down, and why approach 2 avoids that ceiling — while still paying for something else.`,
    },
    hints: [
      {
        vi: "Context thứ 9 hoặc 17 (tuỳ trình duyệt) không tạo lỗi rõ ràng — trình duyệt âm thầm huỷ context CŨ NHẤT đang sống để nhường chỗ; canvas đó mất toàn bộ nội dung.",
        en: "The 9th or 17th context (depending on the browser) doesn't throw an obvious error — the browser silently loses the OLDEST live context to make room; that canvas loses everything it was showing.",
      },
      {
        vi: "Cách 2 chỉ có 1 context nên không đụng giới hạn, nhưng render call vẫn chạy 24 lần mỗi frame — cái gì KHÔNG bị nhân 24 lần (context, driver overhead) và cái gì VẪN bị nhân 24 lần (draw call, và geometry/texture nếu không được chia sẻ)?",
        en: "Approach 2 only opens 1 context so it never hits the limit, but the render call still runs 24 times per frame — what does NOT get multiplied by 24 (context, driver overhead) and what STILL does (draw calls, and geometry/textures if they aren't shared)?",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được hiện tượng context bị mất khi vượt ngưỡng 8–16 (huỷ context cũ nhất, không phải lỗi ồn ào)",
        en: "I can explain what happens when the 8–16 ceiling is crossed (oldest context lost, not a loud error)",
      },
      {
        vi: "Tôi chỉ ra được cách 2 chỉ tốn 1 context nhưng vẫn tốn N lần gl.render() mỗi frame",
        en: "I identified that approach 2 only costs 1 context but still costs N gl.render() calls per frame",
      },
      {
        vi: "Tôi nêu được ít nhất một chi phí KHÔNG biến mất khi gộp về 1 canvas (ví dụ: vẫn N scene/camera trong bộ nhớ, vẫn N draw call)",
        en: "I named at least one cost that does NOT disappear when consolidating to 1 canvas (e.g. still N scenes/cameras in memory, still N draw calls)",
      },
    ],
    solutionCode: `// Cách 1: context thứ 9-17 (tuỳ trình duyệt) khiến trình duyệt LOSE
// context CŨ NHẤT đang sống (LRU) để nhường chỗ — canvas đó nhận sự kiện
// "webglcontextlost", nội dung biến mất, phải tự bắt sự kiện để phục hồi.
// Với 24 khung nhìn, một số canvas sẽ trắng ngay khi trang tải xong.
//
// Cách 2 chỉ mở đúng 1 context nên không bao giờ chạm ngưỡng đó — nhưng
// vẫn phải gl.render() 24 lần mỗi frame (một lần mỗi View/scissor rect),
// vẫn cần 24 scene + camera sống trong bộ nhớ JS, và nếu 24 model dùng
// texture/geometry khác nhau thì bộ nhớ GPU cho DỮ LIỆU đó không giảm.
// Cái được tiết kiệm là chi phí KHỞI TẠO CONTEXT (biên dịch lại shader,
// driver overhead riêng) và khả năng CHIA SẺ tài nguyên — một texture
// nạp một lần, dùng chung cho nhiều scene nếu nội dung trùng nhau.`,
  },
  {
    id: "raw-scissor-loop",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`renderViewports\` nhận \`renderer\` (\`THREE.WebGLRenderer\`) và một mảng \`viewports\` — mỗi phần tử có \`scene\`, \`camera\`, và \`rect: { left, bottom, width, height }\` tính bằng pixel, gốc DƯỚI-TRÁI đúng quy ước WebGL. Hàm phải: dọn sạch toàn bộ canvas một lần (chưa bật scissor), rồi với mỗi viewport — bật scissor test, set viewport và scissor đúng theo \`rect\`, và render đúng scene/camera của viewport đó. Đây chính là kỹ thuật thấp tầng mà \`View\` của drei bọc lại.`,
      en: `Write a \`renderViewports\` function taking \`renderer\` (a \`THREE.WebGLRenderer\`) and an array of \`viewports\` — each with a \`scene\`, a \`camera\`, and a \`rect: { left, bottom, width, height }\` in pixels, origin BOTTOM-LEFT per WebGL convention. The function must: clear the whole canvas once (scissor not yet enabled), then for each viewport — enable the scissor test, set the viewport and scissor to that \`rect\`, and render that viewport's own scene/camera. This is exactly the low-level technique drei's \`View\` wraps.`,
    },
    starterCode: `interface Viewport {
  scene: THREE.Scene;
  camera: THREE.Camera;
  rect: { left: number; bottom: number; width: number; height: number };
}

function renderViewports(renderer: THREE.WebGLRenderer, viewports: Viewport[]) {
  // TODO 1: tắt scissor test, dọn sạch toàn bộ canvas MỘT LẦN
  // TODO 2: với mỗi viewport — bật scissor test, setViewport + setScissor
  //         theo rect, rồi renderer.render(scene, camera)
}`,
    solutionCode: `function renderViewports(renderer: THREE.WebGLRenderer, viewports: Viewport[]) {
  renderer.setScissorTest(false);
  renderer.clear(true, true, true);

  for (const { scene, camera, rect } of viewports) {
    renderer.setScissorTest(true);
    renderer.setViewport(rect.left, rect.bottom, rect.width, rect.height);
    renderer.setScissor(rect.left, rect.bottom, rect.width, rect.height);
    renderer.render(scene, camera);
  }

  renderer.setScissorTest(false);
}`,
    hints: [
      {
        vi: "`renderer.clear()` chỉ dọn đúng vùng scissor NẾU scissor test đang bật — vì vậy phải tắt scissor test trước lần clear đầu tiên, nếu không các viewport sau sẽ vẽ chồng lên rác của frame trước.",
        en: "`renderer.clear()` only clears the scissor region IF the scissor test is enabled — so you must disable it before that first clear, or later viewports will paint over the previous frame's leftovers.",
      },
      {
        vi: "`setViewport` và `setScissor` nhận cùng 4 tham số (left, bottom, width, height) — quên gọi một trong hai khiến hình bị kéo méo (thiếu viewport) hoặc tràn ra ngoài rect (thiếu scissor).",
        en: "`setViewport` and `setScissor` take the same 4 arguments (left, bottom, width, height) — skipping either one stretches the image (missing viewport) or lets it bleed outside the rect (missing scissor).",
      },
    ],
    checklist: [
      {
        vi: "Gọi `setScissorTest(false)` + `clear()` đúng một lần cho toàn canvas trước khi vào vòng lặp",
        en: "Calls `setScissorTest(false)` + `clear()` exactly once for the whole canvas before the loop",
      },
      {
        vi: "Mỗi viewport gọi cả `setViewport` VÀ `setScissor` với cùng 4 giá trị của rect",
        en: "Each viewport calls both `setViewport` AND `setScissor` with the same 4 rect values",
      },
      {
        vi: "`renderer.render(scene, camera)` dùng đúng scene/camera của TỪNG viewport, không phải một cặp cố định",
        en: "`renderer.render(scene, camera)` uses each viewport's OWN scene/camera, not one fixed pair",
      },
    ],
  },
];
