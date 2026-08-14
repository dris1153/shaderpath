import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "webgl2fundamentals-gpgpu",
    type: "article",
    title: "WebGL2 GPGPU",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html",
    note: {
      vi: "Giải thích chính xác thủ thuật 'texture là mảng, fragment shader là hàm cập nhật' bằng WebGL2 thuần — cùng ý tưởng bài này trình bày, nhưng viết trực tiếp bằng lệnh gọi GL thật.",
      en: "Explains the exact 'texture as array, fragment shader as update function' trick in raw WebGL2 — the same idea this lesson covers, written as real GL calls instead of hand-waving.",
    },
  },
  {
    id: "threejs-bufferattribute-needsupdate",
    type: "spec",
    title: "Three.js Docs — BufferAttribute.needsUpdate",
    url: "https://threejs.org/docs/#api/en/core/BufferAttribute.needsUpdate",
    note: {
      vi: "Tài liệu chính thức của đúng cơ chế nằm ở trung tâm vòng lặp CPU trong bài này — đọc để thấy needsUpdate chỉ là một cờ boolean, không phải một API thông minh tự phát hiện thay đổi.",
      en: "The official documentation for the exact mechanism at the center of this lesson's CPU loop — read it to see needsUpdate is just a boolean flag, not some smart change-detection API.",
    },
  },
  {
    id: "threejs-gpgpu-birds-example",
    type: "repo",
    title: "three.js webgl — gpgpu — flocking (birds)",
    authors: ["mrdoob and contributors"],
    url: "https://threejs.org/examples/webgl_gpgpu_birds.html",
    note: {
      vi: "Ví dụ chính thức chứng minh phép đảo GPGPU của bài này là kỹ thuật có thật, chạy production — đáng xem trước khi track đi sâu vào cách dựng nó ở các bài sau.",
      en: "The official example proving this lesson's GPGPU inversion is a real, production-running technique — worth a look before the track digs into building it in later lessons.",
    },
  },
  {
    id: "mdn-performance-now",
    type: "article",
    title: "Performance: now() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Performance/now",
    note: {
      vi: "API dùng để đo chi phí JS thực tế của vòng lặp CPU (như trong demo của bài) — độ chính xác dưới mili-giây, không bị ảnh hưởng bởi việc chỉnh giờ hệ thống.",
      en: "The API used to actually measure the JS cost of a CPU loop (as in this lesson's demo) — sub-millisecond precision, unaffected by system clock adjustments.",
    },
  },
];
