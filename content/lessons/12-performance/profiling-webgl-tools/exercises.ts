import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "diagnose-from-info",
    kind: "concept",
    prompt: {
      vi: `Bạn mở một cảnh và đọc được, ngay sau một lần render: \`renderer.info.render.calls = 812\`, \`render.triangles = 96,400\`, \`memory.geometries = 4\`, \`memory.textures = 6\`. Mở DevTools Performance, track Main gần như kín các khối "Scripting" dài, track GPU phần lớn thời gian rảnh. Hạ \`devicePixelRatio\` xuống 0.5 để thử — cảnh KHÔNG mượt hơn đáng kể.

Chỉ dựa vào các con số trên (không chạy code), hãy trả lời: đây là CPU-bound hay GPU-bound, dựa vào cụm bằng chứng nào? Và vì sao \`memory.geometries = 4\` trong khi \`render.calls = 812\` không hề mâu thuẫn nhau?`,
      en: `You open a scene and read, right after one render: \`renderer.info.render.calls = 812\`, \`render.triangles = 96,400\`, \`memory.geometries = 4\`, \`memory.textures = 6\`. Opening DevTools Performance, the Main track is nearly solid with long "Scripting" blocks, while the GPU track sits mostly idle. Dropping \`devicePixelRatio\` to 0.5 as a test does NOT meaningfully smooth things out.

Based only on these numbers (no code to run), answer: is this CPU-bound or GPU-bound, and which cluster of evidence points there? And why doesn't \`memory.geometries = 4\` while \`render.calls = 812\` contradict itself?`,
    },
    hints: [
      {
        vi: "Track Main kín Scripting + GPU rảnh là đúng dấu hiệu của một trong hai loại bottleneck đã học — không phải loại mà phép thử DPR xác nhận.",
        en: "A Main track packed with Scripting while GPU sits idle is the signature of one specific bottleneck type — not the one the DPR test would confirm.",
      },
      {
        vi: "geometries đếm số OBJECT hình học khác nhau đang tồn tại trên GPU; calls đếm số LỆNH VẼ đã phát ra trong frame. Một geometry có thể được vẽ lại nhiều lần bằng nhiều lệnh vẽ khác nhau.",
        en: "geometries counts distinct geometry OBJECTS resident on the GPU; calls counts DRAW COMMANDS issued in the frame. One geometry can be redrawn by many separate draw calls.",
      },
    ],
    checklist: [
      {
        vi: "Tôi kết luận đây là CPU-bound, dựa vào Main thread kín Scripting + GPU rảnh + DPR test không cải thiện",
        en: "I concluded CPU-bound, based on Main packed with Scripting + idle GPU + the DPR test not helping",
      },
      {
        vi: "Tôi giải thích được vì sao phép thử DPR không cải thiện khi bottleneck không nằm ở số pixel GPU phải tô",
        en: "I explained why the DPR test doesn't help when the bottleneck isn't the number of pixels the GPU has to shade",
      },
      {
        vi: "Tôi giải thích đúng vì sao geometries=4 và calls=812 không mâu thuẫn (geometry dùng chung, vẽ lặp lại nhiều lần với transform khác nhau)",
        en: "I correctly explained why geometries=4 and calls=812 don't conflict (shared geometry, redrawn many times with different transforms)",
      },
    ],
    solutionNote: {
      vi: `CPU-bound: track Main kín "Scripting" trong khi GPU phần lớn rảnh đúng là chữ ký của nghẽn CPU (driver submit 812 draw call cộng JS xung quanh nó), không phải GPU. Phép thử DPR 0.5 xác nhận thêm: giảm số pixel GPU phải tô không đổi lượng JS/draw-call nào, nên nếu bottleneck thật sự là GPU, giảm DPR PHẢI mượt hơn rõ rệt — ở đây không, nên GPU không phải nút thắt.

\`geometries=4\` và \`calls=812\` không mâu thuẫn nhau: \`geometries\` đếm số \`BufferGeometry\` KHÁC NHAU đang resident trên GPU (chỉ 4 hình dạng cơ sở khác nhau, có thể đang dùng chung như pattern SHARED_GEOMETRY trong demo), còn \`calls\` đếm số lệnh \`gl.drawElements\`/\`drawArrays\` đã phát ra — với 812 mesh riêng biệt dùng lại cùng 4 geometry đó (mỗi mesh một transform khác nhau), driver vẫn phải submit 812 lệnh vẽ độc lập dù chỉ có 4 hình dạng cơ sở.`,
      en: `CPU-bound: the Main track packed with "Scripting" while the GPU sits mostly idle is exactly the signature of a CPU bottleneck (the driver submitting 812 draw calls plus the JS around it), not a GPU one. The DPR 0.5 test confirms it further: reducing the pixel count the GPU has to shade doesn't change the amount of JS/draw-call work, so if the bottleneck were truly the GPU, dropping DPR SHOULD smooth things out noticeably — it didn't here, so the GPU isn't the bottleneck.

\`geometries=4\` and \`calls=812\` don't contradict each other: \`geometries\` counts DISTINCT \`BufferGeometry\` objects resident on the GPU (just 4 different base shapes, likely shared via the demo's SHARED_GEOMETRY pattern), while \`calls\` counts the number of \`gl.drawElements\`/\`drawArrays\` commands issued — with 812 separate meshes reusing those same 4 geometries (each mesh with its own transform), the driver still has to submit 812 independent draw commands despite there being only 4 base shapes.`,
    },
  },
  {
    id: "frame-time-tracker",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`createFrameTimeTracker(historyLen, alpha)\` trả về một object có phương thức \`push(deltaMs)\` (ghi nhận một frame mới) và \`snapshot()\` (trả về \`{ ema, fps, maxMs, history }\`). \`ema\` cập nhật theo công thức $EMA \\leftarrow EMA + \\alpha (x - EMA)$, \`history\` là mảng \`historyLen\` giá trị gần nhất (cũ nhất bị đẩy ra khi đầy), \`maxMs\` là giá trị lớn nhất hiện có trong \`history\`.`,
      en: `Write \`createFrameTimeTracker(historyLen, alpha)\` returning an object with \`push(deltaMs)\` (record one new frame) and \`snapshot()\` (returns \`{ ema, fps, maxMs, history }\`). \`ema\` updates via $EMA \\leftarrow EMA + \\alpha (x - EMA)$, \`history\` is an array of the last \`historyLen\` values (oldest dropped once full), \`maxMs\` is the largest value currently in \`history\`.`,
    },
    starterCode: `interface FrameStats {
  ema: number;
  fps: number;
  maxMs: number;
  history: number[];
}

function createFrameTimeTracker(historyLen: number, alpha: number) {
  let ema = 1000 / 60;
  const history: number[] = [];

  return {
    push(deltaMs: number) {
      // TODO: update ema with the EMA formula, push deltaMs into history,
      // and trim the oldest element if history grows past historyLen
    },
    snapshot(): FrameStats {
      // TODO: return { ema, fps (derived from ema), maxMs (largest in history), history }
      return { ema, fps: 0, maxMs: 0, history: [] };
    },
  };
}`,
    solutionCode: `interface FrameStats {
  ema: number;
  fps: number;
  maxMs: number;
  history: number[];
}

function createFrameTimeTracker(historyLen: number, alpha: number) {
  let ema = 1000 / 60;
  const history: number[] = [];

  return {
    push(deltaMs: number) {
      ema += (deltaMs - ema) * alpha;
      history.push(deltaMs);
      if (history.length > historyLen) history.shift();
    },
    snapshot(): FrameStats {
      return {
        ema,
        fps: 1000 / Math.max(ema, 0.01),
        maxMs: history.length ? Math.max(...history) : 0,
        history: [...history],
      };
    },
  };
}`,
    hints: [
      {
        vi: "EMA là một biến duy nhất cập nhật dần, không phải tính lại trung bình toàn bộ mảng mỗi lần push — đó là lý do nó rẻ hơn nhiều so với giữ mọi frame rồi average().",
        en: "EMA is a single running variable updated incrementally, not a recomputed average over the whole array on every push — that's why it's far cheaper than storing every frame and calling average().",
      },
      {
        vi: "fps suy ra trực tiếp từ ema bằng 1000/ema (đề phòng chia cho 0 bằng Math.max(ema, một số rất nhỏ)).",
        en: "fps derives directly from ema as 1000/ema (guard the division by zero with Math.max(ema, a tiny epsilon)).",
      },
    ],
    checklist: [
      {
        vi: "push() cập nhật ema bằng công thức EMA đúng, không phải trung bình cộng đơn giản",
        en: "push() updates ema with the correct EMA formula, not a plain running average",
      },
      {
        vi: "history không bao giờ dài quá historyLen, phần tử cũ nhất luôn bị loại trước",
        en: "history never grows past historyLen, the oldest element is always evicted first",
      },
      {
        vi: "snapshot() trả về bản sao của history (không trả về tham chiếu mảng nội bộ có thể bị mutate từ bên ngoài)",
        en: "snapshot() returns a copy of history (not a reference to the internal array that callers could mutate)",
      },
    ],
  },
];
