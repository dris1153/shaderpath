import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "grid-id-local-by-hand",
    kind: "concept",
    prompt: {
      vi: `Cho $N = 4$ và điểm $uv = (0.3, 0.6)$. Không chạy code, tính \`grid = uv * N\`, \`id = floor(grid)\`, \`local = fract(grid)\`, rồi xác định parity caro của ô đó bằng $\\mathrm{mod}(id.x + id.y,\\, 2)$.

Sau đó: giữ nguyên $uv = (0.3, 0.6)$ nhưng đổi $N$ thành $8$, tính lại parity. Vì sao cùng một điểm trên canvas có thể đổi màu caro chỉ vì $N$ thay đổi, dù toạ độ $uv$ của nó không hề đổi?`,
      en: `Given $N = 4$ and the point $uv = (0.3, 0.6)$. Without running code, compute \`grid = uv * N\`, \`id = floor(grid)\`, \`local = fract(grid)\`, then find that cell's checker parity via $\\mathrm{mod}(id.x + id.y,\\, 2)$.

Then: keeping $uv = (0.3, 0.6)$ fixed but changing $N$ to $8$, recompute the parity. Why can the same point on the canvas flip checker color just because $N$ changed, even though its $uv$ coordinate never did?`,
    },
    hints: [
      {
        vi: "grid = (0.3*4, 0.6*4) = (1.2, 2.4). floor và fract áp riêng từng thành phần.",
        en: "grid = (0.3*4, 0.6*4) = (1.2, 2.4). floor and fract apply component-wise.",
      },
      {
        vi: "id chỉ đổi khi grid vượt qua một biên số nguyên — đổi N thay đổi chính giá trị grid tại cùng một uv, nên nó có thể rơi vào một ô khác hẳn (id khác, parity khác).",
        en: "id only changes when grid crosses an integer boundary — changing N changes the grid value itself at the same uv, so it can land in an entirely different cell (different id, different parity).",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng tại N=4: id=(1,2), local=(0.2,0.4), parity = mod(3,2) = 1",
        en: "I correctly computed at N=4: id=(1,2), local=(0.2,0.4), parity = mod(3,2) = 1",
      },
      {
        vi: "Tôi tính đúng tại N=8: grid=(2.4,4.8), id=(2,4), parity = mod(6,2) = 0",
        en: "I correctly computed at N=8: grid=(2.4,4.8), id=(2,4), parity = mod(6,2) = 0",
      },
      {
        vi: "Tôi giải thích được parity phụ thuộc vào CẢ uv lẫn N, không phải thuộc tính cố định của một điểm trên canvas",
        en: "I can explain that parity depends on BOTH uv and N, not a fixed property of a point on the canvas",
      },
    ],
    solutionNote: {
      vi: `Với $N=4$: $\\mathrm{grid} = (0.3\\times 4,\\ 0.6\\times 4) = (1.2, 2.4)$, $\\mathrm{id} = \\mathrm{floor}(1.2, 2.4) = (1, 2)$, $\\mathrm{local} = \\mathrm{fract}(1.2, 2.4) = (0.2, 0.4)$, $\\mathrm{parity} = \\mathrm{mod}(1+2, 2) = \\mathrm{mod}(3,2) = 1$ → màu thứ hai.

Với $N=8$: $\\mathrm{grid} = (0.3\\times 8,\\ 0.6\\times 8) = (2.4, 4.8)$, $\\mathrm{id} = \\mathrm{floor}(2.4, 4.8) = (2, 4)$, $\\mathrm{parity} = \\mathrm{mod}(2+4, 2) = \\mathrm{mod}(6,2) = 0$ → màu thứ nhất (đổi hẳn so với $N=4$).

$\\mathrm{id}$ là chỉ số Ô, không phải toạ độ tuyệt đối — đổi $N$ nén lại số ô trên cùng bề mặt, nên cùng một $uv$ rơi vào một ô khác ($\\mathrm{id}$ khác), và vì checker chỉ nhìn vào tính chẵn/lẻ của $\\mathrm{id}$, parity đổi theo.`,
      en: `At $N=4$: $\\mathrm{grid} = (0.3\\times 4,\\ 0.6\\times 4) = (1.2, 2.4)$, $\\mathrm{id} = \\mathrm{floor}(1.2, 2.4) = (1, 2)$, $\\mathrm{local} = \\mathrm{fract}(1.2, 2.4) = (0.2, 0.4)$, $\\mathrm{parity} = \\mathrm{mod}(1+2, 2) = \\mathrm{mod}(3,2) = 1$ → the second color.

At $N=8$: $\\mathrm{grid} = (0.3\\times 8,\\ 0.6\\times 8) = (2.4, 4.8)$, $\\mathrm{id} = \\mathrm{floor}(2.4, 4.8) = (2, 4)$, $\\mathrm{parity} = \\mathrm{mod}(2+4, 2) = \\mathrm{mod}(6,2) = 0$ → the first color (completely flipped from $N=4$).

$\\mathrm{id}$ is the cell INDEX, not an absolute coordinate — changing $N$ compresses how many cells fit on the same surface, so the same $uv$ lands in a different cell (a different $\\mathrm{id}$), and since the checker only looks at whether $\\mathrm{id}$ is even or odd, parity flips along with it.`,
    },
  },
  {
    id: "dot-grid-with-checker-tint",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uResolution, fragColor có sẵn), viết fragment shader vẽ lưới $5 \\times 5$ chấm tròn bán kính $0.3$ (đo trong không gian ô đã căn giữa): mỗi ô một chấm ở đúng tâm ô, và màu nền của mỗi ô xen kẽ theo parity của \`id\` (checker) — tương tự cách demo của bài phối hoạ tiết "Chấm tròn" với biến hoá theo id.`,
      en: `In the playground (uResolution, fragColor are available), write a fragment shader drawing a $5 \\times 5$ grid of dots of radius $0.3$ (measured in centered cell space): one dot centered in each cell, with each cell's background color alternating by \`id\` parity (checker) — similar to how this lesson's demo combines the "Dots" motif with id-based variation.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float N = 5.0;

  // TODO 1: split uv into id (which cell) and cell (local coords, centered -0.5..0.5)
  vec2 id = vec2(0.0);
  vec2 cell = vec2(0.0);

  // TODO 2: circle SDF of radius 0.3 in cell-local coordinates
  float d = 0.0;

  // TODO 3: pick one of 2 background colors based on id parity
  float parity = 0.0;
  vec3 bg = mix(vec3(0.06, 0.07, 0.1), vec3(0.12, 0.05, 0.16), parity);

  vec3 dotColor = vec3(0.95, 0.8, 0.3);
  float mask = smoothstep(-0.02, 0.02, d);
  vec3 color = mix(dotColor, bg, mask);

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float N = 5.0;

  vec2 grid = uv * N;
  vec2 id = floor(grid);
  vec2 cell = fract(grid) - 0.5;

  float d = length(cell) - 0.3;

  float parity = mod(id.x + id.y, 2.0);
  vec3 bg = mix(vec3(0.06, 0.07, 0.1), vec3(0.12, 0.05, 0.16), parity);

  vec3 dotColor = vec3(0.95, 0.8, 0.3);
  float mask = smoothstep(-0.02, 0.02, d);
  vec3 color = mix(dotColor, bg, mask);

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "cell phải trừ 0.5 sau fract để chấm tròn nằm đúng tâm ô — thiếu bước này chấm sẽ lệch về góc dưới-trái ô, gây seam giữa các ô.",
        en: "cell must subtract 0.5 after fract so the dot sits at the cell's true center — skip this and the dot shifts toward the cell's bottom-left corner, causing a seam between cells.",
      },
      {
        vi: "parity chỉ phụ thuộc id (số nguyên), không phụ thuộc cell (toạ độ cục bộ liên tục) — dùng nhầm cell cho mod sẽ ra dải màu mượt thay vì caro sắc nét.",
        en: "parity depends only on id (integers), never on cell (the continuous local coordinate) — feeding cell into mod instead produces a smooth gradient rather than a crisp checker.",
      },
    ],
    checklist: [
      {
        vi: "Lưới hiện đúng 5x5 chấm tròn, mỗi chấm nằm giữa ô của nó",
        en: "The grid shows exactly a 5x5 dot layout, each dot centered in its own cell",
      },
      {
        vi: "Màu nền các ô xen kẽ đúng kiểu bàn cờ theo id, không theo cell",
        en: "Cell background colors alternate in a proper checkerboard pattern by id, not by cell",
      },
      {
        vi: "Biên mỗi chấm mượt (nhờ smoothstep), không răng cưa cứng",
        en: "Each dot's edge is smooth (thanks to smoothstep), not a hard jagged cutoff",
      },
    ],
  },
];
