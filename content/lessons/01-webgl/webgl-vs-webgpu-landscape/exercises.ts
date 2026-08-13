import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "webgl2-features-and-support-decision",
    kind: "concept",
    prompt: {
      vi: `Track này đã dùng ít nhất ba khả năng chỉ có ở WebGL2 (không có, hoặc chỉ có qua extension, ở WebGL1). Kể tên đúng ba khả năng đó, và với mỗi khả năng, nói rõ ở WebGL1 nó tồn tại dưới dạng extension nào — hoặc hoàn toàn không tồn tại.

Sau đó, giả sử bạn đang xây một trang portfolio 3D công khai, mục tiêu tiếp cận được nhiều thiết bị nhất có thể: bạn chọn baseline WebGL2, hay đầu tư thẳng vào WebGPU với fallback? Giải thích quyết định bằng đúng sự khác biệt về mức độ phổ cập đã nêu trong bài, không phải vì "WebGPU mới hơn".`,
      en: `This track used at least three capabilities that only exist in WebGL2 (missing, or extension-only, in WebGL1). Name three of them, and for each, state exactly what extension it corresponds to in WebGL1 — or that it has no WebGL1 equivalent at all.

Then, suppose you're building a public 3D portfolio site aiming to reach as many devices as possible: do you pick WebGL2 as your baseline, or invest directly in WebGPU with a fallback? Justify the decision using the actual support-level gap described in the lesson, not just "WebGPU is newer".`,
    },
    hints: [
      {
        vi: "Ba ứng viên nằm ngay trong track này: VAO, instancing, MRT, transform feedback, 3D texture — chọn đúng ba, đối chiếu lại tên extension WebGL1 tương ứng (hoặc 'không có' nếu WebGL2 mới thêm hẳn).",
        en: "Three candidates sit right in this track: VAOs, instancing, MRT, transform feedback, 3D textures — pick three, match each to its WebGL1 extension name (or 'none' if WebGL2 added it outright).",
      },
      {
        vi: "'Tiếp cận nhiều thiết bị nhất' là từ khoá quyết định câu trả lời — so nó với mức độ phổ cập của WebGL2 so với WebGPU đã nói ở phần 'Chọn công nghệ nào vào năm 2026'.",
        en: "'Reach as many devices as possible' is the deciding phrase — weigh it against WebGL2 versus WebGPU's support levels described in the 'What to Reach for in 2026' section.",
      },
    ],
    checklist: [
      {
        vi: "Nêu đúng 3 khả năng và phân loại đúng: core WebGL2 / extension WebGL1 / hoàn toàn không có ở WebGL1",
        en: "Named 3 capabilities and correctly classified each: WebGL2 core / WebGL1 extension / no WebGL1 equivalent",
      },
      {
        vi: "Đưa ra quyết định WebGL2 hay WebGPU kèm lý do dựa trên mức độ phổ cập, không chỉ 'vì WebGPU mới hơn'",
        en: "Made a WebGL2-vs-WebGPU decision backed by support-level reasoning, not just 'WebGPU is newer'",
      },
      {
        vi: "Không nhầm transform feedback hay 3D texture là thứ có thể bù bằng extension ở WebGL1",
        en: "Did not mistake transform feedback or 3D textures for something patchable via a WebGL1 extension",
      },
    ],
  },
  {
    id: "pick-best-context",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`pickBestContext(canvas)\` chọn context WebGL tốt nhất mà trình duyệt hiện có: thử \`webgl2\` trước, nếu thất bại thử \`webgl\` (rồi \`experimental-webgl\` cho trình duyệt/driver rất cũ chưa alias sang \`webgl\`), và ném lỗi rõ ràng nếu không context nào tạo được. Trả về cả context lẫn nhãn phiên bản để phần code gọi hàm biết mình đang chạy trên nền nào.`,
      en: `Write a \`pickBestContext(canvas)\` function that picks the best WebGL context the browser currently offers: try \`webgl2\` first, fall back to \`webgl\` on failure (then \`experimental-webgl\` for very old browsers/drivers that never aliased it to \`webgl\`), and throw a clear error if neither context can be created. Return both the context and a version label so calling code knows which backend it's running on.`,
    },
    starterCode: `interface ContextPick {
  gl: WebGL2RenderingContext | WebGLRenderingContext;
  version: "webgl2" | "webgl1";
}

function pickBestContext(canvas: HTMLCanvasElement): ContextPick {
  // TODO 1: thử webgl2 trước, trả về ngay nếu thành công
  // TODO 2: fallback webgl, rồi experimental-webgl
  // TODO 3: throw Error rõ ràng nếu cả ba lần thử đều null
  throw new Error("not implemented");
}`,
    solutionCode: `interface ContextPick {
  gl: WebGL2RenderingContext | WebGLRenderingContext;
  version: "webgl2" | "webgl1";
}

function pickBestContext(canvas: HTMLCanvasElement): ContextPick {
  const gl2 = canvas.getContext("webgl2");
  if (gl2) return { gl: gl2, version: "webgl2" };

  const gl1 = (canvas.getContext("webgl") ??
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  if (gl1) return { gl: gl1, version: "webgl1" };

  throw new Error(
    "Neither a WebGL2 nor a WebGL1 context could be created on this canvas",
  );
}`,
    hints: [
      {
        vi: "canvas.getContext trả về null khi không hỗ trợ, không throw — kiểm tra bằng if, không cần try/catch.",
        en: "canvas.getContext returns null when unsupported, it doesn't throw — check with if, no try/catch needed.",
      },
      {
        vi: "experimental-webgl chỉ còn cần cho vài trình duyệt/driver cũ chưa alias sang 'webgl' — thử nó sau 'webgl', không phải trước.",
        en: "experimental-webgl is only still needed on a few old browsers/drivers that never aliased it to 'webgl' — try it after 'webgl', not before.",
      },
    ],
    checklist: [
      {
        vi: "Thử đúng thứ tự: webgl2 → webgl → experimental-webgl",
        en: "Tries in the correct order: webgl2 → webgl → experimental-webgl",
      },
      {
        vi: "Trả về đúng version label khớp với context thật sự tạo được",
        en: "Returns the version label matching whichever context actually got created",
      },
      {
        vi: "Throw Error có message rõ ràng khi cả ba lần thử đều null",
        en: "Throws an Error with a clear message when all three attempts return null",
      },
    ],
  },
];
