import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "depth-precision-half-point",
    kind: "concept",
    prompt: {
      vi: `Cho near $n = 0.05$ và far $f = 500$ (đơn vị tuỳ ý, ví dụ mét). Không chạy code, dùng công thức $\\text{depth}(d) = \\frac{f}{f-n}\\left(1 - \\frac{n}{d}\\right)$ để tìm khoảng cách $d$ tại đó $\\text{depth}(d) = 0.5$ — gợi ý: giải ra được $d = \\frac{2nf}{n+f}$.

Sau đó trả lời: nếu đổi $n$ thành $0.001$ trong khi $f$ giữ nguyên $500$, điểm $\\text{depth} = 0.5$ đó dịch chuyển thế nào, và vì sao đặt near cực nhỏ "cho chắc ăn" lại là nguyên nhân âm thầm gây z-fighting cho các vật ở khoảng cách bình thường (5 đến 50 đơn vị)?`,
      en: `Given near $n = 0.05$ and far $f = 500$ (arbitrary units, say meters). Without running code, use $\\text{depth}(d) = \\frac{f}{f-n}\\left(1 - \\frac{n}{d}\\right)$ to find the distance $d$ where $\\text{depth}(d) = 0.5$ — hint: it solves to $d = \\frac{2nf}{n+f}$.

Then answer: if $n$ were changed to $0.001$ while $f$ stays at $500$, where does that $\\text{depth} = 0.5$ point move to, and why does setting near absurdly small "just to be safe" quietly cause z-fighting for objects at ordinary distances (5 to 50 units)?`,
    },
    hints: [
      {
        vi: "Thay số trực tiếp vào $d = \\dfrac{2nf}{n+f}$; đừng làm tròn sớm, giữ đủ chữ số thập phân.",
        en: "Substitute directly into $d = \\dfrac{2nf}{n+f}$; don't round early, keep the decimals.",
      },
      {
        vi: "So sánh $d$ tính được với chính $n$ — nó nằm rất gần near, không phải giữa near và far. Đó chính là ý nghĩa của 'nửa dải giá trị depth buffer'.",
        en: "Compare the computed $d$ against $n$ itself — it sits very close to near, not midway to far. That's exactly what 'half the depth buffer's range' means here.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính được d ≈ 0.0999 với n=0.05, f=500 (rất gần near, không phải giữa near-far)",
        en: "I computed d ≈ 0.0999 for n=0.05, f=500 (very close to near, not midway to far)",
      },
      {
        vi: "Tôi tính được d ≈ 0.002 khi n=0.001 — còn gần near hơn nữa",
        en: "I computed d ≈ 0.002 when n=0.001 — even closer to near",
      },
      {
        vi: "Tôi giải thích được vì sao vật ở 5-50 đơn vị luôn rơi vào nửa depth range còn lại — nơi độ phân giải cực thấp — khi near quá nhỏ",
        en: "I can explain why objects at 5-50 units always land in the remaining half of the depth range — where resolution is extremely low — once near is too small",
      },
    ],
    solutionNote: {
      vi: `$d = \\dfrac{2nf}{n+f}$. Với $n=0.05, f=500$: $d = \\dfrac{2 \\times 0.05 \\times 500}{500.05} = \\dfrac{50}{500.05} \\approx 0.09999$. Với $n=0.001, f=500$: $d = \\dfrac{2 \\times 0.001 \\times 500}{500.001} = \\dfrac{1}{500.001} \\approx 0.002$.

Cả hai trường hợp $d$ đều nằm sát ngay $n$: nửa dải giá trị depth buffer $[0, 0.5]$ chỉ phủ đúng đoạn từ near ra tới khoảng $2n$ — một lát cực mỏng ngay sát camera. Nửa còn lại $[0.5, 1]$ phải gánh mọi thứ khác, từ khoảng $2n$ ra tới far. Khi $n$ càng nhỏ, lát gần đó càng mỏng về giá trị tuyệt đối nhưng vẫn chiếm nửa độ phân giải — nên các vật ở khoảng 5-50 đơn vị (nằm sâu trong nửa "quá tải" kia) phải chia nhau phần độ chính xác còn sót lại, khiến hai bề mặt cách nhau vài centimet dễ dàng bị lượng tử hoá về cùng một giá trị depth: z-fighting.`,
      en: `$d = \\dfrac{2nf}{n+f}$. For $n=0.05, f=500$: $d = \\dfrac{2 \\times 0.05 \\times 500}{500.05} = \\dfrac{50}{500.05} \\approx 0.09999$. For $n=0.001, f=500$: $d = \\dfrac{2 \\times 0.001 \\times 500}{500.001} = \\dfrac{1}{500.001} \\approx 0.002$.

In both cases $d$ sits right next to $n$: half the depth buffer's range $[0, 0.5]$ only covers the stretch from near out to roughly $2n$ — an extremely thin slice right against the camera. The remaining half $[0.5, 1]$ has to carry everything else, from $2n$ out to far. As $n$ shrinks, that near slice gets thinner in absolute terms but still eats half the resolution — so objects at 5-50 units, deep inside the "overloaded" half, are left sharing whatever precision scraps remain, making it easy for two surfaces a few centimeters apart to quantize to the same depth value: z-fighting.`,
    },
  },
  {
    id: "fix-depth-state-decal",
    kind: "code",
    prompt: {
      vi: `Hàm \`drawFrame\` bên dưới vẽ một sàn nhà đặc rồi một decal trong suốt nằm khít lên đúng mặt phẳng sàn — decal đó z-fighting với sàn ngay cả khi camera đứng yên. Sửa hàm để (1) xoá đúng cả depth buffer mỗi frame, và (2) dùng \`gl.polygonOffset\` kéo decal về phía camera một khoảng nhỏ, không đụng vào vertex, rồi khôi phục state ngay sau khi vẽ xong.`,
      en: `The \`drawFrame\` function below draws a solid floor, then a translucent decal sitting flush on that exact floor plane — the decal z-fights with the floor even with a static camera. Fix the function so it (1) clears the depth buffer correctly every frame, and (2) uses \`gl.polygonOffset\` to nudge the decal toward the camera by a small amount without touching its vertices, restoring state right after drawing it.`,
    },
    starterCode: `function drawFrame(gl: WebGL2RenderingContext) {
  // TODO 1: this only clears color — depth from last frame survives
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawFloor(gl);

  // decal geometry sits exactly on the floor plane (same z) — flickers
  // TODO 2: enable polygon offset before this draw, pull the decal toward
  // the camera, then disable it again so later draws aren't affected
  drawDecal(gl);
}`,
    solutionCode: `function drawFrame(gl: WebGL2RenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawFloor(gl);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(-1, -1); // negative = pull toward the camera, past the noise
  drawDecal(gl);
  gl.disable(gl.POLYGON_OFFSET_FILL); // scoped: don't bias anything drawn after this
}`,
    hints: [
      {
        vi: "Depth buffer cũ từ frame trước vẫn còn nếu quên OR nó vào clear mask — kiểm tra `gl.clear(...)` đang xoá những bit nào.",
        en: "Last frame's depth buffer survives if you forget to OR it into the clear mask — check exactly which bits `gl.clear(...)` is clearing.",
      },
      {
        vi: "`gl.polygonOffset(factor, units)` chỉ có tác dụng khi `gl.POLYGON_OFFSET_FILL` đang bật, và chỉ áp dụng cho các draw call sau khi bật — nhớ tắt lại sau khi vẽ xong decal.",
        en: "`gl.polygonOffset(factor, units)` only takes effect while `gl.POLYGON_OFFSET_FILL` is enabled, and only for draw calls issued after that — remember to disable it again once the decal is drawn.",
      },
    ],
    checklist: [
      {
        vi: "gl.clear được gọi với cả COLOR_BUFFER_BIT và DEPTH_BUFFER_BIT mỗi frame",
        en: "gl.clear is called with both COLOR_BUFFER_BIT and DEPTH_BUFFER_BIT every frame",
      },
      {
        vi: "gl.polygonOffset dùng giá trị âm để kéo decal về phía camera, không phải đẩy ra xa",
        en: "gl.polygonOffset uses negative values to pull the decal toward the camera, not push it away",
      },
      {
        vi: "gl.disable(POLYGON_OFFSET_FILL) được gọi ngay sau khi vẽ decal, không ảnh hưởng các draw call tiếp theo",
        en: "gl.disable(POLYGON_OFFSET_FILL) is called right after the decal draw, so it doesn't leak into subsequent draw calls",
      },
    ],
  },
];
