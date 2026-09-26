import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "raw-webgl-for-fullscreen-shader",
    q: {
      vi: "Dự án chỉ cần một shader full-screen kiểu Shadertoy. Vì sao WebGL thuần có thể hợp hơn three.js ở đây?",
      en: "A project needs only one full-screen Shadertoy-style shader. Why might raw WebGL suit it better than three.js?",
    },
    a: {
      vi: "Không cần scene graph, loader hay đèn — chỉ một quad và một fragment shader, còn three.js thêm khoảng 150–600KB runtime cho những thứ không dùng. Ngoài các trường hợp kiểu này, three.js gần như luôn hợp lý hơn.",
      en: "It needs no scene graph, loaders or lights — just a quad and a fragment shader, while three.js adds roughly 150–600KB of runtime you would not use. Outside cases like this, three.js is almost always the better choice.",
    },
  },
  {
    id: "getcontext-null",
    q: {
      vi: "`canvas.getContext('webgl2')` trên một máy cũ trả về `null`, và code gọi tiếp `gl.createBuffer()`. Người dùng thấy gì, và nên làm gì thay vào đó?",
      en: "On an old device `canvas.getContext('webgl2')` returns `null`, and the code goes on to call `gl.createBuffer()`. What does the user see, and what should happen instead?",
    },
    a: {
      vi: "Một lỗi runtime mơ hồ kiểu “cannot read properties of null”, canvas trống và phần code sau đó không chạy — thay vì một lời giải thích. Kiểm tra `null` ngay sau `getContext` rồi báo cho người dùng hoặc chuyển sang phương án dự phòng — vẫn còn vài phần trăm thiết bị không có WebGL2.",
      en: "A vague runtime error along the lines of “cannot read properties of null”, an empty canvas and none of the later code running — instead of an explanation. Check for `null` right after `getContext`, then tell the user or fall back — a few percent of devices still lack WebGL2.",
    },
  },
];
