import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "trace-the-missing-needsswap",
    kind: "concept",
    prompt: {
      vi: `Một composer có 3 pass: \`RenderPass\`, rồi \`EffectPass\` (viết đúng — đọc \`readBuffer.texture\`, cộng thêm hiệu ứng, ghi kết quả vào \`writeBuffer\` — NHƯNG lỡ set \`this.needsSwap = false\` trong constructor), rồi \`OutputPass\` cuối cùng. Gọi hai render target nội bộ của composer là A và B, ban đầu \`writeBuffer = A\`, \`readBuffer = B\`.

Biết \`RenderPass\` luôn tự set \`needsSwap = false\` và render thẳng vào tham số \`readBuffer\` nó nhận được (không phải \`writeBuffer\`). Hãy lần theo từng pass: sau mỗi pass, A và B chứa nội dung gì, \`composer.writeBuffer\`/\`composer.readBuffer\` đang trỏ vào đâu? Cuối cùng, \`OutputPass\` đọc buffer nào, và người xem thấy gì trên màn hình — có hiệu ứng của \`EffectPass\` hay không?`,
      en: `A composer has 3 passes: \`RenderPass\`, then \`EffectPass\` (correctly written — reads \`readBuffer.texture\`, adds its effect, writes the result into \`writeBuffer\` — BUT accidentally sets \`this.needsSwap = false\` in its constructor), then \`OutputPass\` last. Call the composer's two internal render targets A and B, starting with \`writeBuffer = A\`, \`readBuffer = B\`.

Recall that \`RenderPass\` always sets \`needsSwap = false\` itself and renders straight into the \`readBuffer\` parameter it receives (not \`writeBuffer\`). Trace pass by pass: after each one, what does A and B hold, and where do \`composer.writeBuffer\`/\`composer.readBuffer\` point? Finally, which buffer does \`OutputPass\` read, and what does the viewer actually see on screen — does \`EffectPass\`'s effect show up or not?`,
    },
    hints: [
      {
        vi: "swapBuffers() chỉ chạy khi pass.needsSwap === true, và nó tráo composer.readBuffer với composer.writeBuffer (không đổi nội dung A/B, chỉ đổi biến nào trỏ vào đâu).",
        en: "swapBuffers() only runs when pass.needsSwap === true, and it swaps composer.readBuffer with composer.writeBuffer (it doesn't change what's inside A/B, only which variable points at which).",
      },
      {
        vi: "RenderPass ghi vào B (tham số readBuffer nó nhận, = composer.readBuffer ban đầu) rồi KHÔNG swap — nên sau RenderPass, composer.readBuffer (=B) đã có cảnh render, còn composer.writeBuffer (=A) vẫn trống.",
        en: "RenderPass writes into B (the readBuffer parameter it receives, = composer.readBuffer initially) then does NOT swap — so after RenderPass, composer.readBuffer (=B) already holds the rendered scene, while composer.writeBuffer (=A) is still empty.",
      },
    ],
    checklist: [
      {
        vi: "Tôi lần đúng: sau RenderPass, B có cảnh render, composer.writeBuffer vẫn = A (trống), composer.readBuffer vẫn = B",
        en: "I correctly traced that after RenderPass, B holds the rendered scene, composer.writeBuffer is still A (empty), composer.readBuffer is still B",
      },
      {
        vi: "Tôi lần đúng: EffectPass đọc B (đúng), ghi kết quả hợp lệ vào A, nhưng vì needsSwap=false nên composer.readBuffer VẪN là B — A bị 'bỏ quên'",
        en: "I correctly traced that EffectPass reads B (correctly), writes a valid result into A, but because needsSwap=false, composer.readBuffer STAYS B — A gets 'orphaned'",
      },
      {
        vi: "Tôi kết luận đúng: OutputPass đọc composer.readBuffer = B (cảnh gốc, KHÔNG có hiệu ứng) — người xem thấy màn hình như thể EffectPass không hề tồn tại, dù nó đã tính toán và ghi dữ liệu đúng",
        en: "I correctly concluded that OutputPass reads composer.readBuffer = B (the original scene, WITHOUT the effect) — the viewer sees the screen as if EffectPass never existed, even though it computed and wrote correct data",
      },
    ],
    solutionCode: `// Truoc RenderPass:      writeBuffer=A, readBuffer=B
// RenderPass.render(_, A, B): ghi canh vao B (tham so readBuffer no nhan).
//   needsSwap=false (RenderPass tu set) -> KHONG swap.
//   Sau buoc nay: writeBuffer=A (trong), readBuffer=B (co canh)
//
// EffectPass.render(_, A, B): doc dung B.texture (co canh), cong hieu ung,
//   ghi ket qua HOP LE vao A (tham so writeBuffer no nhan).
//   needsSwap=false (LOI) -> KHONG swap.
//   Sau buoc nay: writeBuffer=A (co canh+hieu ung, nhung khong ai biet),
//                 readBuffer=B (VAN la canh goc, khong doi)
//
// OutputPass.render(_, A, B): doc B.texture (canh GOC, khong co hieu ung).
//   La pass cuoi cung con enabled -> renderToScreen=true.
//
// Ket qua: man hinh hien canh goc da tone map, KHONG co hieu ung cua
// EffectPass — du EffectPass tinh toan va ghi du lieu hoan toan dung.
// Buffer A tro thanh "du lieu chet": dung nhung khong bao gio duoc doc.`,
  },
  {
    id: "shimmer-warp-in-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground, viết lại đúng phần "warp toạ độ" của \`heat-shimmer.frag\` — nhưng áp lên một pattern sọc thay vì một texture, vì playground không có ảnh nền để sample. Tính \`warped.x = uv.x + sin(uv.y * 14.0 + uTime) * 0.03\`, rồi dùng \`warped\` (không phải \`uv\` gốc) để tính \`stripes = step(0.5, fract(warped.x * 10.0))\`.`,
      en: `In the playground, reimplement the "warp the coordinate" step from \`heat-shimmer.frag\` — but applied to a stripe pattern instead of a texture, since the playground has no background image to sample. Compute \`warped.x = uv.x + sin(uv.y * 14.0 + uTime) * 0.03\`, then use \`warped\` (not the original \`uv\`) to compute \`stripes = step(0.5, fract(warped.x * 10.0))\`.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // TODO: warped = uv, roi cong sin(uv.y * 14.0 + uTime) * 0.03 vao warped.x
  vec2 warped = uv;

  float stripes = step(0.5, fract(warped.x * 10.0));
  vec3 color = mix(vec3(0.1, 0.15, 0.25), vec3(0.95, 0.75, 0.35), stripes);
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec2 warped = uv;
  warped.x += sin(uv.y * 14.0 + uTime) * 0.03;

  float stripes = step(0.5, fract(warped.x * 10.0));
  vec3 color = mix(vec3(0.1, 0.15, 0.25), vec3(0.95, 0.75, 0.35), stripes);
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "Sóng phải cộng vào toạ độ TRƯỚC khi tính stripes, không phải cộng vào màu sau khi tính xong — đây chính là khác biệt giữa 'warp domain' và 'blend màu'.",
        en: "The wave must be added to the coordinate BEFORE computing stripes, not added to the color afterward — that's exactly the difference between 'warping the domain' and 'blending colors'.",
      },
      {
        vi: "Dùng uv.y (không phải uv.x) làm input cho sin() — sóng chạy dọc theo trục y để làm méo các sọc DỌC (dựng từ warped.x), giống cách heat-shimmer.frag tách hai trục.",
        en: "Use uv.y (not uv.x) as the input to sin() — the wave runs along the y axis to distort the VERTICAL stripes (built from warped.x), the same axis separation heat-shimmer.frag uses.",
      },
    ],
    checklist: [
      {
        vi: "warped.x cộng thêm sin(uv.y * 14.0 + uTime) * 0.03, không phải sin(uv.x * ...)",
        en: "warped.x adds sin(uv.y * 14.0 + uTime) * 0.03, not sin(uv.x * ...)",
      },
      {
        vi: "stripes dùng warped.x, không phải uv.x gốc — nếu dùng nhầm uv.x thì sọc đứng im, không lay động theo uTime",
        en: "stripes uses warped.x, not the original uv.x — using uv.x by mistake leaves the stripes static, not rippling with uTime",
      },
      {
        vi: "Khi chạy, các đường sọc dọc uốn lượn mượt theo thời gian thay vì đứng thẳng cứng",
        en: "When running, the vertical stripe edges ripple smoothly over time instead of standing perfectly straight",
      },
    ],
  },
];
