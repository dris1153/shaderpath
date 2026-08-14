import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "viewport-mismatch-reasoning",
    kind: "concept",
    prompt: {
      vi: `Một canvas hiển thị ở $1200 \\times 800$ pixel thật. Bạn bind một FBO có texture $256 \\times 256$ để vẽ pass 1, nhưng quên gọi \`gl.viewport(0, 0, 256, 256)\` — viewport vẫn còn là $1200 \\times 800$ từ lần vẽ canvas trước đó.

Giải thích chính xác điều gì xảy ra với hình học được vẽ trong pass này: nó có bị scale để vừa khít $256 \\times 256$ không, hay xảy ra hiện tượng khác? Sau đó nêu dòng code còn thiếu để sửa.`,
      en: `A canvas displays at real $1200 \\times 800$ pixels. You bind an FBO with a $256 \\times 256$ texture for pass 1, but forget to call \`gl.viewport(0, 0, 256, 256)\` — the viewport is still $1200 \\times 800$ from the previous canvas draw.

Explain precisely what happens to the geometry drawn in this pass: does it get scaled to fit $256 \\times 256$, or does something else happen? Then state the missing line that fixes it.`,
    },
    hints: [
      {
        vi: "Viewport ánh xạ clip space $[-1,1]^2$ sang một vùng pixel cụ thể — nó không tự biết kích thước thật của attachment đang bind.",
        en: "The viewport maps clip space $[-1,1]^2$ onto a specific pixel region — it has no automatic awareness of the bound attachment's real size.",
      },
      {
        vi: "Phần toạ độ vượt ra ngoài kích thước thật của texture (256×256) không tồn tại trong bộ nhớ — nghĩ về việc rasterize một vùng lớn hơn rồi phần thừa bị cắt bỏ ở đâu.",
        en: "Coordinates outside the texture's real size (256×256) don't exist in memory — think about rasterizing a larger area and where the excess gets discarded.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được viewport không tự đồng bộ theo framebuffer đang bind",
        en: "I can explain that the viewport does not auto-sync to the bound framebuffer",
      },
      {
        vi: "Tôi nêu đúng: hình bị crop (chỉ góc dưới-trái 256×256 của vùng 1200×800 tưởng tượng được ghi), không phải bị scale đều",
        en: "I correctly state: the image gets cropped (only the bottom-left 256×256 corner of the imagined 1200×800 area is written), not evenly scaled",
      },
      {
        vi: "Tôi viết đúng gl.viewport(0, 0, 256, 256) trước draw call của pass 1",
        en: "I wrote the correct gl.viewport(0, 0, 256, 256) before pass 1's draw call",
      },
    ],
    solutionCode: `// Viewport must match the attachment's size BEFORE drawing into the FBO
gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
gl.viewport(0, 0, 256, 256); // the missing line`,
    solutionNote: {
      vi: `Không có dòng này: rasterizer chiếu clip space lên vùng $1200 \\times 800$ tưởng tượng, nhưng texture chỉ có $256 \\times 256$ texel thật — phần ngoài $256 \\times 256$ (góc dưới-trái) không được ghi vào đâu cả, kết quả là hình bị crop, không scale.`,
      en: `Without this line, the rasterizer projects clip space onto an imagined $1200 \\times 800$ area, but the texture only has $256 \\times 256$ real texels — everything outside that $256 \\times 256$ region (the bottom-left corner) has nowhere to be written, so the result is cropped, not scaled.`,
    },
  },
  {
    id: "create-color-framebuffer",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`createColorFramebuffer\` nhận \`gl\` và \`size\` (số nguyên, cạnh texture vuông), tạo một texture rỗng $\\text{size} \\times \\text{size}$, gắn nó làm \`COLOR_ATTACHMENT0\` của một FBO mới, kiểm tra completeness (throw kèm mã trạng thái dạng hex nếu không complete), rồi trả về \`{ fbo, texture }\`. Phải unbind framebuffer về \`null\` trước khi return.`,
      en: `Write a \`createColorFramebuffer\` function taking \`gl\` and \`size\` (integer, the square texture's edge), creating an empty $\\text{size} \\times \\text{size}$ texture, attaching it as a new FBO's \`COLOR_ATTACHMENT0\`, checking completeness (throwing with the hex status code if incomplete), and returning \`{ fbo, texture }\`. It must unbind the framebuffer back to \`null\` before returning.`,
    },
    starterCode: `interface RenderTarget {
  fbo: WebGLFramebuffer;
  texture: WebGLTexture;
}

function createColorFramebuffer(
  gl: WebGL2RenderingContext,
  size: number,
): RenderTarget {
  // TODO: create + configure an empty size x size texture
  // TODO: create the FBO, attach the texture as COLOR_ATTACHMENT0
  // TODO: check completeness, throw with the hex status code if not complete
  // TODO: unbind the framebuffer (bind null) before returning
  throw new Error("not implemented");
}`,
    solutionCode: `interface RenderTarget {
  fbo: WebGLFramebuffer;
  texture: WebGLTexture;
}

function createColorFramebuffer(
  gl: WebGL2RenderingContext,
  size: number,
): RenderTarget {
  const texture = gl.createTexture();
  if (!texture) throw new Error("createTexture failed");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA8, size, size, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("createFramebuffer failed");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0,
  );

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(\`Framebuffer incomplete: 0x\${status.toString(16)}\`);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fbo, texture };
}`,
    hints: [
      {
        vi: "texImage2D với pixels = null chỉ cấp bộ nhớ, không cần dữ liệu ban đầu — FBO sẽ ghi dữ liệu vào đó sau, không phải bạn upload trước.",
        en: "texImage2D with pixels = null only allocates memory, no initial data needed — the FBO will write data into it later, you're not uploading anything upfront.",
      },
      {
        vi: "checkFramebufferStatus phải gọi trong lúc FBO đang bind (giữa framebufferTexture2D và unbind về null).",
        en: "checkFramebufferStatus must be called while the FBO is still bound (between framebufferTexture2D and unbinding to null).",
      },
    ],
    checklist: [
      {
        vi: "Texture được tạo rỗng (pixels = null) với đúng kích thước size x size",
        en: "The texture is created empty (pixels = null) at the correct size x size",
      },
      {
        vi: "framebufferTexture2D gắn đúng texture vào COLOR_ATTACHMENT0",
        en: "framebufferTexture2D attaches the texture to COLOR_ATTACHMENT0 correctly",
      },
      {
        vi: "Completeness được kiểm tra và throw kèm mã hex nếu không complete",
        en: "Completeness is checked and throws with the hex code if not complete",
      },
    ],
  },
];
