import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "compute-interleaved-offsets",
    kind: "concept",
    prompt: {
      vi: `Một mesh dùng buffer xen kẽ với thứ tự thuộc tính: position (\`vec3\`, 3 số thực), rồi normal (\`vec3\`, 3 số thực), rồi uv (\`vec2\`, 2 số thực) — tổng 8 số thực mỗi vertex. Không chạy code, hãy tính: (a) stride tính bằng byte cho toàn bộ vertex, (b) offset byte của normal, (c) offset byte của uv, (d) byte bắt đầu của thuộc tính uv tại vertex chỉ số $i = 10$ (đếm từ 0) trong buffer.`,
      en: `A mesh uses an interleaved buffer with attributes in this order: position (\`vec3\`, 3 floats), then normal (\`vec3\`, 3 floats), then uv (\`vec2\`, 2 floats) — 8 floats per vertex total. Without running code, compute: (a) the stride in bytes for one whole vertex, (b) normal's byte offset, (c) uv's byte offset, (d) the starting byte of the uv attribute at vertex index $i = 10$ (zero-indexed) in the buffer.`,
    },
    hints: [
      {
        vi: "Mỗi số thực chiếm 4 byte. position chiếm 3×4=12 byte trước khi normal bắt đầu; normal chiếm thêm 12 byte trước khi uv bắt đầu.",
        en: "Each float is 4 bytes. Position takes 3×4=12 bytes before normal starts; normal takes another 12 bytes before uv starts.",
      },
      {
        vi: "Byte bắt đầu của vertex $i$ là $i \\times \\text{stride}$. Cộng thêm offset của thuộc tính bên trong vertex đó để ra byte tuyệt đối trong buffer.",
        en: "Vertex $i$'s starting byte is $i \\times \\text{stride}$. Add the attribute's own offset inside that vertex to get its absolute byte position in the buffer.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng stride = 32 byte (8 số thực × 4 byte)",
        en: "I computed stride = 32 bytes (8 floats × 4 bytes) correctly",
      },
      {
        vi: "Tôi tính đúng offset normal = 12 byte và offset uv = 24 byte",
        en: "I computed normal's offset = 12 bytes and uv's offset = 24 bytes correctly",
      },
      {
        vi: "Tôi tính đúng byte bắt đầu của uv tại vertex 10 là 344 (= 10×32 + 24)",
        en: "I computed uv's starting byte at vertex 10 as 344 (= 10×32 + 24) correctly",
      },
    ],
    solutionNote: {
      vi: `position: 3 số thực × 4B = 12B → offset 0. normal: 3 số thực × 4B = 12B → offset 12. uv: 2 số thực × 4B = 8B → offset 24.

stride = 12 + 12 + 8 = 32 byte/vertex.

vertex i=10 bắt đầu tại byte 10 × 32 = 320. uv của vertex 10 bắt đầu tại 320 + 24 = 344.`,
      en: `position: 3 floats × 4B = 12B → offset 0. normal: 3 floats × 4B = 12B → offset 12. uv: 2 floats × 4B = 8B → offset 24.

stride = 12 + 12 + 8 = 32 bytes/vertex.

vertex i=10 starts at byte 10 × 32 = 320. uv for vertex 10 starts at 320 + 24 = 344.`,
    },
  },
  {
    id: "compute-attrib-layout-fn",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`computeLayout\` nhận một mảng mô tả thuộc tính (tên + số thành phần, mỗi thành phần là một số thực 4 byte), trả về \`stride\` tổng (byte) và \`offsets\` — offset byte của từng thuộc tính theo đúng thứ tự khai báo. Đây chính là phép tính bạn sẽ dùng để gọi \`vertexAttribPointer\` đúng cho bất kỳ layout xen kẽ nào, không riêng ví dụ 20 byte trong bài.`,
      en: `Write a \`computeLayout\` function that takes an array describing attributes (name + component count, each component a 4-byte float) and returns the total \`stride\` in bytes plus \`offsets\` — each attribute's byte offset, in declaration order. This is the exact arithmetic you'd use to call \`vertexAttribPointer\` correctly for any interleaved layout, not just this lesson's 20-byte example.`,
    },
    starterCode: `interface AttribSpec {
  name: string;
  components: number; // number of float components
}

interface Layout {
  stride: number;
  offsets: Record<string, number>;
}

function computeLayout(attribs: AttribSpec[]): Layout {
  // TODO: each component is 4 bytes (Float32). Accumulate the offset in
  // declaration order; stride = the total bytes of every attribute.
  return { stride: 0, offsets: {} };
}`,
    solutionCode: `interface AttribSpec {
  name: string;
  components: number;
}

interface Layout {
  stride: number;
  offsets: Record<string, number>;
}

const BYTES_PER_FLOAT = 4;

function computeLayout(attribs: AttribSpec[]): Layout {
  const offsets: Record<string, number> = {};
  let cursor = 0;
  for (const attrib of attribs) {
    offsets[attrib.name] = cursor;
    cursor += attrib.components * BYTES_PER_FLOAT;
  }
  return { stride: cursor, offsets };
}

// computeLayout([
//   { name: "position", components: 3 },
//   { name: "normal", components: 3 },
//   { name: "uv", components: 2 },
// ])
// -> { stride: 32, offsets: { position: 0, normal: 12, uv: 24 } }`,
    hints: [
      {
        vi: "Giữ một biến `cursor` chạy dần: gán nó làm offset của thuộc tính hiện tại, rồi cộng thêm components×4 trước khi sang thuộc tính kế tiếp.",
        en: "Keep a running `cursor` variable: assign it as the current attribute's offset, then add components×4 before moving to the next attribute.",
      },
      {
        vi: "stride cuối cùng chính là giá trị `cursor` sau khi duyệt hết mọi thuộc tính — không phải một phép tính riêng.",
        en: "The final stride is just the `cursor` value after iterating every attribute — not a separate calculation.",
      },
    ],
    checklist: [
      {
        vi: "Hàm trả về offset của thuộc tính ĐẦU TIÊN luôn bằng 0",
        en: "The function returns offset 0 for the FIRST attribute, always",
      },
      {
        vi: "stride trả về bằng đúng tổng byte của mọi thuộc tính cộng lại",
        en: "The returned stride equals the sum of every attribute's bytes",
      },
      {
        vi: "Test với layout position(3)+normal(3)+uv(2) cho ra đúng { stride: 32, offsets: { position: 0, normal: 12, uv: 24 } }",
        en: "Testing with the position(3)+normal(3)+uv(2) layout produces exactly { stride: 32, offsets: { position: 0, normal: 12, uv: 24 } }",
      },
    ],
  },
];
