import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "fov-focal-length",
    kind: "concept",
    prompt: {
      vi: `Không chạy code: một \`PerspectiveCamera\` có \`fov = 50°\`. Tính $f = 1/\\tan(\\text{fov}/2)$.

Sau đó tính lại $f$ khi đổi fov thành $100°$. Trả lời: $f$ tăng hay giảm, và điều đó khiến vật ở CÙNG khoảng cách trông to lên hay nhỏ đi trên màn hình? Cuối cùng: đổi \`camera.fov\` xong mà quên gọi \`camera.updateProjectionMatrix()\` thì hình vẽ ra dùng giá trị $f$ nào — cũ hay mới?`,
      en: `Without running code: a \`PerspectiveCamera\` has \`fov = 50°\`. Compute $f = 1/\\tan(\\text{fov}/2)$.

Then recompute $f$ for fov $= 100°$. State whether $f$ goes up or down, and whether that makes an object at the SAME distance look bigger or smaller on screen. Finally: if you set \`camera.fov\` but forget \`camera.updateProjectionMatrix()\`, which $f$ value does the rendered frame actually use — the old one or the new one?`,
    },
    hints: [
      {
        vi: "tan(25°) ≈ 0.4663, tan(50°) ≈ 1.1918. f = 1/tan(fov/2).",
        en: "tan(25°) ≈ 0.4663, tan(50°) ≈ 1.1918. f = 1/tan(fov/2).",
      },
      {
        vi: "f lớn hơn nghĩa là ma trận P 'phóng to' toạ độ clip nhiều hơn cho cùng một vị trí view-space — liên hệ trực tiếp tới bài Model → View → Projection ở Track 0.",
        en: "A larger f means the P matrix scales clip-space coordinates up more for the same view-space position — connect this directly to the Model → View → Projection lesson in Track 0.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng f(50°) ≈ 2.14 và f(100°) ≈ 0.84",
        en: "Correctly computed f(50°) ≈ 2.14 and f(100°) ≈ 0.84",
      },
      {
        vi: "Giải thích được fov tăng → f giảm → vật trông nhỏ và xa hơn",
        en: "Explained that fov increases → f decreases → objects look smaller and farther",
      },
      {
        vi: "Trả lời đúng: không gọi updateProjectionMatrix() thì frame vẫn dùng f cũ",
        en: "Correctly answered: without updateProjectionMatrix(), the frame still uses the old f",
      },
    ],
    solutionCode: `// f(50°)  = 1 / tan(25°) ≈ 1 / 0.4663 ≈ 2.144
// f(100°) = 1 / tan(50°) ≈ 1 / 1.1918 ≈ 0.839
//
// f giảm khi fov tăng — ma trận P "phóng to" toạ độ clip ít hơn, cùng một
// điểm view-space chiếu ra gần tâm màn hình hơn → vật trông nhỏ và xa hơn.
// Đây chính xác là ống kính góc rộng: nhìn được nhiều hơn, mỗi vật chiếm ít
// pixel hơn.
//
// camera.fov chỉ là property JS thường. projectionMatrix KHÔNG tự cập nhật
// khi field này đổi — thiếu updateProjectionMatrix() thì renderer.render()
// vẫn dùng đúng ma trận P cũ, tính từ f(50°), dù camera.fov đã đọc ra 100.`,
  },
  {
    id: "responsive-three-app",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`createResponsiveApp(canvas)\` khởi tạo \`Scene\`, \`PerspectiveCamera\` và \`WebGLRenderer\` gắn vào \`canvas\`, rồi trả về một hàm \`resize()\` cập nhật đúng cả ba việc bắt buộc khi kích thước canvas đổi: \`renderer.setSize\` (không ghi đè CSS), \`camera.aspect\`, và \`camera.updateProjectionMatrix()\`. Dùng \`canvas.clientWidth\`/\`clientHeight\` làm kích thước CSS.`,
      en: `Write a \`createResponsiveApp(canvas)\` function that sets up a \`Scene\`, \`PerspectiveCamera\`, and \`WebGLRenderer\` attached to \`canvas\`, then returns a \`resize()\` function performing all three mandatory steps when the canvas size changes: \`renderer.setSize\` (without overwriting CSS), \`camera.aspect\`, and \`camera.updateProjectionMatrix()\`. Use \`canvas.clientWidth\`/\`clientHeight\` as the CSS size.`,
    },
    starterCode: `import * as THREE from "three";

function createResponsiveApp(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // TODO: renderer.setSize(w, h, false) — không ghi đè CSS
    // TODO: cập nhật camera.aspect
    // TODO: gọi camera.updateProjectionMatrix()
  }

  resize();
  return { scene, camera, renderer, resize };
}`,
    solutionCode: `import * as THREE from "three";

function createResponsiveApp(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // updateStyle=false: canvas đã được định kích thước bằng CSS, không cần
    // renderer ghi đè inline style.
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Bắt buộc: aspect chỉ là field JS, ma trận P không tự tính lại.
    camera.updateProjectionMatrix();
  }

  resize();
  return { scene, camera, renderer, resize };
}`,
    hints: [
      {
        vi: "renderer.setSize nhận CSS pixel, không phải buffer pixel — không cần tự nhân devicePixelRatio ở đây, renderer làm việc đó nội bộ.",
        en: "renderer.setSize takes CSS pixels, not buffer pixels — no need to multiply by devicePixelRatio yourself here, the renderer handles that internally.",
      },
      {
        vi: "Thứ tự đúng: setSize → gán aspect → updateProjectionMatrix(). Đổi aspect sau khi gọi updateProjectionMatrix() vô nghĩa vì ma trận đã tính xong với giá trị cũ.",
        en: "Correct order: setSize → assign aspect → updateProjectionMatrix(). Changing aspect after calling updateProjectionMatrix() is pointless since the matrix was already computed with the old value.",
      },
    ],
    checklist: [
      {
        vi: "resize() gọi renderer.setSize(w, h, false) — tham số thứ ba là false",
        en: "resize() calls renderer.setSize(w, h, false) — third argument is false",
      },
      {
        vi: "camera.aspect được gán TRƯỚC khi gọi updateProjectionMatrix()",
        en: "camera.aspect is assigned BEFORE calling updateProjectionMatrix()",
      },
      {
        vi: "updateProjectionMatrix() được gọi sau mỗi lần đổi aspect, không bị bỏ sót",
        en: "updateProjectionMatrix() is called after every aspect change, never skipped",
      },
    ],
  },
];
