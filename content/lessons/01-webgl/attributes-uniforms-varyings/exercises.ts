import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "classify-per-vertex-fade",
    kind: "concept",
    prompt: {
      vi: `Một tam giác được vẽ bằng một draw call duy nhất. Đỉnh trên cùng cần alpha $= 1.0$ (đục hoàn toàn), hai đỉnh dưới cần alpha $= 0.2$ (gần trong suốt), và alpha ở phần fill bên trong tam giác phải chuyển mượt giữa hai cực đó. Với mỗi đại lượng sau, xác định nó nên là \`attribute\`, \`uniform\`, hay \`out\`/\`in\` (varying), và giải thích một câu vì sao: (a) alpha gán riêng cho từng đỉnh trong buffer trước khi vẽ; (b) alpha đọc được bên trong fragment shader tại một fragment nằm giữa tam giác; (c) một hệ số mờ toàn cục \`uGlobalOpacity\` nhân thêm vào alpha cuối, áp dụng như nhau cho cả tam giác.

Sau đó giải thích: nếu chuyển alpha ở mục (a) thành một \`uniform\` thay vì \`attribute\`, hiệu ứng chuyển mượt giữa hai cực có còn xảy ra không, và vì sao.`,
      en: `A triangle is drawn with a single draw call. The top vertex needs alpha $= 1.0$ (fully opaque), the two bottom vertices need alpha $= 0.2$ (nearly transparent), and the alpha across the triangle's fill has to blend smoothly between those two extremes. For each quantity below, decide whether it belongs as an \`attribute\`, a \`uniform\`, or an \`out\`/\`in\` (varying), and explain why in one sentence: (a) the alpha assigned per vertex in the buffer before drawing; (b) the alpha read inside the fragment shader at a fragment sitting in the middle of the triangle; (c) a global opacity multiplier \`uGlobalOpacity\` applied on top of the final alpha, the same for the whole triangle.

Then explain: if you moved (a)'s alpha into a \`uniform\` instead of an \`attribute\`, would the smooth blend between the two extremes still happen, and why.`,
    },
    hints: [
      {
        vi: "Câu hỏi cốt lõi cho (a) và (b): giá trị khác nhau GIỮA CÁC ĐỈNH (attribute), hay khác nhau GIỮA CÁC FRAGMENT bên trong cùng một tam giác nhờ nội suy (varying)?",
        en: "The core question for (a) and (b): does the value differ BETWEEN VERTICES (attribute), or between FRAGMENTS inside one triangle via interpolation (varying)?",
      },
      {
        vi: "(c) không đổi ở bất kỳ đỉnh hay fragment nào trong draw call này — đó là dấu hiệu nhận biết uniform.",
        en: "(c) never changes across any vertex or fragment in this draw call — that's the tell for a uniform.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng (a) = attribute, (b) = varying (out/in), (c) = uniform",
        en: "I correctly identified (a) = attribute, (b) = varying (out/in), (c) = uniform",
      },
      {
        vi: "Tôi giải thích được vì sao một uniform không thể tạo gradient giữa hai đỉnh (nó không có khái niệm 'giữa hai đỉnh')",
        en: "I can explain why a uniform can never create a gradient between two vertices (it has no notion of 'between two vertices')",
      },
      {
        vi: "Tôi nêu được: đổi (a) thành uniform khiến cả tam giác chỉ còn một alpha duy nhất, không còn chuyển tiếp",
        en: "I can state that moving (a) into a uniform would leave the whole triangle with one single alpha, with no transition",
      },
    ],
    solutionCode: `// (a) alpha riêng theo đỉnh, nằm trong buffer trước khi vẽ -> attribute
// (b) alpha đọc trong fragment shader tại 1 điểm giữa tam giác, đã bị
//     nội suy từ giá trị 3 đỉnh -> varying (out ở vertex, in ở fragment)
// (c) hệ số áp như nhau cho toàn draw call, không đổi theo đỉnh/fragment -> uniform
//
// Đổi (a) thành uniform: chỉ còn 1 con số duy nhất cho toàn tam giác, không
// còn 3 giá trị khác nhau để rasterizer nội suy -> gradient biến mất, tam
// giác chỉ có alpha đồng nhất (bất kể set 1.0, 0.2 hay giá trị nào khác).`,
  },
  {
    id: "wire-attribute-through-varying",
    kind: "shader",
    prompt: {
      vi: `Hoàn thiện cặp vertex/fragment shader bên dưới (GLSL ES 3.00) sao cho: mỗi đỉnh có một alpha riêng đọc từ attribute \`aAlpha\` (float), giá trị đó đi tới fragment shader qua đúng một varying, và fragment shader nhân alpha đã nội suy đó với một uniform toàn cục \`uGlobalOpacity\` (float) trước khi xuất màu.`,
      en: `Complete the vertex/fragment shader pair below (GLSL ES 3.00) so that: each vertex has its own alpha read from an \`aAlpha\` (float) attribute, that value reaches the fragment shader through exactly one varying, and the fragment shader multiplies the interpolated alpha by a global \`uGlobalOpacity\` (float) uniform before outputting the color.`,
    },
    starterCode: `// vertex shader
#version 300 es
in vec2 aPosition;
in float aAlpha;
// TODO 1: khai báo một out float truyền alpha sang fragment shader

void main() {
  // TODO 2: gán varying = aAlpha
  gl_Position = vec4(aPosition, 0.0, 1.0);
}

// fragment shader
#version 300 es
precision highp float;
// TODO 3: khai báo in float khớp tên và kiểu với vertex shader
uniform float uGlobalOpacity;
out vec4 outColor;

void main() {
  // TODO 4: nhân alpha đã nội suy với uGlobalOpacity, gán vào outColor.a
  outColor = vec4(1.0, 1.0, 1.0, 1.0);
}`,
    solutionCode: `// vertex shader
#version 300 es
in vec2 aPosition;
in float aAlpha;
out float vAlpha;

void main() {
  vAlpha = aAlpha;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}

// fragment shader
#version 300 es
precision highp float;
in float vAlpha;
uniform float uGlobalOpacity;
out vec4 outColor;

void main() {
  outColor = vec4(1.0, 1.0, 1.0, vAlpha * uGlobalOpacity);
}`,
    hints: [
      {
        vi: "Tên và kiểu của biến out ở vertex shader phải khớp CHÍNH XÁC với biến in ở fragment shader — GLSL nối chúng bằng tên, không phải thứ tự khai báo.",
        en: "The out variable's name and type in the vertex shader must match the in variable in the fragment shader EXACTLY — GLSL links them by name, not declaration order.",
      },
      {
        vi: "uGlobalOpacity không cần đi qua varying nào cả — fragment shader đọc uniform trực tiếp, vì nó không đổi theo đỉnh hay fragment.",
        en: "uGlobalOpacity needs no varying at all — the fragment shader reads the uniform directly, since it never changes per vertex or fragment.",
      },
    ],
    checklist: [
      {
        vi: "Vertex shader khai báo out float vAlpha và gán vAlpha = aAlpha",
        en: "The vertex shader declares out float vAlpha and assigns vAlpha = aAlpha",
      },
      {
        vi: "Fragment shader khai báo in float vAlpha cùng tên, cùng kiểu",
        en: "The fragment shader declares in float vAlpha with the same name and type",
      },
      {
        vi: "Alpha cuối cùng là vAlpha * uGlobalOpacity, không phải cộng hay chỉ dùng một trong hai",
        en: "The final alpha is vAlpha * uGlobalOpacity, not an addition or just one of the two",
      },
    ],
  },
];
