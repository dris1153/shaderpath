import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "suspense-lifecycle-order",
    kind: "concept",
    prompt: {
      vi: `Một component gọi \`useGLTF("/scene.glb")\` lần ĐẦU TIÊN, nằm bên trong \`<Suspense fallback={<Placeholder />}>\`. Liệt kê ĐÚNG THỨ TỰ những gì xảy ra, từ lần render đầu tiên tới khi model hiện lên màn hình — cụ thể: component có "return sớm" một giá trị rỗng không, hay làm gì khác; ai là người quyết định hiện \`fallback\`; và điều gì kích hoạt lần render thứ hai.

Sau đó giải thích: nếu component NÀY MOUNT LẦN NỮA ở một chỗ khác trong cây, với ĐÚNG url đó, khác biệt gì so với lần đầu — và tại sao.`,
      en: `A component calls \`useGLTF("/scene.glb")\` for the FIRST TIME, nested inside \`<Suspense fallback={<Placeholder />}>\`. List the CORRECT ORDER of what happens, from the first render attempt to the model appearing on screen — specifically: does the component "return early" with some empty value, or something else entirely; who decides to show \`fallback\`; and what triggers the second render attempt.

Then explain: if this SAME component mounts AGAIN somewhere else in the tree, with the EXACT same url, what's different from the first time — and why.`,
    },
    hints: [
      {
        vi: "`useGLTF`/`useLoader` không return sớm một giá trị rỗng khi đang tải — nó THROW. Cái được throw ra là gì, chính xác?",
        en: "`useGLTF`/`useLoader` don't return early with an empty value while loading — they THROW. What exactly gets thrown?",
      },
      {
        vi: "Lần thứ hai, tra cứu dùng đúng cache key [loader, url] — nếu cache đã có giá trị RESOLVED (không còn là Promise), hook hoạt động y hệt một hook đồng bộ bình thường.",
        en: "The second time, the lookup uses the exact same [loader, url] cache key — if the cache already holds a RESOLVED value (no longer a Promise), the hook behaves like an ordinary synchronous hook.",
      },
    ],
    checklist: [
      {
        vi: "Nêu đúng: lần render đầu, component gọi loader, nhận về Promise đang pending, và THROW promise đó (không phải return)",
        en: "Correctly states: on the first render, the component calls the loader, gets back a pending Promise, and THROWS it (not returns it)",
      },
      {
        vi: "Nêu đúng: React bắt throw ở Suspense boundary gần nhất, hiện fallback, và tự nhớ để thử lại subtree đó",
        en: "Correctly states: React catches the throw at the nearest Suspense boundary, shows fallback, and remembers to retry that subtree",
      },
      {
        vi: "Nêu đúng: Promise resolve kích hoạt React render lại đúng subtree đó — lần này cache đã có data, hook trả về giá trị thật, fallback biến mất",
        en: "Correctly states: the Promise resolving triggers React to re-render that exact subtree — this time the cache holds the data, the hook returns the real value, fallback disappears",
      },
      {
        vi: "Nêu đúng khác biệt lần mount thứ hai: cache hit ngay từ đầu — không throw, không fallback, trả về đồng bộ",
        en: "Correctly states the difference on the second mount: an immediate cache hit — no throw, no fallback, synchronous return",
      },
    ],
  },
  {
    id: "build-delayed-loader",
    kind: "code",
    prompt: {
      vi: `Viết một \`THREE.Loader\` tối giản tên \`DelayedLoader<T>\`, mô phỏng độ trễ mạng mà KHÔNG cần asset thật — dùng trực tiếp được với \`useLoader\` của R3F. Constructor nhận một hàm \`build: () => T\` (tạo dữ liệu) và \`delayMs\`; \`.load(url, onLoad, onProgress, onError)\` phải gọi \`onLoad(build())\` sau đúng \`delayMs\`, và gọi \`onError\` nếu \`build()\` throw — không được để lỗi rơi ra ngoài \`setTimeout\` (JS sẽ nuốt mất, không ai bắt được).`,
      en: `Write a minimal \`THREE.Loader\` called \`DelayedLoader<T>\` that simulates network latency WITHOUT any real asset — usable directly with R3F's \`useLoader\`. The constructor takes a \`build: () => T\` function (produces the data) and \`delayMs\`; \`.load(url, onLoad, onProgress, onError)\` must call \`onLoad(build())\` after exactly \`delayMs\`, and call \`onError\` if \`build()\` throws — the error must never escape the \`setTimeout\` (JS would silently swallow it, and nothing would ever catch it).`,
    },
    starterCode: `import * as THREE from "three";

class DelayedLoader<T> extends THREE.Loader<T> {
  constructor(
    private readonly build: () => T,
    private readonly delayMs: number,
  ) {
    super();
  }

  load(
    url: string,
    onLoad: (data: T) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ) {
    // TODO: setTimeout(delayMs), gọi build() bên trong try/catch,
    // onLoad(...) khi thành công, onError(...) khi build() throw
  }
}`,
    solutionCode: `import * as THREE from "three";

class DelayedLoader<T> extends THREE.Loader<T> {
  constructor(
    private readonly build: () => T,
    private readonly delayMs: number,
  ) {
    super();
  }

  load(
    url: string,
    onLoad: (data: T) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ) {
    setTimeout(() => {
      try {
        onLoad(this.build());
      } catch (err) {
        onError?.(err);
      }
    }, this.delayMs);
  }
}

// Constructor cần "build" + "delayMs" nên useLoader không thể tự "new" nó
// (useLoader chỉ new Proto() KHÔNG tham số khi bạn truyền một class) — tạo
// MỘT instance ở module scope rồi truyền instance đó vào useLoader:
const exhibitLoader = new DelayedLoader(
  () => new THREE.IcosahedronGeometry(0.9, 1),
  1500,
);
// const geometry = useLoader(exhibitLoader, "exhibit://demo");`,
    hints: [
      {
        vi: "`THREE.Loader.load` không có dạng async/await trong signature — bốn tham số cố định (url, onLoad, onProgress, onError), phải dùng callback qua setTimeout.",
        en: "`THREE.Loader.load` has no async/await in its signature — four fixed parameters (url, onLoad, onProgress, onError), you have to use a setTimeout callback.",
      },
      {
        vi: "`build()` có thể throw. Nếu không bọc try/catch, lỗi văng ra bên trong callback của setTimeout — không có gì bắt được nó, `onError` sẽ không bao giờ chạy.",
        en: "`build()` can throw. Without a try/catch, the error escapes inside the setTimeout callback — nothing catches it, `onError` never runs.",
      },
    ],
    checklist: [
      {
        vi: "`.load()` gọi `onLoad` sau đúng khoảng `delayMs`, không đồng bộ (không gọi ngay lập tức)",
        en: "`.load()` calls `onLoad` after exactly `delayMs`, asynchronously (never called synchronously/immediately)",
      },
      {
        vi: "Lỗi từ `build()` được bắt bằng try/catch và chuyển vào `onError`, không làm rơi exception ra ngoài setTimeout",
        en: "Errors from `build()` are caught with try/catch and routed to `onError`, never escaping the setTimeout as an uncaught exception",
      },
      {
        vi: "Class dùng được trực tiếp với `useLoader` bằng cách tạo MỘT instance ở module scope, không tạo instance mới mỗi lần component render",
        en: "The class works directly with `useLoader` by creating ONE instance at module scope, never a fresh instance on every component render",
      },
    ],
  },
];
