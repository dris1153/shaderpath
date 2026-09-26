import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "over-relaxation-holes",
    q: {
      vi: "Over-relaxation bước $\\omega \\cdot d(p)$ với $\\omega = 1.8$. Phần lớn cảnh vẫn đúng, nhưng xuất hiện vết lõm và lỗ ở chỗ hình học mỏng và ở cạnh. Vì sao lại ở đó?",
      en: "Over-relaxation steps by $\\omega \\cdot d(p)$ with $\\omega = 1.8$. Most of the scene still looks right, but dents and holes appear at thin features and edges. Why there?",
    },
    a: {
      vi: "Một bước dài hơn $d(p)$ ra khỏi quả cầu an toàn, nên quả cầu của mẫu kế tiếp có thể không còn phủ đoạn vừa nhảy qua. Ở chỗ hình học mỏng, cả bề mặt có thể nằm gọn trong đoạn không được phủ đó và vòng march xuyên qua luôn. Vì vậy kỹ thuật này cần bước lùi khi các quả cầu thôi chồng lên nhau.",
      en: "A step longer than $d(p)$ leaves the safe sphere, so the next sample's sphere may no longer cover the stretch just jumped. Where the geometry is thin, the whole surface can sit inside that uncovered stretch and the march passes clean through it. That is why the technique needs a step-back once the spheres stop overlapping.",
    },
  },
  {
    id: "epsilon-grows-with-distance",
    q: {
      vi: "Vì sao cho ngưỡng chạm lớn dần theo khoảng cách, `eps = 0.001 * max(t, 1.0)`, thay vì giữ cố định?",
      en: "Why scale the hit threshold with distance, `eps = 0.001 * max(t, 1.0)`, instead of keeping it fixed?",
    },
    a: {
      vi: "Càng nhìn xa, một pixel phủ càng nhiều không gian thế giới. $\\varepsilon$ nhỏ cố định buộc tia ở xa hội tụ tới độ chính xác nhỏ hơn hẳn một pixel — thêm bước mà không đổi màu nào, và ở silhouette có thể tiêu hết ngân sách bước. Cho $\\varepsilon$ tăng theo $t$ thì mỗi tia dừng ở độ chính xác cỡ một pixel.",
      en: "A pixel covers more world space the farther away it looks. A fixed small $\\varepsilon$ makes distant rays converge to a precision far below one pixel — extra steps that change no color, and at silhouettes they can exhaust the step budget. Growing $\\varepsilon$ with $t$ stops each ray at roughly pixel precision.",
    },
  },
];
