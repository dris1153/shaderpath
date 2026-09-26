import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "no-dom-fallback-in-canvas",
    q: {
      vi: "`<Suspense fallback={<div>Loading…</div>}>` được đặt bên trong `<Canvas>`. Chuyện gì xảy ra, và fallback nên là gì?",
      en: "`<Suspense fallback={<div>Loading…</div>}>` is placed inside `<Canvas>`. What happens, and what should the fallback be?",
    },
    a: {
      vi: "Lỗi runtime ngay khi fallback được mount (lúc có component suspend): con trong cây R3F phải là object Three.js hợp lệ, còn `div` thì không. Dùng một mesh làm placeholder, hoặc bọc DOM trong `<Html>` của drei.",
      en: "A runtime error as soon as the fallback mounts (when something suspends): children in the R3F tree must be valid Three.js objects, and a `div` is not. Use a mesh as the placeholder, or wrap DOM in drei's `<Html>`.",
    },
  },
  {
    id: "suspense-does-not-catch-errors",
    q: {
      vi: "Một asset trả 404 bên trong `<Suspense>`. Suspense có hiện fallback mãi không, và điều gì thật sự xảy ra?",
      en: "An asset returns 404 inside `<Suspense>`. Does Suspense show the fallback forever, and what really happens?",
    },
    a: {
      vi: "Không: Suspense chỉ bắt promise đang chờ. Promise bị reject thì ở lần render kế loader ném lại lỗi đó như một Error thật, bay lên Error Boundary gần nhất (Canvas chuyển nó ra ngoài Canvas) — không có boundary nào thì React gỡ cả cây.",
      en: "No: Suspense only catches pending promises. When the promise rejects, the loader rethrows it as a real Error on the next render, which goes up to the nearest Error Boundary (the Canvas passes it outside the Canvas) — with no boundary at all, React unmounts the whole tree.",
    },
  },
  {
    id: "preload-cache-key",
    q: {
      vi: "Một chỗ gọi `useLoader.preload(GLTFLoader, url)`, còn component lại dùng `useLoader(myLoader, url)` với `myLoader` là instance tự tạo. Preload có tác dụng không, và vì sao?",
      en: "One place calls `useLoader.preload(GLTFLoader, url)`, while the component uses `useLoader(myLoader, url)` with `myLoader` an instance you created. Does the preload help, and why?",
    },
    a: {
      vi: "Không: cache key là cặp loader và URL, mà constructor `GLTFLoader` và instance `myLoader` là hai loader khác nhau — URL giống hệt cũng thành hai mục cache, và preload coi như chưa từng chạy. Dùng cùng một loader ở cả hai nơi.",
      en: "No: the cache key is the loader-and-URL pair, and the `GLTFLoader` constructor and the `myLoader` instance are different loaders — the same URL makes two cache entries, and the preload might as well not have run. Use the same loader in both places.",
    },
  },
];
