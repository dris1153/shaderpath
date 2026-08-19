import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "circle-sdf-by-hand",
    kind: "concept",
    prompt: {
      vi: `Hình tròn SDF tâm gốc, bán kính $r = 0.3$: $d(p) = \\|p\\| - r$. Không chạy code, tính $d(p)$ tại ba điểm $p_1 = (0, 0)$, $p_2 = (0.3, 0)$, $p_3 = (0.5, 0.2)$, rồi phân loại mỗi điểm là trong / trên biên / ngoài hình.

Sau đó: muốn vẽ một đường viền dày tổng cộng $0.01$ đơn vị quanh biên bằng \`smoothstep(w, 0.0, abs(d))\`, giá trị $w$ (nửa-độ-rộng) nên là bao nhiêu — và vì sao độ dày viền thật sự bằng $2w$ chứ không phải $w$?`,
      en: `A circle SDF centered at the origin, radius $r = 0.3$: $d(p) = \\|p\\| - r$. Without running code, compute $d(p)$ at three points $p_1 = (0, 0)$, $p_2 = (0.3, 0)$, $p_3 = (0.5, 0.2)$, then classify each point as inside / on the boundary / outside.

Then: to draw an outline with total thickness $0.01$ units using \`smoothstep(w, 0.0, abs(d))\`, what should $w$ (the half-width) be — and why is the actual outline thickness $2w$, not $w$?`,
    },
    hints: [
      {
        vi: "$\\|p_3\\| = \\sqrt{0.5^2 + 0.2^2}$. Trừ $r$ ra khỏi kết quả đó mới ra $d(p_3)$ — đừng quên bước trừ.",
        en: "$\\|p_3\\| = \\sqrt{0.5^2 + 0.2^2}$. Subtract $r$ from that to get $d(p_3)$ — don't skip the subtraction.",
      },
      {
        vi: "abs(d) gấp cả phía trong lẫn phía ngoài biên về cùng một trục số dương — dải kích hoạt của smoothstep(w,0,abs(d)) trải đều sang cả hai phía của biên, mỗi phía rộng $w$.",
        en: "abs(d) folds both the inside and outside of the boundary onto the same positive axis — smoothstep(w,0,abs(d))'s active band spreads evenly to both sides of the boundary, each side w wide.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $d(p_1) = -0.3$ (trong), $d(p_2) = 0$ (trên biên), $d(p_3) \\approx 0.238$ (ngoài)",
        en: "I correctly computed $d(p_1) = -0.3$ (inside), $d(p_2) = 0$ (on the boundary), $d(p_3) \\approx 0.238$ (outside)",
      },
      {
        vi: "Tôi suy ra $w = 0.005$ cho viền dày $0.01$",
        en: "I derived $w = 0.005$ for a $0.01$-thick outline",
      },
      {
        vi: "Tôi giải thích được vì sao độ dày viền là $2w$ (đối xứng qua cả hai phía của biên)",
        en: "I can explain why the outline thickness is $2w$ (symmetric across both sides of the boundary)",
      },
    ],
    solutionNote: {
      vi: `$d(p_1) = \\|(0,0)\\| - 0.3 = -0.3$ → trong hình (âm). $d(p_2) = \\|(0.3,0)\\| - 0.3 = 0.3-0.3 = 0$ → đúng trên biên. $d(p_3) = \\|(0.5,0.2)\\| - 0.3 = \\sqrt{0.25+0.04}-0.3 = \\sqrt{0.29}-0.3 \\approx 0.5385-0.3 \\approx 0.2385$ → ngoài hình (dương).

Với $w = 0.005$: \`smoothstep(w, 0.0, abs(d))\` bật lên (giá trị $\\approx 1$) khi $|d| < w$, tức khi $-w < d < w$ — một dải rộng $2w = 0.01$ đơn vị bao quanh $d = 0$, đối xứng vào TRONG hình lẫn ra NGOÀI hình, không chỉ một phía.`,
      en: `$d(p_1) = \\|(0,0)\\| - 0.3 = -0.3$ → inside the shape (negative). $d(p_2) = \\|(0.3,0)\\| - 0.3 = 0.3-0.3 = 0$ → exactly on the boundary. $d(p_3) = \\|(0.5,0.2)\\| - 0.3 = \\sqrt{0.25+0.04}-0.3 = \\sqrt{0.29}-0.3 \\approx 0.5385-0.3 \\approx 0.2385$ → outside the shape (positive).

With $w = 0.005$: \`smoothstep(w, 0.0, abs(d))\` turns on (value $\\approx 1$) when $|d| < w$, i.e. when $-w < d < w$ — a band $2w = 0.01$ units wide surrounding $d = 0$, symmetric both INSIDE and OUTSIDE the shape, not just one side.`,
    },
  },
  {
    id: "mouse-circle-with-glow",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), viết fragment shader vẽ một hình tròn bán kính $0.15$ đặt tại vị trí chuột \`uMouse\`, dùng SDF hình tròn (\`length(p) - r\`) và \`smoothstep\` để viền mượt (dải rộng khoảng $0.01$), sau đó cộng thêm quầng sáng (glow) phía ngoài hình bằng \`exp(-k * max(d, 0.0))\` với $k$ tự chọn sao cho quầng sáng tắt hẳn trước khi ra tới mép màn hình.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), write a fragment shader that draws a circle of radius $0.15$ centered on the mouse position \`uMouse\`, using a circle SDF (\`length(p) - r\`) and \`smoothstep\` for a smooth edge (a band roughly $0.01$ wide), then adds an outer glow using \`exp(-k * max(d, 0.0))\` with $k$ chosen so the glow fully fades out before reaching the screen edges.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv - uMouse;
  float r = 0.15;

  // TODO 1: circle SDF centred on the mouse
  float d = 0.0;

  // TODO 2: smooth mask around d = 0 — a band about 0.01 wide centered on the boundary
  float mask = 0.0;

  vec3 shapeColor = vec3(0.98, 0.45, 0.2);
  vec3 bg = vec3(0.05, 0.06, 0.1);
  vec3 color = mix(shapeColor, bg, mask);

  // TODO 3: add an outer glow with exp(-k * max(d, 0.0))
  color += vec3(0.3, 0.6, 1.0) * 0.0;

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv - uMouse;
  float r = 0.15;

  float d = length(p) - r;

  float mask = smoothstep(-0.005, 0.005, d);

  vec3 shapeColor = vec3(0.98, 0.45, 0.2);
  vec3 bg = vec3(0.05, 0.06, 0.1);
  vec3 color = mix(shapeColor, bg, mask);

  // mask (~0 inside, 1 outside) keeps the glow out of the fill; max() only
  // stops exp from blowing up inside.
  color += vec3(0.3, 0.6, 1.0) * exp(-14.0 * max(d, 0.0)) * mask;

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "`p` đã được dịch về gốc tại vị trí chuột (`uv - uMouse`) — SDF hình tròn dùng ngay `length(p) - r`, không cần trừ tâm lần nữa.",
        en: "`p` is already shifted so the mouse position is the origin (`uv - uMouse`) — the circle SDF is just `length(p) - r`, no need to subtract the center again.",
      },
      {
        vi: "`max(d, 0.0)` chỉ chặn exp khỏi bùng nổ bên trong (exp của số dương lớn); thứ thật sự giữ glow ở NGOÀI hình là nhân thêm mask (≈0 trong hình, 1 ngoài hình).",
        en: "`max(d, 0.0)` only stops exp from exploding inside (exp of a large positive); what actually keeps the glow OUTSIDE the shape is multiplying by the mask (~0 inside, 1 outside).",
      },
    ],
    checklist: [
      {
        vi: "Hình tròn bám đúng theo vị trí chuột khi di chuyển trong playground",
        en: "The circle correctly follows the mouse position when moved in the playground",
      },
      {
        vi: "Biên hình tròn mượt (không răng cưa) nhờ smoothstep quanh d = 0",
        en: "The circle's edge is smooth (no jaggies) thanks to smoothstep around d = 0",
      },
      {
        vi: "Có quầng glow mờ dần rõ rệt phía ngoài hình, không tràn vào phần fill bên trong",
        en: "A visibly fading glow appears outside the shape, without bleeding into the interior fill",
      },
    ],
  },
];
