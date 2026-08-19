import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "sampler-unit-mismatch",
    kind: "concept",
    prompt: {
      vi: `Đoạn code sau bind một texture vào unit 1 nhưng fragment shader lại hiện màu đen hoặc sai texture:

\`\`\`js
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, myTexture);
// ...không có dòng nào khác đụng tới uTextureLoc
\`\`\`

Giải thích chính xác vì sao sampler \`uTexture\` trong shader không tự động biết phải đọc từ unit 1, và viết ra dòng code còn thiếu để sửa.`,
      en: `The code below binds a texture to unit 1, yet the fragment shader shows black or the wrong texture:

\`\`\`js
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, myTexture);
// ...no other line touches uTextureLoc
\`\`\`

Explain precisely why the \`uTexture\` sampler in the shader doesn't automatically know to read from unit 1, and write the missing line that fixes it.`,
    },
    hints: [
      {
        vi: "Sampler uniform lưu kiểu dữ liệu gì — texture object hay một con số? Con số đó mặc định là bao nhiêu nếu không ai set?",
        en: "What does a sampler uniform actually store — the texture object, or a number? And what is that number by default if nobody sets it?",
      },
      {
        vi: "Mỗi hằng TEXTUREn tương ứng một chỉ số unit — texture trong đề đang nằm ở unit nào, còn sampler đang trỏ về đâu?",
        en: "Each TEXTUREn constant maps to a unit index — which unit holds the texture in the snippet, and where does the sampler point?",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được sampler uniform chỉ giữ chỉ số unit, không giữ texture object",
        en: "I can explain that a sampler uniform only holds a unit index, not the texture object",
      },
      {
        vi: "Tôi viết đúng gl.uniform1i(uTextureLoc, 1)",
        en: "I wrote the correct gl.uniform1i(uTextureLoc, 1)",
      },
      {
        vi: "Tôi nêu được vì sao bug này thường 'tự chạy đúng' khi chỉ có 1 texture ở unit 0",
        en: "I can state why this bug often 'accidentally works' when there's only one texture on unit 0",
      },
    ],
    solutionCode: `// gl.uniform1i tells the sampler which unit to read from — mandatory, never inferred automatically
gl.uniform1i(uTextureLoc, 1);`,
    solutionNote: {
      vi: `Với một texture duy nhất ở unit 0 (mặc định của sampler), bug này ẩn đi vì unit 0 tình cờ đúng — chỉ lộ ra khi có từ 2 texture trở lên trong cùng shader.`,
      en: `With a single texture on unit 0 (the sampler's default), this bug stays hidden because unit 0 happens to be correct — it only surfaces once a shader uses 2 or more textures.`,
    },
  },
  {
    id: "configure-texture-params",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`configureTexture\` nhận \`gl\` và hai tham số (giả định texture đích đã được bind trước khi gọi) \`filter: "nearest" | "linear" | "mipmap"\`, \`wrap: "repeat" | "clamp" | "mirror"\`. Hàm phải gọi đúng \`texParameteri\` cho MIN/MAG filter và WRAP_S/WRAP_T, và gọi \`generateMipmap\` nếu và chỉ nếu \`filter === "mipmap"\`.`,
      en: `Write a \`configureTexture\` function taking \`gl\` and two parameters (the target texture is assumed bound before the call) \`filter: "nearest" | "linear" | "mipmap"\`, \`wrap: "repeat" | "clamp" | "mirror"\`. It must call the correct \`texParameteri\` for MIN/MAG filter and WRAP_S/WRAP_T, and call \`generateMipmap\` if and only if \`filter === "mipmap"\`.`,
    },
    starterCode: `type Filter = "nearest" | "linear" | "mipmap";
type Wrap = "repeat" | "clamp" | "mirror";

function configureTexture(
  gl: WebGL2RenderingContext,
  filter: Filter,
  wrap: Wrap,
): void {
  // TODO: set TEXTURE_MIN_FILTER / TEXTURE_MAG_FILTER based on filter
  // TODO: set TEXTURE_WRAP_S / TEXTURE_WRAP_T based on wrap
  // TODO: call gl.generateMipmap only when filter === "mipmap"
}`,
    solutionCode: `type Filter = "nearest" | "linear" | "mipmap";
type Wrap = "repeat" | "clamp" | "mirror";

function configureTexture(
  gl: WebGL2RenderingContext,
  filter: Filter,
  wrap: Wrap,
): void {
  const min =
    filter === "nearest"
      ? gl.NEAREST
      : filter === "linear"
        ? gl.LINEAR
        : gl.LINEAR_MIPMAP_LINEAR;
  const mag = filter === "nearest" ? gl.NEAREST : gl.LINEAR;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag);

  const wrapMode =
    wrap === "repeat"
      ? gl.REPEAT
      : wrap === "clamp"
        ? gl.CLAMP_TO_EDGE
        : gl.MIRRORED_REPEAT;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);

  if (filter === "mipmap") {
    gl.generateMipmap(gl.TEXTURE_2D);
  }
}`,
    hints: [
      {
        vi: "MAG_FILTER chỉ có 2 lựa chọn hợp lệ (NEAREST/LINEAR) — không có chế độ mipmap cho magnification, dù filter là 'mipmap'.",
        en: "MAG_FILTER only accepts NEAREST/LINEAR — there's no mipmap mode for magnification, even when filter is 'mipmap'.",
      },
      {
        vi: "Gọi generateMipmap sau khi set filter, và chỉ khi filter thực sự là 'mipmap' — gọi thừa không sai kỹ thuật nhưng tốn CPU/GPU vô ích.",
        en: "Call generateMipmap after setting the filter, and only when filter is actually 'mipmap' — calling it unconditionally isn't technically wrong but wastes CPU/GPU work.",
      },
    ],
    checklist: [
      {
        vi: "MIN_FILTER dùng LINEAR_MIPMAP_LINEAR khi filter === 'mipmap', còn lại dùng đúng NEAREST/LINEAR",
        en: "MIN_FILTER uses LINEAR_MIPMAP_LINEAR when filter === 'mipmap', otherwise the matching NEAREST/LINEAR",
      },
      {
        vi: "MAG_FILTER luôn là NEAREST hoặc LINEAR, không bao giờ có hậu tố MIPMAP",
        en: "MAG_FILTER is always NEAREST or LINEAR, never a MIPMAP-suffixed value",
      },
      {
        vi: "generateMipmap chỉ được gọi khi filter === 'mipmap'",
        en: "generateMipmap is only called when filter === 'mipmap'",
      },
    ],
  },
];
