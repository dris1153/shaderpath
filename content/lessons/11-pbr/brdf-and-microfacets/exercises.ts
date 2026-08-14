import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "ggx-peak-value-by-hand",
    kind: "concept",
    prompt: {
      vi: `Tại đúng đỉnh của lobe GGX ($n\\cdot h = 1$, tức $h$ trùng $n$), công thức $D(h) = \\dfrac{\\alpha^2}{\\pi\\big((n\\cdot h)^2(\\alpha^2-1)+1\\big)^2}$ rút gọn còn $D_{\\text{peak}} = \\dfrac{1}{\\pi\\alpha^2}$ (tự chứng minh bước rút gọn này trước khi tính số).

Tính $D_{\\text{peak}}$ cho hai trường hợp: roughness $=0.1$ (nhớ $\\alpha = \\text{roughness}^2$) và roughness $=0.9$. So sánh hai giá trị, rồi giải thích vì sao chế độ "xem D dưới dạng grayscale" trong demo phải nhân D với một hệ số scale rất nhỏ mới hiện được gì ngoài một chấm trắng cháy sáng ở roughness thấp.`,
      en: `Right at the GGX lobe's peak ($n\\cdot h = 1$, i.e. $h$ coincides with $n$), the formula $D(h) = \\dfrac{\\alpha^2}{\\pi\\big((n\\cdot h)^2(\\alpha^2-1)+1\\big)^2}$ simplifies to $D_{\\text{peak}} = \\dfrac{1}{\\pi\\alpha^2}$ (derive this simplification yourself before computing numbers).

Compute $D_{\\text{peak}}$ for two cases: roughness $=0.1$ (remember $\\alpha = \\text{roughness}^2$) and roughness $=0.9$. Compare the two values, then explain why the demo's "view D as grayscale" mode needs to multiply D by a very small scale factor to show anything besides a blown-out white dot at low roughness.`,
    },
    hints: [
      {
        vi: "Ở $n\\cdot h=1$, mẫu số trở thành $(\\alpha^2-1)+1 = \\alpha^2$ — thay vào $D$ ta được $\\alpha^2 / (\\pi \\cdot (\\alpha^2)^2) = 1/(\\pi\\alpha^2)$, đúng công thức đã cho sẵn.",
        en: "At $n\\cdot h=1$, the denominator becomes $(\\alpha^2-1)+1 = \\alpha^2$ — substituting into $D$ gives $\\alpha^2 / (\\pi \\cdot (\\alpha^2)^2) = 1/(\\pi\\alpha^2)$, matching the formula already given.",
      },
      {
        vi: "roughness $=0.1 \\Rightarrow \\alpha = 0.01$; roughness $=0.9 \\Rightarrow \\alpha = 0.81$. Bình phương $\\alpha$ trước khi chia, đừng quên $\\alpha$ đã là roughness bình phương rồi.",
        en: "roughness $=0.1 \\Rightarrow \\alpha = 0.01$; roughness $=0.9 \\Rightarrow \\alpha = 0.81$. Square $\\alpha$ before dividing, and remember $\\alpha$ is already roughness squared.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tự rút gọn được D_peak = 1/(π·α²) từ công thức GGX gốc",
        en: "I derived D_peak = 1/(π·α²) myself from the original GGX formula",
      },
      {
        vi: "Tôi tính đúng D_peak ≈ 3183 cho roughness=0.1 và D_peak ≈ 0.485 cho roughness=0.9",
        en: "I correctly computed D_peak ≈ 3183 for roughness=0.1 and D_peak ≈ 0.485 for roughness=0.9",
      },
      {
        vi: "Tôi giải thích được chênh lệch hơn 6500 lần này là lý do phải scale D trước khi hiển thị làm màu",
        en: "I can explain that this >6500x gap is exactly why D must be scaled down before being displayed as a color",
      },
    ],
    solutionNote: {
      vi: `$D_{peak} = \\dfrac{1}{\\pi\\alpha^2}$, với $\\alpha = \\text{roughness}^2$.

roughness $= 0.1 \\Rightarrow \\alpha = 0.01 \\Rightarrow \\alpha^2 = 0.0001 \\Rightarrow D_{peak} = 1/(\\pi \\times 0.0001) = 1/0.00031416 \\approx 3183.1$.

roughness $= 0.9 \\Rightarrow \\alpha = 0.81 \\Rightarrow \\alpha^2 = 0.6561 \\Rightarrow D_{peak} = 1/(\\pi \\times 0.6561) = 1/2.0611 \\approx 0.4852$.

Tỉ lệ $3183.1 / 0.4852 \\approx 6560$ lần — bề mặt nhám biến $D$ thành một con số bé quá nhỏ để nhìn thấy, còn bề mặt nhẵn (roughness thấp) lại làm $D$ nhọn vọt lên hàng nghìn. Nếu vẽ thẳng $D$ lên màn hình như một màu (0..1), gần như mọi giá trị roughness thấp sẽ cho ra một chấm trắng cháy sáng (clip về 1.0) trừ khi nhân $D$ với một hệ số scale rất nhỏ trước khi gán vào \`gl_FragColor\`.`,
      en: `$D_{peak} = \\dfrac{1}{\\pi\\alpha^2}$, where $\\alpha = \\text{roughness}^2$.

roughness $= 0.1 \\Rightarrow \\alpha = 0.01 \\Rightarrow \\alpha^2 = 0.0001 \\Rightarrow D_{peak} = 1/(\\pi \\times 0.0001) = 1/0.00031416 \\approx 3183.1$.

roughness $= 0.9 \\Rightarrow \\alpha = 0.81 \\Rightarrow \\alpha^2 = 0.6561 \\Rightarrow D_{peak} = 1/(\\pi \\times 0.6561) = 1/2.0611 \\approx 0.4852$.

Ratio $3183.1 / 0.4852 \\approx 6560\\times$ — a rough surface turns $D$ into a number too small to see, while a smooth surface (low roughness) spikes $D$ into the thousands. Plotting $D$ directly on screen as a color (0..1), almost every low-roughness value would blow out to a white dot (clipped to 1.0) unless $D$ is multiplied by a very small scale factor before being written to \`gl_FragColor\`.`,
    },
  },
  {
    id: "ggx-distribution-2d-plot",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), vẽ đồ thị 2D của $D(n\\cdot h)$ theo GGX: trục ngang của màn hình là $n\\cdot h \\in [0,1]$, trục dọc là giá trị $D$ đã nén lại để vừa khung hình. Roughness lấy từ \`uMouse.x\` (kéo chuột ngang để đổi roughness). Vì D có thể vọt lên hàng nghìn ở roughness thấp (xem bài tập trước), dùng phép nén dạng $1 - \\dfrac{2}{1+D\\cdot s}$ (với $s$ là hằng số scale nhỏ) để đường cong luôn nằm trong $[-1,1]$ bất kể D lớn cỡ nào.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), plot the GGX $D(n\\cdot h)$ curve in 2D: the screen's horizontal axis is $n\\cdot h \\in [0,1]$, the vertical axis is the D value compressed to fit the frame. Roughness comes from \`uMouse.x\` (drag horizontally to change it). Since D can spike into the thousands at low roughness (see the previous exercise), use a compressing map like $1 - \\dfrac{2}{1+D\\cdot s}$ (with small scale constant $s$) so the curve always stays inside $[-1,1]$ no matter how large D gets.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 2.0 - 1.0; // [-1,1]

  float roughness = clamp(uMouse.x, 0.02, 1.0);

  // TODO 1: alpha = roughness^2, alpha2 = alpha*alpha
  float alpha = 0.0;
  float alpha2 = 0.0;

  // TODO 2: ndoth = the horizontal axis, clamped to [0,1]
  float ndoth = 0.0;

  // TODO 3: GGX D(h) = alpha2 / (PI * denom^2), denom = ndoth^2*(alpha2-1)+1
  float D = 0.0;

  // TODO 4: compress D into [-1,1] with curveY = 1.0 - 2.0/(1.0 + D * 0.05)
  float curveY = -1.0;

  float dist = abs(p.y - curveY);
  vec3 col = mix(vec3(0.95, 0.55, 0.2), vec3(0.06, 0.08, 0.14), smoothstep(0.0, 0.02, dist));
  fragColor = vec4(col, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 2.0 - 1.0;

  float roughness = clamp(uMouse.x, 0.02, 1.0);

  float alpha = roughness * roughness;
  float alpha2 = alpha * alpha;

  float ndoth = clamp(p.x, 0.0, 1.0);

  float denom = ndoth * ndoth * (alpha2 - 1.0) + 1.0;
  float D = alpha2 / (3.14159265 * denom * denom + 1e-7);

  float curveY = 1.0 - 2.0 / (1.0 + D * 0.05);

  float dist = abs(p.y - curveY);
  vec3 col = mix(vec3(0.95, 0.55, 0.2), vec3(0.06, 0.08, 0.14), smoothstep(0.0, 0.02, dist));
  fragColor = vec4(col, 1.0);
}`,
    hints: [
      {
        vi: "Đây là công thức GGX y hệt bài lý thuyết — chỉ khác là $n\\cdot h$ không đến từ một mesh 3D thật, mà được GIẢ LẬP trực tiếp bằng toạ độ ngang của màn hình (p.x, đã clamp về [0,1]).",
        en: "This is the exact same GGX formula from the theory — the only difference is $n\\cdot h$ isn't coming from a real 3D mesh, it's SIMULATED directly by the screen's horizontal coordinate (p.x, clamped to [0,1]).",
      },
      {
        vi: "Kéo chuột sang trái (roughness nhỏ) phải cho ra một đường cong nhọn dựng đứng gần p.x=1; kéo sang phải (roughness lớn) phải cho ra một đường gần như phẳng ngang — nếu không thấy khác biệt rõ, kiểm tra lại alpha = roughness*roughness chưa bị viết nhầm thành alpha = roughness.",
        en: "Dragging left (small roughness) should produce a sharp, near-vertical spike near p.x=1; dragging right (large roughness) should produce an almost flat horizontal line — if the difference isn't obvious, check that alpha = roughness*roughness wasn't accidentally written as alpha = roughness.",
      },
    ],
    checklist: [
      {
        vi: "Đường cong luôn nằm trong khung hình [-1,1] bất kể roughness kéo về giá trị nhỏ nhất",
        en: "The curve always stays inside the [-1,1] frame no matter how low roughness is dragged",
      },
      {
        vi: "Kéo chuột về roughness thấp cho đường cong nhọn hẳn; kéo về roughness cao cho đường gần như phẳng",
        en: "Dragging to low roughness produces a sharp spike; dragging to high roughness produces a nearly flat line",
      },
      {
        vi: "alpha được tính bằng roughness*roughness (không phải dùng thẳng roughness) trước khi đưa vào công thức D",
        en: "alpha is computed as roughness*roughness (not raw roughness) before being used in the D formula",
      },
    ],
  },
];
