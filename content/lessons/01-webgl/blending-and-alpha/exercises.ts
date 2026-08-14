import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "blend-factor-prediction",
    kind: "concept",
    prompt: {
      vi: `Cho src $= (1, 0, 0)$ với alpha $0.4$, vẽ chồng lên dst đặc $= (0, 0, 1)$. Không chạy code, tính màu kết quả với \`gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)\`, rồi tính lại với \`gl.blendFunc(gl.ONE, gl.ONE)\` (cùng hai màu, alpha bị bỏ qua bởi factor \`ONE\`).

Sau đó trả lời: vì sao chồng ba lớp đỏ thuần $(1,0,0)$ bằng additive rốt cuộc cháy trắng/clip, còn chồng ba lớp đỏ đó bằng alpha blending thì không bao giờ vượt ra ngoài các màu nguồn?`,
      en: `Given src $= (1, 0, 0)$ at alpha $0.4$, drawn over an opaque dst $= (0, 0, 1)$. Without running code, compute the result with \`gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)\`, then again with \`gl.blendFunc(gl.ONE, gl.ONE)\` (same two colors, alpha ignored by the \`ONE\` factor).

Then answer: why does stacking three pure-red $(1,0,0)$ layers with additive blending eventually blow out to white/clip, while stacking the same three red layers with alpha blending never leaves the range spanned by the source colors?`,
    },
    hints: [
      {
        vi: "Áp trực tiếp công thức src×Fsrc + dst×Fdst cho từng kênh màu (R, G, B) riêng biệt.",
        en: "Apply src×Fsrc + dst×Fdst separately, channel by channel (R, G, B).",
      },
      {
        vi: "Với additive không có gì 'nhường chỗ' cho lớp sau — mỗi kênh cứ cộng dồn tới khi chạm 1.0 rồi bị clamp. Với alpha blending, hai hệ số luôn cộng lại đúng bằng 1.",
        en: "With additive, nothing 'yields ground' to the next layer — each channel just keeps summing until it hits 1.0 and clamps. With alpha blending, the two factors always sum to exactly 1.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng kết quả alpha blend: (0.4, 0, 0.6)",
        en: "I computed the alpha-blend result correctly: (0.4, 0, 0.6)",
      },
      {
        vi: "Tôi tính đúng kết quả additive: (1, 0, 1)",
        en: "I computed the additive result correctly: (1, 0, 1)",
      },
      {
        vi: "Tôi giải thích được alpha blend là tổ hợp lồi (hai hệ số cộng lại bằng 1, kết quả luôn kẹp giữa hai màu nguồn) trong khi additive cộng dồn không giới hạn tới khi bị clamp",
        en: "I can explain that alpha blend is a convex combination (the two factors sum to 1, so the result is always trapped between the two source colors) while additive keeps summing unbounded until it clamps",
      },
    ],
    solutionNote: {
      vi: `\`blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA)\`, src=(1,0,0,0.4), dst=(0,0,1): $\\text{out} = src \\times 0.4 + dst \\times (1-0.4) = (0.4,0,0) + (0,0,0.6) = (0.4, 0, 0.6)$.

\`blendFunc(ONE, ONE)\`, cùng màu src/dst (alpha bị bỏ qua bởi factor ONE): $\\text{out} = src \\times 1 + dst \\times 1 = (1,0,0) + (0,0,1) = (1, 0, 1)$.

Alpha blending là một TRUNG BÌNH CÓ TRỌNG SỐ (tổ hợp lồi — hai hệ số cộng lại đúng bằng 1), nên kết quả không bao giờ vượt ra ngoài khoảng giữa src và dst. Additive không có ràng buộc đó: mỗi lượt vẽ chỉ cộng thêm năng lượng, nên ba lớp đỏ chồng nhau cộng dồn về $(3,0,0)$, bị kẹp từng kênh về $(1,0,0)$ — kết hợp với hoạt động ở các kênh khác, các lớp additive chồng lên nhau có xu hướng ngả dần về màu trắng.`,
      en: `\`blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA)\`, src=(1,0,0,0.4), dst=(0,0,1): $\\text{out} = src \\times 0.4 + dst \\times (1-0.4) = (0.4,0,0) + (0,0,0.6) = (0.4, 0, 0.6)$.

\`blendFunc(ONE, ONE)\`, same src/dst colors (alpha ignored by the ONE factor): $\\text{out} = src \\times 1 + dst \\times 1 = (1,0,0) + (0,0,1) = (1, 0, 1)$.

Alpha blending is a WEIGHTED AVERAGE (a convex combination — the two factors sum to exactly 1), so the result can never leave the range spanned by src and dst. Additive has no such constraint: every draw just adds more energy, so three overlapping red layers sum toward $(3,0,0)$, clamped per-channel to $(1,0,0)$ — combined with any other channel activity, additive layers trend toward white as they stack.`,
    },
  },
  {
    id: "fix-transparent-draw-order-and-depth",
    kind: "code",
    prompt: {
      vi: `Hàm \`drawScene\` bên dưới vẽ một sàn đặc rồi ba panel trong suốt theo đúng thứ tự chúng được tạo ra (không phải theo khoảng cách camera), với depth write vẫn bật suốt lúc vẽ panel — kết quả bị "đục lỗ" thay vì trộn màu mượt. Sửa hàm để (1) sort panel xa-gần trước khi vẽ, và (2) tắt depth write đúng lúc rồi khôi phục lại sau khi xong.`,
      en: `The \`drawScene\` function below draws a solid floor, then three translucent panels in whatever order they were created (not sorted by camera distance), with depth write left on the whole time — the result looks "punched out" instead of smoothly blended. Fix the function so it (1) sorts the panels far-to-near before drawing, and (2) disables depth write at the right moment and restores it afterward.`,
    },
    starterCode: `function drawScene(gl: WebGL2RenderingContext, panels: Panel[], cameraPos: Vec3) {
  drawOpaqueFloor(gl);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // TODO 1: panels currently draw in creation order — sort them by
  // distance from cameraPos (farthest first) before this loop
  // TODO 2: depth write was never turned off — nearer panels punch
  // holes in farther ones instead of letting them blend through
  for (const panel of panels) {
    drawPanel(gl, panel);
  }

  gl.disable(gl.BLEND);
}`,
    solutionCode: `function drawScene(gl: WebGL2RenderingContext, panels: Panel[], cameraPos: Vec3) {
  drawOpaqueFloor(gl);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false); // still depth-TESTs against the floor, just stops writing

  const sorted = [...panels].sort(
    (a, b) => distance(b.position, cameraPos) - distance(a.position, cameraPos),
  ); // farthest first
  for (const panel of sorted) {
    drawPanel(gl, panel);
  }

  gl.depthMask(true);
  gl.disable(gl.BLEND);
}`,
    hints: [
      {
        vi: "Sort mảng panels theo khoảng cách tới cameraPos GIẢM DẦN (xa nhất trước) trước vòng lặp vẽ, dùng Array.prototype.sort với hàm so sánh khoảng cách.",
        en: "Sort the panels array by distance to cameraPos in DESCENDING order (farthest first) before the draw loop, using Array.prototype.sort with a distance comparator.",
      },
      {
        vi: "gl.depthMask(false) không tắt depth test — nó chỉ ngăn depth buffer bị GHI, nên panel trong suốt vẫn bị vật đặc phía trước che đúng cách.",
        en: "gl.depthMask(false) doesn't disable the depth test — it only stops the depth buffer from being WRITTEN, so transparent panels are still correctly hidden behind opaque geometry in front of them.",
      },
    ],
    checklist: [
      {
        vi: "Panels được sort xa-gần (farthest first) trước khi vẽ, không theo thứ tự khởi tạo",
        en: "Panels are sorted farthest-first before drawing, not in creation order",
      },
      {
        vi: "gl.depthMask(false) được gọi trước vòng lặp vẽ panel và gl.depthMask(true) được khôi phục ngay sau đó",
        en: "gl.depthMask(false) is called before the panel draw loop and gl.depthMask(true) is restored right after it",
      },
      {
        vi: "gl.disable(gl.BLEND) vẫn được gọi cuối cùng để không ảnh hưởng các draw call đặc tiếp theo",
        en: "gl.disable(gl.BLEND) is still called at the end so it doesn't leak into subsequent opaque draw calls",
      },
    ],
  },
];
