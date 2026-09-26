import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "register-decoder-before-load",
    q: {
      vi: "Một file glTF nén Draco làm `GLTFLoader` báo lỗi “No DRACOLoader instance provided” qua `onError`. Thiếu gì, và phải làm vào lúc nào?",
      en: "A Draco-compressed glTF makes `GLTFLoader` report “No DRACOLoader instance provided” through `onError`. What is missing, and when must it be done?",
    },
    a: {
      vi: "`loader.setDRACOLoader(dracoLoader)`. Decoder phải có mặt trước khi bước parse bắt đầu, nên quy ước an toàn là gắn nó trước lần `load()` đầu tiên (với meshopt là `setMeshoptDecoder`).",
      en: "`loader.setDRACOLoader(dracoLoader)`. The decoder has to be in place before parsing starts, so the safe convention is to attach it before the first `load()` (for meshopt, `setMeshoptDecoder`).",
    },
  },
  {
    id: "strict-mode-double-load",
    q: {
      vi: "Trong React Strict Mode, một effect gọi `loader.load(url, onLoad)` mà không có cleanup, và ở bản dev scene có hai bản model chồng khít lên nhau. Vì sao, và sửa thế nào?",
      en: "Under React Strict Mode, an effect calls `loader.load(url, onLoad)` with no cleanup, and in development the scene ends up with two exactly overlapping copies of the model. Why, and how do you fix it?",
    },
    a: {
      vi: "Strict Mode chạy effect hai lần khi mount (mount, cleanup, mount lại), nên có hai request và cả hai `onLoad` đều thêm model vào scene. Đặt cờ `cancelled` trong cleanup để `onLoad` của lần trước bỏ qua kết quả.",
      en: "Strict Mode runs effects twice on mount (mount, cleanup, mount again), so there are two requests and both `onLoad` calls add the model to the scene. Set a `cancelled` flag in the cleanup so the earlier `onLoad` discards its result.",
    },
  },
];
