import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "dispose-just-dispatches-an-event",
    q: {
      vi: "`texture.dispose()` thực sự làm gì, và vì sao gọi nó trên một texture chưa từng được render là an toàn?",
      en: "What does `texture.dispose()` actually do, and why is calling it on a texture that was never rendered safe?",
    },
    a: {
      vi: "Nó chỉ phát sự kiện `'dispose'`. Việc xoá thật nằm trong các manager của `WebGLRenderer`: lần đầu object được render, manager gắn một listener, và listener đó gọi `gl.deleteTexture`/`gl.deleteBuffer` rồi xoá mục trong `WebGLProperties`. Chưa render thì chưa có listener nên dispose là no-op; dùng lại sau khi dispose thì three upload lại từ đầu.",
      en: "It only dispatches a `'dispose'` event. The real cleanup lives in `WebGLRenderer`'s managers: the first time an object renders, a manager attaches a listener, and that listener calls `gl.deleteTexture`/`gl.deleteBuffer` and drops the `WebGLProperties` entry. Never rendered means no listener, so dispose is a no-op; reuse it after disposing and three re-uploads from scratch.",
    },
  },
  {
    id: "what-r3f-disposes",
    q: {
      vi: "R3F tự dispose những object nào khi component unmount, và những object nào vẫn là việc của bạn?",
      en: "Which objects does R3F dispose on its own when a component unmounts, and which are still your job?",
    },
    a: {
      vi: "Object do chính reconciler R3F tạo từ thẻ JSX (`<boxGeometry />`…) được dispose khi unmount; tắt bằng `dispose={null}` nếu nó được dùng chung. Object bạn tự `new` rồi gắn qua `<primitive object={...} />`, tạo trong `useEffect`/`useMemo`, hay render target tự tạo — R3F không theo dõi, bạn phải tự dispose (ví dụ qua `useDisposable`).",
      en: "Objects R3F's own reconciler built from JSX tags (`<boxGeometry />`…) get disposed on unmount; opt out with `dispose={null}` when they're shared. Anything you `new` yourself and attach via `<primitive object={...} />`, build in `useEffect`/`useMemo`, or a hand-made render target — R3F never tracks it, so you dispose it (say, through `useDisposable`).",
    },
  },
  {
    id: "leaks-show-across-cycles",
    q: {
      vi: "Làm sao xác nhận một component rò bộ nhớ GPU bằng `renderer.info`, và vì sao thử một lần là không đủ?",
      en: "How do you confirm a component leaks GPU memory using `renderer.info`, and why isn't one try enough?",
    },
    a: {
      vi: "Mount rồi unmount nhiều vòng, đọc `info.memory.geometries`/`.textures` liên tục: component đúng đưa cả hai về cùng mức nền sau mỗi vòng. Rò rỉ chỉ lộ ra khi các vòng cộng dồn — một lần mount/unmount gần như luôn \"trông ổn\". Số liệu đã xác nhận rồi thì dùng Heap Snapshot chế độ Comparison và cây Retainers để tìm ai còn giữ tham chiếu.",
      en: "Mount and unmount it over many cycles, reading `info.memory.geometries`/`.textures` continuously: a correct component brings both back to the same baseline after every cycle. A leak only shows as cycles accumulate — a single mount/unmount almost always \"looks fine\". Once the numbers confirm it, use a Heap Snapshot in Comparison mode and the Retainers tree to find who still holds a reference.",
    },
  },
];
