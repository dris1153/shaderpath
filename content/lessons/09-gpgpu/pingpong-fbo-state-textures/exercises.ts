import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "feedback-loop-memory",
    kind: "concept",
    prompt: {
      vi: `Một cặp ping-pong dùng texture $128 \\times 128$, định dạng RGBA half-float (2 byte mỗi kênh, 4 kênh). Tính tổng bộ nhớ VRAM (byte) mà HAI texture position (A và B) chiếm dụng.

Sau đó giải thích bằng cơ chế cụ thể: điều gì xảy ra ở cấp driver nếu bạn cố render vào target A trong khi fragment shader cũng đang sample chính target A làm input — vì sao kết quả "có vẻ chạy đúng" trên một GPU cụ thể lại không đáng tin cậy?`,
      en: `A ping-pong pair uses $128 \\times 128$ textures, RGBA half-float format (2 bytes per channel, 4 channels). Compute the total VRAM (bytes) the TWO position textures (A and B) occupy together.

Then explain with a concrete mechanism: what happens at the driver level if you render into target A while a fragment shader is also sampling that same target A as input — why is a result that "seems to work" on one specific GPU not something you can rely on?`,
    },
    hints: [
      {
        vi: "Bộ nhớ một texture = width × height × bytesPerChannel × channelCount; nhân đôi vì có cả A và B.",
        en: "One texture's memory = width × height × bytesPerChannel × channelCount; double it since there's both A and B.",
      },
      {
        vi: "\"Undefined behavior\" không có nghĩa là luôn crash — nó có nghĩa driver được toàn quyền chọn bất kỳ hành vi nào, kể cả một hành vi trông-như-đúng chỉ vì phần cứng/driver cụ thể bạn đang test tình cờ lập lịch fragment theo đúng thứ tự bạn cần.",
        en: "\"Undefined behavior\" doesn't mean it always crashes — it means the driver is free to pick any behavior at all, including one that looks correct purely because the specific hardware/driver you're testing on happens to schedule fragments in the order you needed.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng tổng byte cho cặp position A+B ở 128×128 RGBA16F (≈256KB)",
        en: "I correctly computed total bytes for the position A+B pair at 128×128 RGBA16F (≈256KB)",
      },
      {
        vi: "Tôi phân biệt được hai cấp hành vi: WebGL bỏ qua draw và sinh INVALID_OPERATION kèm cảnh báo console, còn OpenGL ES gốc là undefined behavior",
        en: "I distinguished the two behavior levels: WebGL skips the draw with INVALID_OPERATION plus a console warning, while native OpenGL ES leaves it undefined",
      },
      {
        vi: "Tôi nêu được vì sao kết quả đúng trên một GPU không chứng minh code đúng trên GPU khác",
        en: "I stated why a correct result on one GPU doesn't prove the code is correct on another",
      },
    ],
    solutionNote: {
      vi: `Một texture $128 \\times 128$ RGBA16F $= 128 \\times 128 \\times 4 \\times 2 = 131{,}072$ byte. Cặp A + B (ping-pong) $= 131{,}072 \\times 2 = 262{,}144$ byte $\\approx 256$KB.

Render vào A trong khi cũng sample chính A là feedback loop. Trong WebGL — môi trường của khoá học — đặc tả biến nó thành lỗi xác định: draw call bị bỏ qua, \`INVALID_OPERATION\` được sinh ra, console in "Feedback loop formed between Framebuffer and active Texture"; trạng thái vì thế ĐỨNG YÊN chứ không loang lổ. Ở OpenGL ES gốc (ngoài trình duyệt), đây là undefined behavior — thứ tự đọc/ghi giữa các invocation song song không đảm bảo, kết quả tuỳ GPU/driver. Cả hai cấp đều dẫn tới cùng kết luận: cần hai texture và swap vai trò mỗi frame.`,
      en: `One $128 \\times 128$ RGBA16F texture $= 128 \\times 128 \\times 4 \\times 2 = 131{,}072$ bytes. The A + B ping-pong pair $= 131{,}072 \\times 2 = 262{,}144$ bytes $\\approx 256$KB.

Rendering into A while also sampling that same A is a feedback loop. In WebGL — this course's environment — the spec turns it into a defined error: the draw call is skipped, \`INVALID_OPERATION\` is generated, and the console logs "Feedback loop formed between Framebuffer and active Texture"; the state therefore FREEZES rather than corrupting. In native OpenGL ES (outside the browser) it is undefined behavior — read/write order across parallel invocations is unguaranteed, results varying by GPU/driver. Both levels lead to the same conclusion: two textures, roles swapped every frame.`,
    },
  },
  {
    id: "ping-pong-swap",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`createPingPong\` quản lý một cặp giá trị \`read\`/\`write\` với method \`swap()\` chỉ hoán đổi tham chiếu, không copy dữ liệu. Sau đó viết \`runSteps\` áp dụng nó để mô phỏng $N$ bước cập nhật, mỗi bước gọi một hàm \`step(read, write)\` rồi mới \`swap()\`.`,
      en: `Write a \`createPingPong\` function managing a \`read\`/\`write\` pair with a \`swap()\` method that only swaps references, never copies data. Then write \`runSteps\` that uses it to simulate $N$ update steps, each calling a \`step(read, write)\` function before \`swap()\`.`,
    },
    starterCode: `interface PingPong<T> {
  read: T;
  write: T;
  swap: () => void;
}

function createPingPong<T>(a: T, b: T): PingPong<T> {
  // TODO: read starts at a, write starts at b; swap() must flip both
  // WITHOUT copying T itself — only the two references move.
  throw new Error("not implemented");
}

function runSteps<T>(
  pingPong: PingPong<T>,
  steps: number,
  step: (read: T, write: T) => void,
): void {
  // TODO: loop \`steps\` times — call step(pingPong.read, pingPong.write),
  // THEN pingPong.swap(). Order matters: swapping first reads stale data.
}`,
    solutionCode: `interface PingPong<T> {
  read: T;
  write: T;
  swap: () => void;
}

function createPingPong<T>(a: T, b: T): PingPong<T> {
  const state: PingPong<T> = {
    read: a,
    write: b,
    swap: () => {
      const temp = state.read;
      state.read = state.write;
      state.write = temp;
    },
  };
  return state;
}

function runSteps<T>(
  pingPong: PingPong<T>,
  steps: number,
  step: (read: T, write: T) => void,
): void {
  for (let i = 0; i < steps; i++) {
    step(pingPong.read, pingPong.write);
    pingPong.swap();
  }
}`,
    hints: [
      {
        vi: "swap() chỉ cần đổi giá trị của hai property read/write cho nhau bằng một biến tạm — không có phép gán nào tạo bản sao dữ liệu T.",
        en: "swap() just needs to trade the read/write property values via one temp variable — no assignment here should create a copy of T.",
      },
      {
        vi: "runSteps lặp đúng steps lần, mỗi lần gọi step() XONG mới swap() — thứ tự ngược lại khiến bước đầu tiên đọc nhầm buffer.",
        en: "runSteps loops exactly `steps` times, calling step() BEFORE swap() each time — the reverse order makes the first step read the wrong buffer.",
      },
    ],
    checklist: [
      {
        vi: "swap() chỉ hoán đổi hai tham chiếu read/write, không có phép gán nào tạo bản sao dữ liệu T",
        en: "swap() only trades the two read/write references, with no assignment copying T's data",
      },
      {
        vi: "runSteps gọi step() rồi mới swap(), đúng N lần cho N bước",
        en: "runSteps calls step() before swap(), exactly N times for N steps",
      },
      {
        vi: "Sau N bước với N chẵn, read trỏ về đúng giá trị ban đầu là a; N lẻ thì trỏ về b",
        en: "After N steps with N even, read points back to the original value a; with N odd, it points to b",
      },
    ],
  },
];
