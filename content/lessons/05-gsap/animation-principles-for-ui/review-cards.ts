import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "reduced-motion-shrinks-not-deletes",
    q: {
      vi: "Người dùng bật `prefers-reduced-motion`. Chuyển cảnh bay xa và phản hồi khi bấm nút nên xử lý thế nào?",
      en: "A user has `prefers-reduced-motion` on. How should a far-flying page transition and a button-press response be handled?",
    },
    a: {
      vi: "Bỏ chuyển động lớn không cần thiết như parallax hay chuyển cảnh bay xa, nhưng giữ tín hiệu trạng thái — nút vẫn cần phản hồi, chỉ nhỏ và ngắn hơn. Với người bị rối loạn tiền đình, chuyển động lớn có thể gây chóng mặt, buồn nôn thật.",
      en: "Drop large, unnecessary motion such as parallax or far-flying transitions, but keep the state signals — the button still needs feedback, just smaller and shorter. For people with vestibular disorders, large motion can cause real dizziness and nausea.",
    },
  },
  {
    id: "stagger-is-overlapping-action",
    q: {
      vi: "Vì sao một nhóm thẻ vào màn hình lệch nhau vài chục mili-giây trông “sống” hơn cả nhóm vào cùng lúc — đó là nguyên tắc hoạt hình nào?",
      en: "Why does a group of cards entering a few dozen milliseconds apart look more “alive” than the group entering at once — which animation principle is that?",
    },
    a: {
      vi: "Overlapping action: các bộ phận của một chuyển động thật không bắt đầu và dừng cùng lúc mà lệch pha nhau. `stagger` chính là cách tạo độ lệch đó giữa các phần tử.",
      en: "Overlapping action: the parts of a real movement do not start and stop together but out of phase. `stagger` is how you create that offset between elements.",
    },
  },
];
