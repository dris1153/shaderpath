import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "compose-order",
    q: {
      vi: "Muốn kéo giãn gấp đôi theo trục $x$ *rồi mới* xoay 90°. Viết $M = S \\cdot R$ hay $M = R \\cdot S$ — và viết sai thì hình vuông bị kéo dài theo trục nào?",
      en: "You want to stretch by 2 along $x$ *and then* rotate by 90°. Is it $M = S \\cdot R$ or $M = R \\cdot S$ — and if you pick wrong, along which axis does the square end up long?",
    },
    a: {
      vi: "$M = R \\cdot S$: $M\\vec v = R(S\\vec v)$, ma trận sát vector chạy trước. Đúng thì cạnh vừa kéo dài bị xoay dựng lên, hình dài theo trục $y$. Viết $S \\cdot R$ thì xoay trước rồi mới kéo theo trục $x$ của thế giới, hình dài theo trục $x$.",
      en: "$M = R \\cdot S$: $M\\vec v = R(S\\vec v)$, so the matrix next to the vector runs first. Done right, the stretched side is rotated upright and the shape is long along $y$. With $S \\cdot R$ it rotates first and is then stretched along world $x$, so it is long along $x$.",
    },
  },
  {
    id: "shear-not-rotation",
    q: {
      vi: "Ma trận $\\begin{pmatrix}1 & 0.5\\\\0 & 1\\end{pmatrix}$ làm hình vuông nghiêng đi. Nhìn hai cột, làm sao biết ngay đó là shear chứ không phải xoay?",
      en: "The matrix $\\begin{pmatrix}1 & 0.5\\\\0 & 1\\end{pmatrix}$ tilts a square. Looking at its two columns, how can you tell at once it is a shear and not a rotation?",
    },
    a: {
      vi: "Cột 1 là $(1, 0)$: $\\hat i$ đứng yên. Cột 2 là $(0.5, 1)$: $\\hat j$ dài $\\sqrt{1.25} \\approx 1.12$ và không còn vuông góc với $\\hat i$. Phép xoay giữ mọi cột dài 1 và vuông góc nhau, nên đây là shear — nó kéo dài cạnh thật.",
      en: "Column 1 is $(1, 0)$: $\\hat i$ stays put. Column 2 is $(0.5, 1)$: $\\hat j$ has length $\\sqrt{1.25} \\approx 1.12$ and is no longer perpendicular to $\\hat i$. A rotation keeps every column at length 1 and at right angles, so this is a shear — it really stretches a side.",
    },
  },
  {
    id: "rotation-sign",
    q: {
      vi: "Dựng ma trận xoay nhưng lỡ viết cột 2 là $(\\sin\\theta, \\cos\\theta)$. Với θ = 90°, $\\hat i$ và $\\hat j$ bị đưa tới đâu, và hình bị gì?",
      en: "Building a rotation matrix, you write column 2 as $(\\sin\\theta, \\cos\\theta)$ by mistake. At θ = 90°, where do $\\hat i$ and $\\hat j$ go, and what happens to the shape?",
    },
    a: {
      vi: "Cột 1 là $(\\cos 90^\\circ, \\sin 90^\\circ) = (0, 1)$, cột 2 thành $(1, 0)$: hai trục đổi chỗ cho nhau. Không phép xoay nào làm vậy — hình bị lật như soi gương. Xoay đúng thì $\\hat j$ phải tới $(-1, 0)$, tức cột 2 là $(-\\sin\\theta, \\cos\\theta)$.",
      en: "Column 1 is $(\\cos 90^\\circ, \\sin 90^\\circ) = (0, 1)$ and column 2 becomes $(1, 0)$: the two axes swap places. No rotation does that — the shape comes out mirrored. A real rotation sends $\\hat j$ to $(-1, 0)$, so column 2 is $(-\\sin\\theta, \\cos\\theta)$.",
    },
  },
];
