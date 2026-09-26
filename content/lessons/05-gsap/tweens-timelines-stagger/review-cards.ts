import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "stagger-each-vs-amount",
    q: {
      vi: "Một danh sách 10 phần tử dùng `stagger: 0.1`. Tăng lên 20 phần tử thì tổng thời lượng đổi thế nào — và nếu dùng `stagger: { amount: 1 }` thì sao?",
      en: "A list of 10 elements uses `stagger: 0.1`. Growing it to 20, how does the total duration change — and what if it used `stagger: { amount: 1 }`?",
    },
    a: {
      vi: "Với số `0.1` (tức `each`), khoảng trễ giữa hai phần tử cố định, nên cả chuỗi dài thêm 1 giây: $(n-1) \\cdot 0.1$ đi từ 0.9 lên 1.9. Với `amount: 1`, tổng dải stagger giữ đúng 1 giây, còn khoảng trễ mỗi phần tử co lại — hiệu ứng dồn sát nhau hơn.",
      en: "With the number `0.1` (that is, `each`) the gap between elements is fixed, so the sequence grows by 1 second: $(n-1) \\cdot 0.1$ goes from 0.9 to 1.9. With `amount: 1` the whole stagger spread stays at 1 second and each gap shrinks — the effect bunches up.",
    },
  },
  {
    id: "position-parameter-not-delay",
    q: {
      vi: "Ba tween nối nhau bằng `delay: 0`, `delay: 1`, `delay: 2`. Bạn tăng duration của tween đầu từ 1 lên 1.5 giây. Chuyện gì xảy ra, và timeline tránh việc này thế nào?",
      en: "Three tweens are chained with `delay: 0`, `delay: 1`, `delay: 2`. You raise the first tween's duration from 1 to 1.5 seconds. What happens, and how does a timeline avoid it?",
    },
    a: {
      vi: "Tween thứ hai vẫn bắt đầu ở giây 1 nên chồng lên tween đầu, và mọi `delay` phía sau phải tính lại bằng tay. Trong timeline, vị trí tính tương đối — mặc định nối tiếp, hoặc `\"<\"`, `\"-=0.2\"`, label — nên sửa một bước là các bước sau tự dồn lại đúng.",
      en: "The second tween still starts at 1 second, so it overlaps the first, and every later `delay` must be recomputed by hand. In a timeline, positions are relative — sequential by default, or `\"<\"`, `\"-=0.2\"`, labels — so editing one step makes the later ones shift correctly by themselves.",
    },
  },
];
