import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-wireframe-cube",
    kind: "build",
    prompt: {
      vi: `Dựng một khối lập phương wireframe xoay liên tục trên canvas 2D — toàn bộ pipeline model → view → projection → screen tự viết tay, không WebGL, không three.js, không thư viện ma trận.

Yêu cầu: viết \`multiplyMat4\` (nhân hai ma trận 4x4 column-major), \`perspective\` (ma trận perspective từ fov/aspect/near/far đúng công thức đã học), và \`projectToScreen\` (chia cho $w$ rồi map NDC sang pixel, nhớ lật trục $y$). Model matrix xoay quanh trục Y theo thời gian; view matrix mô phỏng camera đứng tại $(0,0,4)$ nhìn về gốc toạ độ.

Vẽ 12 cạnh nối các đỉnh đã chiếu, cập nhật bằng \`requestAnimationFrame\`.`,
      en: `Build a wireframe cube continuously spinning on a 2D canvas — hand-write the entire model → view → projection → screen pipeline yourself, no WebGL, no three.js, no matrix library.

Requirements: write \`multiplyMat4\` (multiply two column-major 4x4 matrices), \`perspective\` (a perspective matrix from fov/aspect/near/far using the formula from the theory lesson), and \`projectToScreen\` (divide by $w$, then map NDC to pixels, remembering to flip the $y$ axis). The model matrix rotates around the Y axis over time; the view matrix simulates a camera standing at $(0,0,4)$ looking at the origin.

Draw the 12 edges connecting the projected vertices, updating via \`requestAnimationFrame\`.`,
    },
    starterCode: `const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

type Mat4 = number[]; // column-major, length 16

const VERTICES: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], // back face
  [4, 5], [5, 6], [6, 7], [7, 4], // front face
  [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
];

function multiplyMat4(a: Mat4, b: Mat4): Mat4 {
  // TODO 1: column-major multiply — out[col*4+row] = sum over k of a[k*4+row] * b[col*4+k]
  return new Array(16).fill(0);
}

function rotationY(angle: number): Mat4 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
}

function translation(x: number, y: number, z: number): Mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  // TODO 2: f = 1 / tan(fovY / 2); fill in the perspective matrix from the theory lesson
  return new Array(16).fill(0);
}

function transformPoint(m: Mat4, p: [number, number, number]): [number, number, number, number] {
  const [x, y, z] = p;
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
    m[3] * x + m[7] * y + m[11] * z + m[15],
  ];
}

function projectToScreen(clip: [number, number, number, number], width: number, height: number) {
  // TODO 3: divide x,y by w to get NDC, then map NDC [-1,1] to pixels [0,width]/[0,height]
  // (remember: NDC y points up, canvas y points down)
  return { x: 0, y: 0 };
}

function draw(t: number) {
  const { width: W, height: H } = canvas;
  ctx.clearRect(0, 0, W, H);

  const angle = t * 0.0006;
  const model = rotationY(angle);
  const view = translation(0, 0, -4); // camera sits at (0,0,4) looking at origin
  const proj = perspective((60 * Math.PI) / 180, W / H, 0.1, 20);

  const mvp = multiplyMat4(proj, multiplyMat4(view, model));
  const screenPoints = VERTICES.map((v) => projectToScreen(transformPoint(mvp, v), W, H));

  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 2;
  for (const [a, b] of EDGES) {
    ctx.beginPath();
    ctx.moveTo(screenPoints[a].x, screenPoints[a].y);
    ctx.lineTo(screenPoints[b].x, screenPoints[b].y);
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
    solutionCode: `const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

type Mat4 = number[]; // column-major, length 16

const VERTICES: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], // back face
  [4, 5], [5, 6], [6, 7], [7, 4], // front face
  [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
];

function multiplyMat4(a: Mat4, b: Mat4): Mat4 {
  const out: Mat4 = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

function rotationY(angle: number): Mat4 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
}

function translation(x: number, y: number, z: number): Mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ];
}

function transformPoint(m: Mat4, p: [number, number, number]): [number, number, number, number] {
  const [x, y, z] = p;
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
    m[3] * x + m[7] * y + m[11] * z + m[15],
  ];
}

function projectToScreen(clip: [number, number, number, number], width: number, height: number) {
  const [x, y, , w] = clip;
  const ndcX = x / w;
  const ndcY = y / w;
  return {
    x: (ndcX * 0.5 + 0.5) * width,
    y: (1 - (ndcY * 0.5 + 0.5)) * height, // flip y: NDC up, canvas down
  };
}

function draw(t: number) {
  const { width: W, height: H } = canvas;
  ctx.clearRect(0, 0, W, H);

  const angle = t * 0.0006;
  const model = rotationY(angle);
  const view = translation(0, 0, -4); // camera sits at (0,0,4) looking at origin
  const proj = perspective((60 * Math.PI) / 180, W / H, 0.1, 20);

  const mvp = multiplyMat4(proj, multiplyMat4(view, model));
  const screenPoints = VERTICES.map((v) => projectToScreen(transformPoint(mvp, v), W, H));

  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 2;
  for (const [a, b] of EDGES) {
    ctx.beginPath();
    ctx.moveTo(screenPoints[a].x, screenPoints[a].y);
    ctx.lineTo(screenPoints[b].x, screenPoints[b].y);
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
    referenceImage: "/figures/00-math/checkpoint-wireframe-cube.svg",
    hints: [
      {
        vi: "Thứ tự nhân: multiplyMat4(proj, multiplyMat4(view, model)) — không phải ngược lại. Với lưu trữ column-major: out[col*4+row] = Σ_k a[k*4+row] * b[col*4+k].",
        en: "Multiply order: multiplyMat4(proj, multiplyMat4(view, model)) — not the reverse. For column-major storage: out[col*4+row] = Σ_k a[k*4+row] * b[col*4+k].",
      },
      {
        vi: "Chia cho w PHẢI xảy ra SAU khi nhân đủ cả ba ma trận, không phải trước. w không phải hằng số 1 — nó chính bằng -z_view sau khi nhân ma trận perspective.",
        en: "Dividing by w must happen AFTER all three matrices are multiplied, never before. w isn't a constant 1 — it equals -z_view once the perspective matrix has been applied.",
      },
      {
        vi: "Map NDC sang pixel: x_screen = (ndcX*0.5+0.5)*W, y_screen = (1-(ndcY*0.5+0.5))*H — nhớ lật trục y, NDC hướng lên còn canvas hướng xuống.",
        en: "Map NDC to pixels: x_screen = (ndcX*0.5+0.5)*W, y_screen = (1-(ndcY*0.5+0.5))*H — remember to flip y: NDC points up, canvas points down.",
      },
    ],
    checklist: [
      {
        vi: "Cube xoay và trông thật sự 3D — các cạnh gần to/xa hơn cạnh xa (foreshortening), không phải hình phẳng xoay 2D",
        en: "The cube rotates and genuinely looks 3D — near edges appear bigger/farther apart than far edges (foreshortening), not a flat 2D shape spinning",
      },
      {
        vi: "Hiệu ứng phối cảnh (perspective foreshortening) nhìn thấy rõ, không phải orthographic (song song)",
        en: "Perspective foreshortening is clearly visible, not orthographic (parallel) projection",
      },
      {
        vi: "Không import WebGL, three.js hay bất kỳ thư viện ma trận/3D nào — chỉ Math thuần và canvas 2D API",
        en: "No WebGL, three.js, or any matrix/3D library imported — just plain Math and the canvas 2D API",
      },
      {
        vi: "12 cạnh nối đúng 8 đỉnh theo danh sách EDGES, không nối nhầm cặp đỉnh nào hay thiếu cạnh nào",
        en: "All 12 edges connect the correct pairs from the 8 vertices per the EDGES list, no mismatched vertex pairs or missing",
      },
      {
        vi: "Animation chạy mượt theo refresh màn hình bằng requestAnimationFrame, không dùng setInterval",
        en: "Animation runs smoothly at the display refresh rate via requestAnimationFrame, not setInterval",
      },
    ],
  },
];
