import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "tsl-entry-points",
    q: {
      vi: "Bạn viết `import { uniform } from \"three\"` để dùng TSL, và bị lỗi. Vì sao?",
      en: "You write `import { uniform } from \"three\"` to use TSL, and it fails. Why?",
    },
    a: {
      vi: "`uniform` không nằm trong entry `three`: TSL và WebGPU là các entry point riêng khai báo trong `exports` của gói — `three/tsl` và `three/webgpu` — và core không re-export gì từ chúng. Import `uniform` từ `three/tsl`.",
      en: "`uniform` is not part of the `three` entry: TSL and WebGPU are separate entry points declared in the package's `exports` — `three/tsl` and `three/webgpu` — and the core re-exports nothing from them. Import `uniform` from `three/tsl`.",
    },
  },
  {
    id: "await-renderer-init",
    q: {
      vi: "Bạn tạo `new WebGPURenderer()` rồi gọi `renderer.render(scene, camera)` ngay dòng sau, và nó ném lỗi. Vì sao, và sửa thế nào?",
      en: "You create `new WebGPURenderer()` and call `renderer.render(scene, camera)` on the very next line, and it throws. Why, and what is the fix?",
    },
    a: {
      vi: "Backend của `WebGPURenderer` khởi tạo bất đồng bộ, nên gọi `render()` trước khi nó sẵn sàng là lỗi — thông báo lỗi nói luôn cách sửa. `await renderer.init()` trước lần render đầu tiên.",
      en: "`WebGPURenderer` initializes its backend asynchronously, so calling `render()` before it is ready throws — and the error message names the fix. `await renderer.init()` before the first render.",
    },
  },
];
