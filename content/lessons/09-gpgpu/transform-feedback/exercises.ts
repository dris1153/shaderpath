import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "why-double-buffer-is-mandatory",
    kind: "concept",
    prompt: {
      vi: `WebGL cấm dùng CÙNG một buffer vừa làm nguồn attribute (qua VAO) vừa làm đích ghi transform feedback trong CÙNG một draw call. Giải thích cơ chế đứng sau lệnh cấm này: điều gì có thể xảy ra nếu GPU thực sự cho phép đọc và ghi cùng một buffer trong khi vertex shader chạy song song cho hàng nghìn particle — và vì sao double-buffer (hai bộ buffer A/B, đọc-ghi luân phiên) là cách duy nhất né được vấn đề đó mà vẫn giữ throughput song song.`,
      en: `WebGL forbids using the SAME buffer as both a VAO's attribute source and a transform feedback write target within the SAME draw call. Explain the mechanism behind that rule: what could go wrong if the GPU actually allowed reading and writing the same buffer while a vertex shader runs in parallel across thousands of particles — and why double-buffering (two buffer sets, A/B, alternating read/write) is the only way to avoid that problem while keeping parallel throughput.`,
    },
    hints: [
      {
        vi: "Vertex shader chạy song song cho NHIỀU particle cùng lúc, không có gì đảm bảo thứ tự particle nào chạy trước particle nào.",
        en: "The vertex shader runs in parallel across MANY particles at once, with no guarantee about which particle's invocation runs before another's.",
      },
      {
        vi: "Nếu particle #5 đọc dữ liệu của particle #3 trong khi particle #3 CÓ THỂ đã ghi hoặc chưa ghi xong dữ liệu mới của chính nó vào cùng buffer, kết quả phụ thuộc vào thời điểm chạy thực tế — đó là race condition.",
        en: "If particle #5 reads particle #3's data while particle #3 may or may not have already written its own new data into that same buffer, the result depends on actual execution timing — that's a race condition.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được đây là race condition giữa các invocation vertex shader song song, không phải một giới hạn cú pháp tuỳ tiện",
        en: "I explain this as a race condition between parallel vertex shader invocations, not an arbitrary syntactic limitation",
      },
      {
        vi: "Tôi nêu được vì sao double-buffer (đọc A/ghi B) loại bỏ hoàn toàn race đó — input và output là hai vùng nhớ vật lý tách biệt",
        en: "I explain why double-buffering (read A/write B) eliminates that race entirely — input and output are two physically separate memory regions",
      },
      {
        vi: "Tôi liên hệ được đây là đúng lý do ping-pong FBO texture cũng cần hai render target riêng, không phải một target vừa đọc vừa ghi",
        en: "I connect this to why ping-pong FBO textures also need two separate render targets, not one target that both reads and writes",
      },
    ],
    solutionNote: {
      vi: `Một draw call chạy vertex shader song song cho hàng nghìn particle CÙNG LÚC, không theo thứ tự tuần tự nào cả. Nếu buffer vừa là nguồn đọc (qua VAO) vừa là đích ghi transform feedback, particle #5 có thể đọc dữ liệu của particle #3 ở một thời điểm không xác định — có thể là giá trị cũ (trước khi #3 ghi), có thể là giá trị mới (sau khi #3 ghi), tuỳ vào GPU lập lịch hai invocation đó ra sao. Đây đúng là race condition: kết quả phụ thuộc vào thời điểm thực thi, không xác định (undefined behavior), và khác nhau giữa các lần chạy hoặc giữa các driver.

Double-buffer loại bỏ race này hoàn toàn: bộ A (đọc) và bộ B (ghi) là hai \`WebGLBuffer\` vật lý khác nhau. Không invocation nào đọc từ đúng ô nhớ mà một invocation khác đang ghi vào — driver không cần đồng bộ hoá gì thêm, mọi particle vẫn tính song song hoàn toàn độc lập. Đây chính xác là lý do ping-pong FBO cũng cần hai \`WebGLRenderTarget\`: texture mà fragment shader đang "đọc" và texture mà framebuffer đang "ghi" phải là hai texture khác nhau — cùng một nguyên nhân, chỉ khác cấp độ (texel thay vì attribute).`,
      en: `A single draw call runs the vertex shader in parallel across thousands of particles AT ONCE, with no sequential ordering at all. If a buffer is both the read source (via a VAO) and the transform feedback write target, particle #5 could read particle #3's data at an undefined moment — it might get the OLD value (before #3 wrote) or the NEW value (after #3 wrote), depending entirely on how the GPU schedules those two invocations. That's exactly a race condition: the result depends on execution timing, is undefined behavior, and can differ between runs or between drivers.

Double-buffering eliminates this race entirely: set A (read) and set B (write) are two physically separate \`WebGLBuffer\`s. No invocation ever reads from the exact memory another invocation is writing to — the driver needs no extra synchronization, and every particle still computes fully independently in parallel. This is exactly why ping-pong FBOs also need two \`WebGLRenderTarget\`s: the texture the fragment shader is "reading" and the texture the framebuffer is "writing" must be two different textures — the same root cause, just at a different level (texels instead of attributes).`,
    },
  },
  {
    id: "wire-a-transform-feedback-pass",
    kind: "code",
    prompt: {
      vi: `Cho \`gl\`, \`program\` (đã \`transformFeedbackVaryings\` + link xong), \`vaoRead\` (VAO đọc từ bộ A), \`bufferBWritePosition\`/\`bufferBWriteVelocity\` (buffer đích của bộ B), và \`count\`. Viết hàm chạy đúng MỘT lượt update transform feedback: bind chương trình, bind VAO đọc, bind hai buffer đích vào đúng binding point, bật rasterizer discard, begin/draw/end transform feedback, tắt discard, và gỡ bind hai buffer đích về null.`,
      en: `Given \`gl\`, \`program\` (already \`transformFeedbackVaryings\`'d and linked), \`vaoRead\` (a VAO reading from set A), \`bufferBWritePosition\`/\`bufferBWriteVelocity\` (set B's destination buffers), and \`count\`. Write a function running exactly ONE transform feedback update pass: bind the program, bind the read VAO, bind both destination buffers to the correct binding points, enable rasterizer discard, begin/draw/end transform feedback, disable discard, and unbind both destination buffers back to null.`,
    },
    starterCode: `function runUpdatePass(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vaoRead: WebGLVertexArrayObject,
  bufferBWritePosition: WebGLBuffer,
  bufferBWriteVelocity: WebGLBuffer,
  count: number,
) {
  gl.useProgram(program);
  gl.bindVertexArray(vaoRead);

  // TODO: bind bufferBWritePosition to transform feedback index 0
  // TODO: bind bufferBWriteVelocity to transform feedback index 1
  // TODO: enable RASTERIZER_DISCARD
  // TODO: beginTransformFeedback(POINTS) -> drawArrays(POINTS, 0, count) -> endTransformFeedback
  // TODO: disable RASTERIZER_DISCARD
  // TODO: unbind both transform feedback binding points (pass null)
}`,
    solutionCode: `function runUpdatePass(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vaoRead: WebGLVertexArrayObject,
  bufferBWritePosition: WebGLBuffer,
  bufferBWriteVelocity: WebGLBuffer,
  count: number,
) {
  gl.useProgram(program);
  gl.bindVertexArray(vaoRead);

  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufferBWritePosition);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, bufferBWriteVelocity);

  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, count);
  gl.endTransformFeedback();
  gl.disable(gl.RASTERIZER_DISCARD);

  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
}`,
    hints: [
      {
        vi: "Thứ tự binding point khớp đúng thứ tự mảng truyền vào `transformFeedbackVaryings` lúc link chương trình — index 0 ứng với varying đầu tiên.",
        en: "The binding point order matches the array order passed to `transformFeedbackVaryings` at link time — index 0 corresponds to the first varying.",
      },
      {
        vi: "`beginTransformFeedback`/`endTransformFeedback` bọc quanh ĐÚNG draw call cần capture — RASTERIZER_DISCARD bật trước và tắt lại ngay sau, không để ảnh hưởng các draw call render khác.",
        en: "`beginTransformFeedback`/`endTransformFeedback` wrap EXACTLY the draw call to capture — RASTERIZER_DISCARD turns on right before and off right after, so it never leaks into other render draw calls.",
      },
    ],
    checklist: [
      {
        vi: "Bind đúng buffer B vào đúng index transform feedback (0 = varying đầu tiên, 1 = varying thứ hai)",
        en: "Binds the correct set-B buffer to the correct transform feedback index (0 = first varying, 1 = second varying)",
      },
      {
        vi: "Bọc drawArrays trong begin/endTransformFeedback, có bật/tắt RASTERIZER_DISCARD quanh đúng đoạn đó",
        en: "Wraps drawArrays inside begin/endTransformFeedback, with RASTERIZER_DISCARD enabled/disabled around exactly that section",
      },
      {
        vi: "Gỡ bind hai buffer transform feedback về null sau khi xong (tránh binding point còn trỏ vào buffer cũ ở lần vẽ sau)",
        en: "Unbinds both transform feedback buffers back to null afterward (avoids a stale binding point pointing at an old buffer on the next draw)",
      },
    ],
  },
];
