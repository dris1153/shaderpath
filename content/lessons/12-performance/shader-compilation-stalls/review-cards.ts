import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "lazy-compile-hitch",
    q: {
      vi: "Cảnh đang mượt thì khựng một nhịp đúng lúc một vật mới xuất hiện, và đó không phải GC. Vì sao?",
      en: "A smooth scene hitches for one beat right as a new object appears, and it isn't the GC. Why?",
    },
    a: {
      vi: "Three compile và link shader program một cách lười: đúng lần đầu program đó được dùng để vẽ, không phải lúc bạn `new` material. `getProgram()` chạy trong đường render, nên chi phí compile rơi vào đúng frame đang vẽ, trên main thread.",
      en: "Three compiles and links shader programs lazily: the first time a program is needed to draw, not when you `new` the material. `getProgram()` runs inside the render path, so the compile cost lands on the frame being drawn, on the main thread.",
    },
  },
  {
    id: "compile-moves-the-cost",
    q: {
      vi: "`renderer.compile(scene, camera)` làm gì với chi phí compile, và vì thế nên gọi nó lúc nào?",
      en: "What does `renderer.compile(scene, camera)` do to the compile cost, and so when should you call it?",
    },
    a: {
      vi: "Nó không xoá chi phí mà dời nó tới thời điểm bạn chọn: duyệt cả scene và dựng program cho mọi material ngay trong lời gọi. Gọi sau khi asset tải xong, trước khi hiện cảnh (sau màn hình loading). Gọi giữa lúc người dùng đang tương tác thì vẫn khựng, có khi nặng hơn vì nhiều biến thể dựng cùng lúc.",
      en: "It doesn't erase the cost, it moves it to a moment you choose: it walks the whole scene and builds programs for every material inside that one call. Call it after assets finish loading and before the scene is shown (behind the loading screen). Called mid-interaction it still hitches, sometimes worse, since several variants get built at once.",
    },
  },
  {
    id: "compile-async-needs-parallel-extension",
    q: {
      vi: "`await renderer.compileAsync(scene, camera)` gỡ được phần nào của việc compile khỏi main thread, và với điều kiện gì?",
      en: "Which part of compiling does `await renderer.compileAsync(scene, camera)` take off the main thread, and under what condition?",
    },
    a: {
      vi: "Chỉ phần việc của driver, và chỉ khi có extension `KHR_parallel_shader_compile`: driver compile/link ở luồng khác, còn three hỏi `program.isReady()` mỗi 10ms cho tới khi xong. Lời gọi `compile()` bên trong vẫn chạy trên main thread — dựng source từng program, gọi `compileShader`/`linkProgram`. Không có extension, three coi mọi program là sẵn sàng ngay và resolve sau một timer 10ms, nên promise không hứa gì hơn `compile()` thường.",
      en: "Only the driver's part, and only when the `KHR_parallel_shader_compile` extension is available: the driver compiles/links on another thread while three polls `program.isReady()` every 10 ms until done. The `compile()` call inside still runs on the main thread — building each program's source and issuing `compileShader`/`linkProgram`. Without the extension, three treats every program as ready and resolves after one 10 ms timer, so the promise guarantees nothing beyond plain `compile()`.",
    },
  },
  {
    id: "white-texture-instead-of-null-map",
    q: {
      vi: "Để bật/tắt texture của một material mà không sinh biến thể shader mới, vì sao gán một texture trắng 1×1 thay vì đổi `material.map` giữa `null` và texture?",
      en: "To toggle a material's texture without spawning a new shader variant, why assign a 1×1 white texture instead of switching `material.map` between `null` and a texture?",
    },
    a: {
      vi: "Có hay không có `map` là define `USE_MAP` trong cache key: `null` và có texture là hai program khác nhau, mỗi cái phải compile lần đầu nó được vẽ — và three chỉ nhận ra thay đổi khi bạn đặt `material.needsUpdate = true`. Texture trắng 1×1 giữ `map` luôn tồn tại: define không đổi, chỉ nội dung được lấy mẫu thay đổi.",
      en: "Whether `map` exists is the `USE_MAP` define in the cache key: `null` and a texture are two different programs, each compiled the first time it draws — and three only notices the switch once you set `material.needsUpdate = true`. A 1×1 white texture keeps `map` always present: the define never changes, only the sampled content does.",
    },
  },
];
