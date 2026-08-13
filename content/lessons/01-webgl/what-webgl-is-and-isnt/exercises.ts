import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "stack-and-missing-features",
    kind: "concept",
    prompt: {
      vi: `Bằng lời (không cần vẽ hình), liệt kê đúng thứ tự bốn lớp mà một lệnh \`gl.drawArrays()\` phải đi qua trước khi GPU thực sự ghi pixel ra màn hình, và nêu tên cụ thể của lớp dịch chạy trên Windows.

Sau đó liệt kê ít nhất 5 thứ WebGL *không* cung cấp sẵn ở tầng API — với mỗi thứ, nêu tên một kỹ thuật hoặc thư viện thường dùng để tự bù đắp.`,
      en: `In words (no diagram needed), list the four layers a \`gl.drawArrays()\` call passes through, in order, before the GPU actually writes pixels to the screen — and name the specific translation layer that runs on Windows.

Then list at least 5 things WebGL does *not* provide at the API level — for each one, name a technique or library commonly used to fill the gap.`,
    },
    hints: [
      {
        vi: "Thứ tự đúng: JavaScript → WebGL implementation của trình duyệt → driver hệ điều hành → GPU; tên lớp dịch trên Windows nằm trong phần 'ANGLE' của bài học.",
        en: "The correct order: JavaScript → the browser's WebGL implementation → the OS driver → the GPU; the Windows translation layer's name is covered in the 'ANGLE' section of the lesson.",
      },
      {
        vi: "Với 5 thứ WebGL không có, xem lại phần liệt kê trong bài — mỗi mục đều đi kèm một ví dụ kỹ thuật/thư viện bù đắp cụ thể (ví dụ: ánh sáng → tự viết Lambertian hoặc dùng Three.js Material).",
        en: "For the 5 missing features, revisit the lesson's list — each one comes paired with a concrete technique or library that fills it in (e.g. lighting → write Lambertian yourself, or use a Three.js Material).",
      },
    ],
    checklist: [
      {
        vi: "Tôi nêu đúng thứ tự 4 lớp: JS → WebGL implementation của trình duyệt → driver OS → GPU",
        en: "I stated the correct 4-layer order: JS → the browser's WebGL implementation → the OS driver → the GPU",
      },
      {
        vi: "Tôi gọi đúng tên ANGLE và biết nó dịch GL sang Direct3D/Vulkan trên Windows",
        en: "I named ANGLE correctly and know it translates GL calls to Direct3D/Vulkan on Windows",
      },
      {
        vi: "Tôi liệt kê được ít nhất 5 thứ WebGL không cung cấp, kèm cách bù đắp cụ thể cho từng thứ",
        en: "I listed at least 5 things WebGL doesn't provide, each with a concrete way to fill the gap",
      },
    ],
    solutionCode: `// 4 lớp, đúng thứ tự:
// JavaScript (gl.drawArrays) → WebGL implementation của trình duyệt (validate
// tham số) → driver đồ hoạ hệ điều hành (trên Windows: ANGLE dịch GL sang
// Direct3D 11 / Vulkan) → GPU thực thi lệnh và ghi framebuffer.
//
// 5+ thứ WebGL không cung cấp sẵn, và cách bù đắp thường dùng:
// 1. Scene graph          → tự viết cây transform, hoặc dùng THREE.Object3D
// 2. Ánh sáng              → tự viết Lambertian/Phong trong fragment shader
// 3. Loader model (glTF)  → tự parse binary, hoặc dùng GLTFLoader của Three.js
// 4. Vật lý                → dùng physics engine riêng (Rapier, Cannon-es)
// 5. Text rendering        → tự dựng texture atlas, hoặc dùng SDF font
// 6. Picking/raycasting    → tự tính giao tia-hình học, hoặc THREE.Raycaster`,
  },
  {
    id: "safe-webgl2-context",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`getWebGL2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext\` gọi \`canvas.getContext("webgl2")\` và, thay vì để \`null\` lọt qua âm thầm, ném ra một \`Error\` có message rõ ràng khi trình duyệt/thiết bị không hỗ trợ WebGL2 — đúng lỗi hay gặp thứ hai của bài này.`,
      en: `Write a \`getWebGL2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext\` function that calls \`canvas.getContext("webgl2")\` and, instead of letting a \`null\` result slip through silently, throws an \`Error\` with a clear message when the browser/device doesn't support WebGL2 — exactly this lesson's second common mistake.`,
    },
    starterCode: `function getWebGL2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext("webgl2");
  // TODO: gl có thể là null ở đây — đây là cú \`as\` "lừa" compiler mà bài
  // học cảnh báo. Thay dòng dưới bằng: kiểm tra null rồi throw Error rõ ràng.
  return gl as WebGL2RenderingContext;
}`,
    solutionCode: `function getWebGL2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    throw new Error(
      "WebGL2 not supported on this device or browser — cannot create a context.",
    );
  }
  return gl;
}`,
    hints: [
      {
        vi: "\`canvas.getContext(\"webgl2\")\` trả về kiểu \`WebGL2RenderingContext | null\` — TypeScript sẽ không cho bạn dùng nó như context thật cho tới khi loại bỏ nhánh \`null\`.",
        en: "\`canvas.getContext(\"webgl2\")\` returns \`WebGL2RenderingContext | null\` — TypeScript won't let you use it as a real context until you narrow away the \`null\` branch.",
      },
      {
        vi: "Đừng trả về \`null\` hay ép kiểu (\`as\`) để lừa qua compiler — đúng tinh thần lỗi hay gặp #2 là throw sớm, thất bại rõ ràng, thay vì để lỗi mơ hồ nổ ra ở dòng gọi \`gl.\` tiếp theo.",
        en: "Don't return \`null\` or cast (\`as\`) your way past the compiler — the whole point of mistake #2 is to fail loudly and early instead of letting a vague error surface at the next \`gl.\` call.",
      },
    ],
    checklist: [
      {
        vi: "Hàm throw \`Error\` có message rõ ràng khi \`getContext(\"webgl2\")\` trả về \`null\`",
        en: "The function throws an \`Error\` with a clear message when \`getContext(\"webgl2\")\` returns \`null\`",
      },
      {
        vi: "Kiểu trả về là \`WebGL2RenderingContext\` thật (không phải \`| null\`), không dùng \`as\` để lừa compiler",
        en: "The return type is a real \`WebGL2RenderingContext\` (not \`| null\`), without using \`as\` to trick the compiler",
      },
      {
        vi: "Gọi thử với một canvas hợp lệ trả về context dùng được ngay cho \`gl.getParameter\`, \`gl.clear\`, v.v.",
        en: "Calling it with a valid canvas returns a context immediately usable for \`gl.getParameter\`, \`gl.clear\`, etc.",
      },
    ],
  },
];
