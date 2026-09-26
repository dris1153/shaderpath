import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "dot-sign-not-angle",
    q: {
      vi: "Hai vector có $\\vec a \\cdot \\vec b = 6$. Chúng tạo góc nhọn hay tù — và có suy ra được góc bao nhiêu độ không?",
      en: "Two vectors have $\\vec a \\cdot \\vec b = 6$. Is the angle between them acute or obtuse — and can you tell how many degrees?",
    },
    a: {
      vi: "Góc nhọn, vì dot dương nghĩa là $\\cos\\theta > 0$. Nhưng không suy ra được số đo: $6 = \\|\\vec a\\|\\|\\vec b\\|\\cos\\theta$, chưa biết hai độ dài thì không tách được $\\cos\\theta$. Chỉ khi cả hai đã normalize thì dot mới chính là cosine.",
      en: "Acute, because a positive dot means $\\cos\\theta > 0$. But not the size: $6 = \\|\\vec a\\|\\|\\vec b\\|\\cos\\theta$, and without the two lengths $\\cos\\theta$ cannot be separated out. Only when both are normalized is the dot the cosine itself.",
    },
  },
  {
    id: "cross-2d-left-right",
    q: {
      vi: "Game 2D: xe hướng theo $\\vec f$, mục tiêu nằm theo $\\vec t$ (trục $y$ hướng lên). Phép tính một dòng nào cho biết mục tiêu ở bên trái hay bên phải xe, và đọc dấu thế nào?",
      en: "2D game: a car faces $\\vec f$, the target lies along $\\vec t$ ($y$ points up). Which one-line computation tells you whether the target is left or right of the car, and how do you read its sign?",
    },
    a: {
      vi: "Cross 2D: $f_x t_y - f_y t_x$. Nó là một số chứ không phải vector — chính là thành phần $z$ của cross 3D khi hai thành phần $z$ bằng 0. Dương thì $\\vec t$ nằm ngược chiều kim đồng hồ so với $\\vec f$, tức bên trái; âm thì bên phải.",
      en: "The 2D cross: $f_x t_y - f_y t_x$. It is a number, not a vector — the $z$ component of the 3D cross when both $z$ components are 0. Positive means $\\vec t$ is counter-clockwise from $\\vec f$, so on the left; negative means right.",
    },
  },
  {
    id: "cross-order-flips-normal",
    q: {
      vi: "Pháp tuyến tam giác $ABC$ được tính bằng `cross(B - A, C - A)`. Đổi thành `cross(C - A, B - A)` thì mặt tam giác trông thế nào dưới ánh sáng, và vì sao?",
      en: "A triangle's normal is computed as `cross(B - A, C - A)`. Swap it to `cross(C - A, B - A)`: how does the face look under a light, and why?",
    },
    a: {
      vi: "Tối đi ở đúng chỗ lẽ ra được chiếu sáng: $\\vec a \\times \\vec b = -(\\vec b \\times \\vec a)$, nên pháp tuyến quay vào trong và $N \\cdot L$ thành âm ở mặt đang hướng về đèn.",
      en: "Dark exactly where it should be lit: $\\vec a \\times \\vec b = -(\\vec b \\times \\vec a)$, so the normal points inward and $N \\cdot L$ turns negative on the side facing the light.",
    },
  },
];
