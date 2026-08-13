import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "eberly-euler-angle-formulas",
    type: "paper",
    title: "Euler Angle Formulas",
    authors: ["David Eberly"],
    url: "https://www.geometrictools.com/Documentation/EulerAngles.pdf",
    note: {
      vi: "Bảng công thức đầy đủ cho cả 12 order Euler (6 Tait-Bryan như XYZ, 6 Euler cổ điển như ZXZ) kèm chứng minh — tra khi cần order khác XYZ mà bài này không đi sâu.",
      en: "The complete formula table for all 12 Euler orders (6 Tait-Bryan like XYZ, 6 classic Euler like ZXZ) with derivations — the reference to reach for when you need an order this lesson doesn't cover in depth.",
    },
  },
  {
    id: "threejs-docs-euler",
    type: "article",
    title: "Euler – three.js docs",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/math/Euler",
    note: {
      vi: "Nguồn xác nhận chính xác quy ước order mặc định 'XYZ' và ý nghĩa intrinsic của nó mà bài này dùng xuyên suốt — đọc để thấy đúng API sẽ gõ ở Track 3.",
      en: "The authoritative source confirming the default 'XYZ' order and its intrinsic meaning, used throughout this lesson — read it to see the exact API you'll type in Track 3.",
    },
  },
  {
    id: "wikipedia-gimbal-lock",
    type: "article",
    title: "Gimbal lock",
    url: "https://en.wikipedia.org/wiki/Gimbal_lock",
    note: {
      vi: "Nền tảng lịch sử và trực quan cơ khí của gimbal lock (kể cả sự cố nổi tiếng trên tàu Apollo) — bổ sung góc nhìn vật lý cho phần chứng minh bằng ma trận ở trên.",
      en: "The historical and mechanical intuition behind gimbal lock (including the well-known Apollo incident) — a physical-world companion to the matrix-based proof above.",
    },
  },
];
