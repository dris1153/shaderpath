import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "swapping-geometry-leaks",
    q: {
      vi: "Mỗi lần kéo slider, code gán `mesh.geometry = new THREE.SphereGeometry(r, 32, 16)`. Sau vài trăm lần kéo, VRAM ra sao, và vì sao?",
      en: "Every slider drag runs `mesh.geometry = new THREE.SphereGeometry(r, 32, 16)`. After a few hundred drags, what happens to VRAM, and why?",
    },
    a: {
      vi: "Tăng dần. Gán geometry mới chỉ đổi tham chiếu JavaScript; buffer WebGL của geometry cũ vẫn nằm trong VRAM cho tới khi bạn gọi `dispose()` trên nó. Giữ tham chiếu cũ và dispose trước khi gán cái mới.",
      en: "It keeps growing. Assigning a new geometry only changes a JavaScript reference; the old geometry's WebGL buffers stay in VRAM until you call `dispose()` on it. Keep the old reference and dispose it before assigning the new one.",
    },
  },
  {
    id: "index-needs-identical-vertices",
    q: {
      vi: "Một hình chóp dựng từ các mặt tam giác rời, mỗi mặt có normal riêng. Thêm `setIndex()` có tiết kiệm được đáng kể không, và vì sao?",
      en: "A pyramid is built from separate triangular faces, each with its own normal. Does adding `setIndex()` save much, and why?",
    },
    a: {
      vi: "Gần như không. Index chỉ gộp được những đỉnh giống hệt nhau ở mọi attribute; một góc nằm giữa hai mặt có normal khác nhau là hai entry khác nhau. Index có lợi khi nhiều tam giác chia sẻ đỉnh giống hệt, như các ô trên cùng một mặt phẳng.",
      en: "Hardly. An index can only merge vertices that are identical in every attribute; a corner shared by two faces with different normals is two different entries. Indexing pays off when many triangles share identical vertices, like the cells of one flat face.",
    },
  },
];
