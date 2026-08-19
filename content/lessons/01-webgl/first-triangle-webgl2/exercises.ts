import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "diagnose-blank-canvas",
    kind: "concept",
    prompt: {
      vi: `Bạn viết đúng phần setup context, nhưng quên gọi \`gl.getShaderParameter(shader, gl.COMPILE_STATUS)\` sau \`gl.compileShader\`. Fragment shader của bạn có một lỗi cú pháp nhỏ (thiếu dấu \`;\`). Không chạy code, hãy dự đoán: (a) \`gl.compileShader\` có ném exception JavaScript không; (b) \`gl.linkProgram\` gọi sau đó, với cả hai shader đã attach, có tự fail không; (c) nếu code cũng không kiểm tra \`LINK_STATUS\`, canvas cuối cùng hiển thị gì.

Giải thích ngắn gọn cơ chế đằng sau mỗi câu trả lời.`,
      en: `You write the context setup correctly, but forget to call \`gl.getShaderParameter(shader, gl.COMPILE_STATUS)\` after \`gl.compileShader\`. Your fragment shader has a small syntax error (a missing \`;\`). Without running the code, predict: (a) does \`gl.compileShader\` throw a JavaScript exception; (b) does the subsequent \`gl.linkProgram\` call, with both shaders attached, fail on its own; (c) if the code also skips checking \`LINK_STATUS\`, what does the canvas end up showing.

Briefly explain the mechanism behind each answer.`,
    },
    hints: [
      {
        vi: "Tra MDN compileShader: lỗi GLSL được báo qua cơ chế nào — exception hay một thứ bạn phải tự hỏi?",
        en: "Check MDN for compileShader: how are GLSL errors reported — an exception, or something you must ask for yourself?",
      },
      {
        vi: "Spec của linkProgram liệt kê các điều kiện khiến LINK_STATUS = false — điều kiện đầu tiên liên quan gì tới các shader đính kèm?",
        en: "The linkProgram spec lists the conditions that force LINK_STATUS = false — what does the first one say about the attached shaders?",
      },
    ],
    checklist: [
      {
        vi: "Tôi biết compileShader không ném exception dù GLSL sai cú pháp",
        en: "I know compileShader doesn't throw an exception even with broken GLSL syntax",
      },
      {
        vi: "Tôi biết linkProgram sẽ tự fail vì shader chưa compile thành công, không cần đợi tới lúc vẽ mới phát hiện",
        en: "I know linkProgram fails on its own because the shader never compiled, without waiting until draw time to notice",
      },
      {
        vi: "Tôi biết nếu code không kiểm tra cả hai status, canvas chỉ hiện màu clear, không có exception nào giúp định vị lỗi",
        en: "I know that if the code checks neither status, the canvas just shows the clear color, with no exception pointing at the actual bug",
      },
    ],
    solutionNote: {
      vi: `(a) \`gl.compileShader\` KHÔNG ném exception dù GLSL sai cú pháp — nó chỉ đặt \`COMPILE_STATUS = false\` bên trong shader object.

(b) \`gl.linkProgram\` SẼ tự fail (\`LINK_STATUS = false\`): theo spec, link yêu cầu MỌI shader đính kèm phải compile thành công trước đó.

(c) Nếu code không kiểm tra cả hai status, \`useProgram\` trên một program link-fail sinh lỗi \`GL_INVALID_OPERATION\` (không phải JS exception) và không đổi chương trình đang active; \`drawArrays\` sau đó không vẽ gì hợp lệ, nên canvas chỉ hiện đúng màu clearColor, không một dòng log nào chỉ thẳng vào dòng GLSL sai, trừ khi tự gọi \`getShaderInfoLog\`/\`getProgramInfoLog\`.`,
      en: `(a) \`gl.compileShader\` does NOT throw an exception even with broken GLSL syntax — it only sets \`COMPILE_STATUS = false\` inside the shader object.

(b) \`gl.linkProgram\` WILL fail on its own (\`LINK_STATUS = false\`): per spec, linking requires EVERY attached shader to have already compiled successfully.

(c) If the code checks neither status, calling \`useProgram\` on a link-failed program raises a \`GL_INVALID_OPERATION\` error (not a JS exception) and leaves the active program unchanged; the subsequent \`drawArrays\` draws nothing valid, so the canvas just shows the clear color, with no log line pointing at the actual broken GLSL line unless you call \`getShaderInfoLog\`/\`getProgramInfoLog\` yourself.`,
    },
  },
  {
    id: "fix-broken-attribute-wiring",
    kind: "code",
    prompt: {
      vi: `Đoạn code bên dưới cấu hình attribute cho một buffer interleaved \`x, y, r, g, b\` (stride 20 byte/đỉnh), khớp với shader khai \`in vec2 aPosition\` và \`in vec3 aColor\`. Dòng cấu hình \`aColor\` có bug khiến màu bị sai. Sửa đúng \`size\` và \`offset\` của \`vertexAttribPointer\` cho \`aColor\`.`,
      en: `The code below configures attributes for an interleaved \`x, y, r, g, b\` buffer (stride 20 bytes/vertex), matching a shader declaring \`in vec2 aPosition\` and \`in vec3 aColor\`. The \`aColor\` configuration line has a bug that produces wrong colors. Fix the \`size\` and \`offset\` of \`vertexAttribPointer\` for \`aColor\`.`,
    },
    starterCode: `// Interleaved buffer: x, y, r, g, b per vertex (5 floats = 20 bytes/vertex)
const aPosition = gl.getAttribLocation(program, "aPosition");
const aColor = gl.getAttribLocation(program, "aColor");

gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 20, 0);

gl.enableVertexAttribArray(aColor);
// BUG: only reads 2 color components (missing the B channel) and the offset
// matches aPosition's offset instead of pointing at where color actually starts
gl.vertexAttribPointer(aColor, 2, gl.FLOAT, false, 20, 0);`,
    solutionCode: `const aPosition = gl.getAttribLocation(program, "aPosition");
const aColor = gl.getAttribLocation(program, "aColor");

gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 20, 0);

gl.enableVertexAttribArray(aColor);
// 3 components (r,g,b); offset 8 = after 2 floats (x,y) = 2 * 4 bytes
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 20, 8);`,
    hints: [
      {
        vi: "Stride 20 nghĩa là mỗi đỉnh chiếm 20 byte (5 float × 4 byte); offset là byte TÍNH TỪ ĐẦU MỖI ĐỈNH tới component đầu tiên của attribute đó — x,y chiếm 8 byte đầu, nên màu bắt đầu ở byte 8.",
        en: "Stride 20 means each vertex takes 20 bytes (5 floats × 4 bytes); the offset is bytes FROM THE START OF EACH VERTEX to that attribute's first component — x,y take the first 8 bytes, so color starts at byte 8.",
      },
      {
        vi: "aColor khai báo in vec3 aColor trong shader (3 component: r,g,b) — size trong vertexAttribPointer phải khớp đúng 3, không phải 2.",
        en: "aColor is declared in vec3 aColor in the shader (3 components: r,g,b) — the size in vertexAttribPointer must match exactly 3, not 2.",
      },
    ],
    checklist: [
      {
        vi: "aColor dùng size = 3 (khớp vec3 trong shader)",
        en: "aColor uses size = 3 (matching vec3 in the shader)",
      },
      {
        vi: "aColor dùng offset = 8 (byte, sau 2 float x,y)",
        en: "aColor uses offset = 8 (bytes, after the 2 x,y floats)",
      },
      {
        vi: "aPosition giữ nguyên size = 2, offset = 0 vì nó nằm ở đầu mỗi đỉnh",
        en: "aPosition stays at size = 2, offset = 0 since it sits at the start of each vertex",
      },
    ],
  },
];
