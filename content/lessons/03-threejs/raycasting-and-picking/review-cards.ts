import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "raycast-a-pickable-list",
    q: {
      vi: "Mỗi `pointermove` gọi `raycaster.intersectObjects(scene.children, true)`. Scene lớn dần thì chuyện gì xảy ra, và nên truyền gì vào?",
      en: "Every `pointermove` calls `raycaster.intersectObjects(scene.children, true)`. What happens as the scene grows, and what should be passed in?",
    },
    a: {
      vi: "Ngày càng lag: mỗi lần raycast phải duyệt cả helper và mọi mesh trang trí không cần tương tác — và chúng còn có thể chặn mất hit của thứ bạn muốn chọn. Truyền một mảng `pickables` chỉ gồm những thứ thật sự chọn được.",
      en: "It lags more and more: every raycast also walks helpers and every decorative mesh that needs no interaction — and they can even steal the hit from what you meant to pick. Pass a `pickables` array holding only what can actually be picked.",
    },
  },
  {
    id: "points-threshold",
    q: {
      vi: "Click vào một point cloud hầu như không bao giờ trúng (hoặc trúng lung tung). Vì sao, và chỉnh gì?",
      en: "Clicking a point cloud almost never hits (or hits almost anything). Why, and what do you adjust?",
    },
    a: {
      vi: "Điểm không có bề mặt để tia “chạm” vào; raycaster coi một điểm là trúng khi tia đi qua gần nó hơn `raycaster.params.Points.threshold`, tính bằng đơn vị world. Mặc định là 1, có thể quá nhỏ hoặc quá lớn so với tỉ lệ scene — đặt cho khớp.",
      en: "Points have no surface for a ray to “touch”; the raycaster counts a point as hit when the ray passes closer to it than `raycaster.params.Points.threshold`, in world units. The default is 1, which may be far too small or too large for the scene's scale — set it to match.",
    },
  },
];
