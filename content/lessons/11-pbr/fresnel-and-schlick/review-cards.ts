import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "metal-f0-is-rgb",
    q: {
      vi: "Vì sao $F_0$ của kim loại là ba số (R, G, B), còn của điện môi thường chỉ cần một số?",
      en: "Why is a metal's $F_0$ three numbers (R, G, B), while a dielectric usually needs just one?",
    },
    a: {
      vi: "Kim loại có IOR phức, thay đổi theo bước sóng, nên độ phản xạ ở góc vuông khác nhau theo từng kênh màu — vàng phản xạ đỏ nhiều hơn lam. Real-time PBR đo $F_0$ trên mẫu thật và lưu thành bộ RGB. Điện môi phản xạ gần như đều giữa các kênh ở góc vuông, nên một số (mặc định $0.04$) là đủ.",
      en: "Metals have a complex IOR that varies per wavelength, so reflectance at normal incidence differs per color channel — gold reflects more red than blue. Real-time PBR measures $F_0$ off real samples and stores it as an RGB triple. Dielectrics reflect nearly evenly across channels head-on, so one number (default $0.04$) is enough.",
    },
  },
  {
    id: "why-fifth-power",
    q: {
      vi: "Vì sao công thức Schlick dùng mũ 5, không phải 2 hay 3?",
      en: "Why does Schlick's formula use a power of 5 rather than 2 or 3?",
    },
    a: {
      vi: "Đó là một phép khớp đường cong theo thực nghiệm. Vì $1 - \\cos\\theta$ nằm trong $[0, 1]$, số mũ càng thấp cho giá trị càng LỚN ở mọi góc: mũ 2 đã lên $F \\approx 0.28$ ở 60° và $\\approx 0.70$ ở 80°, trong khi đường chính xác với $n = 1.5$ chỉ $\\approx 0.09$ và $\\approx 0.39$. Mũ 5 giữ $F$ sát $F_0$ tới gần góc sượt rồi mới vọt lên 1 ở 90°, lệch đường chính xác không quá khoảng $0.04$.",
      en: "It's an empirical fit to the exact dielectric Fresnel curve. Since $1 - \\cos\\theta$ lies in $[0, 1]$, a lower exponent gives a LARGER value at every angle: power 2 already reaches $F \\approx 0.28$ at 60° and $\\approx 0.70$ at 80°, where the exact curve for $n = 1.5$ is only $\\approx 0.09$ and $\\approx 0.39$. Power 5 keeps $F$ near $F_0$ until close to grazing, then rises to 1 at 90°, staying within about $0.04$ of the exact curve.",
    },
  },
  {
    id: "clamp-before-pow",
    q: {
      vi: "Trong `schlickFresnel`, phép `clamp(1.0 - cosTheta, 0.0, 1.0)` chặn hai trường hợp hỏng nào?",
      en: "In `schlickFresnel`, which two failure cases does `clamp(1.0 - cosTheta, 0.0, 1.0)` guard against?",
    },
    a: {
      vi: "$\\cos\\theta$ âm (ở rìa silhouette, hay normal nội suy trên mesh ít polygon) đẩy cơ số vượt 1, và `pow` trả về $F > 1$ — phản xạ hơn 100%. $\\cos\\theta$ lớn hơn 1 (vector chưa chuẩn hoá) làm cơ số âm, mà GLSL để `pow` với cơ số âm là không xác định. Kẹp vào $[0, 1]$ loại cả hai.",
      en: "A negative $\\cos\\theta$ (at silhouette edges, or with interpolated normals on a low-poly mesh) pushes the base above 1, and `pow` returns $F > 1$ — more than 100% reflectance. A $\\cos\\theta$ above 1 (unnormalized vectors) makes the base negative, and GLSL leaves `pow` of a negative base undefined. Clamping to $[0, 1]$ rules out both.",
    },
  },
];
