import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "leva-vs-product-panel-roles",
    kind: "concept",
    prompt: {
      vi: `Bài học này đặt control panel của \`Demo\` (nền tảng) ngay cạnh ý tưởng leva. Cả hai sinh UI từ một object khai báo, nhưng phục vụ hai vai trò khác nhau. Hãy nêu ra ít nhất hai khác biệt về vai trò, không phải giao diện, giữa leva và control panel của \`Demo\`, rồi giải thích vì sao gắn thẳng \`<Leva />\` vào bản production của một app thực tế, không phải nền tảng học này, thường là một sai lầm — và cách khắc phục.`,
      en: `This lesson places this platform's own \`Demo\` control panel right next to leva's idea. Both generate UI from a declarative object, but they serve two different roles. State at least two differences in ROLE, not appearance, between leva and \`Demo\`'s control panel, then explain why wiring \`<Leva />\` straight into a real app's production build, not this learning platform, is usually a mistake — and how to fix it.`,
    },
    hints: [
      {
        vi: "Control panel của `Demo` được lập trình viên nền tảng thiết kế sẵn cho một learner cụ thể tương tác với một demo cụ thể; leva được chính lập trình viên tự thêm vào lúc code để họ tinh chỉnh, rồi thường bị xoá sau khi chốt giá trị.",
        en: "`Demo`'s control panel is pre-designed by this platform's engineers for a specific learner interacting with one specific demo; leva is added by engineers themselves while coding, for their own tuning, and is usually removed once values are locked in.",
      },
      {
        vi: "`<Leva hidden />` không xoá code JS của leva khỏi bundle production — nó chỉ ẩn UI. Muốn thực sự loại leva khỏi bundle, phải tách import ra khỏi code path production (ví dụ: chỉ import khi NODE_ENV khác 'production', hoặc dynamic import).",
        en: "`<Leva hidden />` doesn't remove leva's JS from the production bundle — it only hides the UI. To actually remove it, the import itself must be split out of the production code path (e.g. only import when NODE_ENV isn't 'production', or a dynamic import).",
      },
    ],
    checklist: [
      {
        vi: "Tôi nêu được ít nhất hai khác biệt về VAI TRÒ giữa leva và control panel của Demo, không chỉ khác giao diện",
        en: "I named at least two ROLE differences between leva and Demo's control panel, not just appearance",
      },
      {
        vi: "Tôi giải thích được `hidden` chỉ ẩn UI, không tự động loại bỏ code leva khỏi bundle",
        en: "I explained that `hidden` only hides the UI, it doesn't automatically strip leva's code from the bundle",
      },
      {
        vi: "Tôi đề xuất được một cách cụ thể để tránh ship leva vào production (ví dụ: điều kiện theo NODE_ENV, dynamic import)",
        en: "I proposed a concrete way to avoid shipping leva to production (e.g. a NODE_ENV condition, dynamic import)",
      },
    ],
    solutionCode: `// Khác biệt về VAI TRÒ (không phải giao diện):
// 1. Ai thiết kế nó: control panel của Demo do lập trình viên NỀN TẢNG
//    thiết kế trước, cố định, cho NGƯỜI HỌC dùng — là UI chính thức của
//    sản phẩm. leva do chính lập trình viên tự thêm để HỌ tinh chỉnh khi
//    code, không phải UI dành cho người dùng cuối.
// 2. Vòng đời: control panel của Demo SỐNG CÙNG sản phẩm mãi mãi (mọi
//    người học đều thấy nó). leva chỉ sống trong lúc phát triển — gần
//    như luôn bị xoá hoặc tắt sau khi tìm ra con số cuối cùng.
//
// Gắn <Leva /> thẳng vào production sai vì: <Leva hidden /> chỉ ẩn UI,
// code JS của leva (và mọi state nó theo dõi) vẫn nằm trong bundle, vẫn
// tốn băng thông tải về dù người dùng cuối không bao giờ thấy panel đó.
// Cách khắc phục: tách code path theo môi trường, ví dụ
//   const DevPanel = process.env.NODE_ENV !== "production"
//     ? dynamic(() => import("./DevPanel")) : () => null;
// để bundler loại hẳn leva khỏi chunk production, không chỉ ẩn nó.`,
  },
  {
    id: "build-transient-tuner",
    kind: "code",
    prompt: {
      vi: `Viết một transient store nhỏ \`createTuner<T>(initial)\` mô phỏng đúng cơ chế \`get\`/\`set\` của leva: \`set(patch)\` cập nhật giá trị NGAY LẬP TỨC, đồng bộ, không qua bất kỳ \`setState\`/re-render nào; \`get(key)\` đọc đúng giá trị MỚI NHẤT tại thời điểm gọi. Kết quả phải dùng được bên trong một vòng lặp \`requestAnimationFrame\` để đọc giá trị mới mỗi frame mà không ép component nào re-render.`,
      en: `Write a small transient store, \`createTuner<T>(initial)\`, mimicking leva's exact \`get\`/\`set\` mechanism: \`set(patch)\` updates the value IMMEDIATELY and synchronously, with no \`setState\`/re-render involved; \`get(key)\` reads the exact LATEST value at the moment it's called. The result must be usable inside a \`requestAnimationFrame\` loop to read fresh values every frame without forcing any component to re-render.`,
    },
    starterCode: `interface Tuner<T extends Record<string, number>> {
  get: <K extends keyof T>(key: K) => T[K];
  set: (patch: Partial<T>) => void;
}

function createTuner<T extends Record<string, number>>(initial: T): Tuner<T> {
  // TODO: giữ giá trị hiện tại trong một biến (KHÔNG phải React state) —
  // get đọc trực tiếp từ biến đó tại thời điểm gọi, set merge patch vào
  // biến đó — không bước nào gọi setState hay trigger re-render.
  throw new Error("not implemented");
}`,
    solutionCode: `function createTuner<T extends Record<string, number>>(initial: T): Tuner<T> {
  let state = { ...initial };
  return {
    get: (key) => state[key],
    set: (patch) => {
      state = { ...state, ...patch };
    },
  };
}

// dùng trong render loop, giống hệt cách get/set của leva tránh re-render:
// const tuner = createTuner({ intensity: 1.2 });
// function animate() {
//   light.intensity = tuner.get("intensity"); // đọc mới nhất, không re-render
//   requestAnimationFrame(animate);
// }`,
    hints: [
      {
        vi: "Đừng dùng `useState` — mấu chốt của transient read là giá trị sống NGOÀI vòng đời re-render của React, y hệt một biến giữ trong closure hay một `useRef`.",
        en: "Don't use `useState` — the whole point of a transient read is that the value lives OUTSIDE React's re-render lifecycle, exactly like a closure variable or a `useRef`.",
      },
      {
        vi: "`get` phải đọc `state` tại đúng thời điểm được GỌI, không phải giá trị đã chụp lúc `createTuner` chạy — nếu bạn destructure `state` ra một biến const riêng bên ngoài closure của `get`, giá trị sẽ bị đóng băng sai.",
        en: "`get` must read `state` at the moment it's CALLED, not a value captured when `createTuner` ran — destructuring `state` into a separate const outside `get`'s closure would freeze it incorrectly.",
      },
    ],
    checklist: [
      {
        vi: "`set` cập nhật giá trị ngay lập tức, không qua `setState`/re-render nào",
        en: "`set` updates the value immediately, with no `setState`/re-render involved",
      },
      {
        vi: "`get(key)` luôn trả về giá trị MỚI NHẤT tại thời điểm gọi, kể cả sau nhiều lần `set` liên tiếp",
        en: "`get(key)` always returns the LATEST value at call time, even after several consecutive `set` calls",
      },
      {
        vi: "Cấu trúc dùng được bên trong một vòng lặp requestAnimationFrame mà không gây re-render mỗi frame",
        en: "The structure works inside a requestAnimationFrame loop without causing a re-render every frame",
      },
    ],
  },
];
