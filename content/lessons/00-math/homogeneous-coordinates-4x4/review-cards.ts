import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "origin-cannot-move",
    q: {
      vi: "Thử tìm một ma trận 3×3 dịch mọi điểm thêm $(5, 0, 0)$. Điểm gốc $(0, 0, 0)$ đi đâu dưới bất kỳ ma trận 3×3 nào, và điều đó nói gì?",
      en: "Try to find a 3×3 matrix that moves every point by $(5, 0, 0)$. Where does the origin $(0, 0, 0)$ go under any 3×3 matrix, and what does that tell you?",
    },
    a: {
      vi: "Đứng yên: $M \\cdot \\vec 0 = \\vec 0$ với mọi ma trận. Phép dịch lại cần đưa gốc tới $(5, 0, 0)$, nên không ma trận 3×3 nào làm được. Thêm chiều thứ tư với $w = 1$ cho translation một cột riêng để nhân vào.",
      en: "It stays put: $M \\cdot \\vec 0 = \\vec 0$ for every matrix. A translation must send the origin to $(5, 0, 0)$, so no 3×3 matrix can do it. A fourth coordinate with $w = 1$ gives translation its own column to multiply in.",
    },
  },
  {
    id: "normal-under-nonuniform-scale",
    q: {
      vi: "Quả cầu bị scale $(2, 1, 1)$. Biến đổi pháp tuyến bằng chính model matrix thì điều gì sai, và dùng ma trận nào mới đúng?",
      en: "A sphere is scaled by $(2, 1, 1)$. If its normals are transformed by the model matrix itself, what goes wrong, and which matrix is right?",
    },
    a: {
      vi: "Pháp tuyến bị kéo giãn cùng bề mặt nên không còn vuông góc với bề mặt đã bị ép dẹt, và ánh sáng tính sai. Dùng nghịch đảo chuyển vị (inverse-transpose) của phần 3×3. Scale đều thì không lộ, vì normalize lại là xong.",
      en: "The normals get stretched along with the surface, so they stop being perpendicular to the squashed surface and the lighting comes out wrong. Use the inverse-transpose of the 3×3 part. Uniform scale hides this, because normalizing again fixes it.",
    },
  },
  {
    id: "trs-order-orbit",
    q: {
      vi: "Object ở $(10, 0, 0)$ cần tự xoay tại chỗ quanh trục $y$, nhưng ma trận được ghép thành $R \\cdot T$. Nó chuyển động thế nào, và thứ tự đúng là gì?",
      en: "An object at $(10, 0, 0)$ should spin in place about $y$, but its matrix is composed as $R \\cdot T$. How does it move, and what is the right order?",
    },
    a: {
      vi: "Nó bay vòng quanh gốc thế giới với bán kính 10: $R \\cdot T$ dịch trước, rồi xoay cả vị trí đã dịch quanh gốc. Đúng là $T \\cdot R \\cdot S$ — scale và xoay tại tâm của chính object, dịch sau cùng.",
      en: "It orbits the world origin at radius 10: $R \\cdot T$ translates first, then rotates that translated position around the origin. The right order is $T \\cdot R \\cdot S$ — scale and rotate about the object's own center, translate last.",
    },
  },
];
