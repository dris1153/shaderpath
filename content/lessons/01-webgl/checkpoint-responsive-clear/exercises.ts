import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-responsive-clear",
    kind: "build",
    prompt: {
      vi: `Dựng một canvas WebGL2 phủ kín màn hình, dùng đúng các mảnh ghép của bài trước — không thư viện ngoài.

Yêu cầu: khởi tạo context với \`alpha: false\`; resize buffer đúng bằng $\\operatorname{round}(\\text{clientSize} \\times \\text{dpr})$, dpr clamp tối đa $2$, chỉ gán lại \`canvas.width\`/\`height\` và gọi \`gl.viewport\` khi kích thước thực sự đổi; mỗi frame tăng một biến \`hue\` theo thời gian trôi qua (không phải hằng số cố định mỗi frame — dùng delta time để tốc độ không phụ thuộc refresh rate màn hình), chuyển \`hue\` sang RGB bằng HSL→RGB rồi gọi \`gl.clearColor\` + \`gl.clear\`.

Gợi ý cấu trúc: một hàm \`resizeCanvasToDisplaySize\` (từ bài trước) và một hàm \`hslToRgb(h, s, l)\`, gọi cả hai trong vòng lặp \`requestAnimationFrame\`.`,
      en: `Build a WebGL2 canvas that fills the screen, reusing the exact pieces from the previous lesson — no external libraries.

Requirements: initialize the context with \`alpha: false\`; resize the buffer correctly using $\\operatorname{round}(\\text{clientSize} \\times \\text{dpr})$ with dpr capped at $2$, only reassigning \`canvas.width\`/\`height\` and calling \`gl.viewport\` when the size actually changed; every frame, advance a \`hue\` variable by elapsed time (not a fixed constant per frame — use delta time so the speed doesn't depend on the screen's refresh rate), convert \`hue\` to RGB via HSL→RGB, then call \`gl.clearColor\` + \`gl.clear\`.

Suggested structure: a \`resizeCanvasToDisplaySize\` helper (from the previous lesson) and an \`hslToRgb(h, s, l)\` helper, both called inside the \`requestAnimationFrame\` loop.`,
    },
    starterCode: `const canvas = document.querySelector("canvas")!;
const gl = canvas.getContext("webgl2", { alpha: false })!;
if (!gl) throw new Error("WebGL2 not supported");

function resizeCanvasToDisplaySize(dprCap = 2) {
  // TODO 1: dpr = min(current devicePixelRatio, dprCap)
  // TODO 2: width/height = round(clientWidth/clientHeight * dpr)
  // TODO 3: only assign canvas.width/height and call gl.viewport when the size actually changed
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  // TODO 4: convert HSL to RGB, return each channel in [0, 1]
  return [0, 0, 0];
}

let hue = 0;
let lastT = performance.now();
function draw(t: number) {
  resizeCanvasToDisplaySize();

  // TODO 5: compute delta time, advance hue at a fixed rate (degrees/second), keep it within [0, 360)
  // TODO 6: convert hue -> rgb, call gl.clearColor then gl.clear

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
    solutionCode: `const canvas = document.querySelector("canvas")!;
const gl = canvas.getContext("webgl2", { alpha: false })!;
if (!gl) throw new Error("WebGL2 not supported");

function resizeCanvasToDisplaySize(dprCap = 2) {
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
  const width = Math.round(canvas.clientWidth * dpr);
  const height = Math.round(canvas.clientHeight * dpr);
  const changed = canvas.width !== width || canvas.height !== height;
  if (changed) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
  return changed;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [r + m, g + m, b + m];
}

let hue = 0;
let lastT = performance.now();
function draw(t: number) {
  resizeCanvasToDisplaySize();

  const dt = t - lastT;
  lastT = t;
  hue = (hue + dt * 0.03) % 360; // ~30 deg/s, independent of refresh rate

  const [r, g, b] = hslToRgb(hue, 0.6, 0.5);
  gl.clearColor(r, g, b, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
    referenceImage: "/figures/01-webgl/checkpoint-responsive-clear.svg",
    hints: [
      {
        vi: "resizeCanvasToDisplaySize là hàm y hệt bài trước — chỉ so sánh canvas.width/height với round(clientSize × dpr) trước khi gán, và luôn gọi gl.viewport ngay sau khi gán.",
        en: "resizeCanvasToDisplaySize is the exact same function from the previous lesson — compare canvas.width/height against round(clientSize × dpr) before assigning, and always call gl.viewport right after assigning.",
      },
      {
        vi: "Dùng delta time (t hiện tại trừ t frame trước) để tăng hue theo tốc độ cố định (độ/giây), không dùng hue += hằng số mỗi frame — tốc độ đó phụ thuộc refresh rate màn hình.",
        en: "Use delta time (current t minus the previous frame's t) to advance hue at a fixed speed (degrees/second), not hue += a constant every frame — that speed depends on the screen's refresh rate.",
      },
      {
        vi: "HSL→RGB không cần thư viện: công thức chuẩn chỉ có một hằng số c = (1 - |2l - 1|) × s và 6 nhánh theo h/60 — tra công thức nếu quên, đừng đoán.",
        en: "HSL→RGB needs no library: the standard formula is just one constant c = (1 - |2l - 1|) × s and 6 branches based on h/60 — look the formula up if you forget it, don't guess.",
      },
    ],
    checklist: [
      {
        vi: "Canvas nét ở devicePixelRatio lớn hơn 1 (kiểm tra bằng DevTools device toolbar hoặc zoom trình duyệt)",
        en: "Canvas stays crisp at devicePixelRatio above 1 (check with the DevTools device toolbar or browser zoom)",
      },
      {
        vi: "Không bị giãn/méo hình sau khi resize cửa sổ trình duyệt",
        en: "No stretching or distortion after resizing the browser window",
      },
      {
        vi: "Màu clear chuyển mượt liên tục qua các hue, không giật hay lặp đột ngột",
        en: "The clear color cycles smoothly and continuously through hues, with no jumps or sudden repeats",
      },
      {
        vi: "Buffer chỉ được gán lại khi kích thước CSS thực sự đổi, không reallocate mỗi frame",
        en: "The buffer is only reassigned when the CSS size actually changed, not reallocated every frame",
      },
      {
        vi: "Toàn bộ animation chạy bằng requestAnimationFrame, không setInterval",
        en: "The whole animation runs on requestAnimationFrame, not setInterval",
      },
      {
        vi: "Không dùng thư viện ngoài (Three.js, GSAP...) — chỉ WebGL2 API và Math thuần",
        en: "No external libraries (Three.js, GSAP...) — just the WebGL2 API and plain Math",
      },
    ],
  },
];
