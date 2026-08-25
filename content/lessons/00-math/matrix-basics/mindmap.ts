import type { Localized, MindMapNode } from "../../../types";

// Handwritten map: regroups the lesson around its three laws (read by
// columns, build from basis images, compose right-to-left) instead of
// heading order. Anchors must match theory headings — lint:content gates.
export const mindMap: Localized<MindMapNode[]> = {
  vi: [
    {
      id: "read",
      kind: "section",
      label: "Đọc: cột là tất cả",
      children: [
        {
          id: "ma-trận-là-gì-máy-biến-đổi-không-gian",
          kind: "section",
          label: "Ma trận = máy biến đổi",
          detail: "cả không gian đi theo hai cột của nó",
        },
        {
          id: "đọc-ma-trận-theo-cột-vector-cơ-sở-basis-vector-đi-về-đâu",
          kind: "section",
          label: "Cột = ảnh của basis vector",
          detail: "î rơi vào cột 1, ĵ rơi vào cột 2",
        },
        {
          id: "nhân-ma-trận-với-vector-tổ-hợp-tuyến-tính-của-các-cột",
          kind: "section",
          label: "Nhân = tổ hợp tuyến tính cột",
          detail: "M·v trộn các cột theo từng thành phần của v",
        },
        {
          id: "pf-rows",
          kind: "pitfall",
          label: "Bẫy: đọc hàng thay vì cột",
          detail:
            "hàng trên chỉ là thành phần x của CẢ HAI cột — không phải \"biến đổi trục x\"; GLSL còn lưu column-major",
        },
      ],
    },
    {
      id: "build",
      kind: "section",
      label: "Dựng từ đầu",
      children: [
        {
          id: "dựng-ma-trận-xoay-2d-từ-đầu",
          kind: "section",
          label: "Xoay = xoay hai basis vector",
          detail: "cột 1 = (cos θ, sin θ) — chính là î sau khi xoay",
        },
        {
          id: "vì-sao-cột-thứ-hai-là--sintheta-costheta",
          kind: "section",
          label: "Cột 2 = (−sin θ, cos θ)",
          detail: "ĵ luôn đi trước î đúng 90°",
        },
        {
          id: "ma-trận-scale-và-shear",
          kind: "section",
          label: "Scale kéo cột, shear nghiêng trục",
        },
        {
          id: "pf-shear",
          kind: "pitfall",
          label: "Bẫy: shear không phải xoay nhẹ",
          detail: "chỉ xoay mới bảo toàn độ dài mọi cạnh",
        },
      ],
    },
    {
      id: "compose",
      kind: "section",
      label: "Ghép: thứ tự là luật",
      children: [
        {
          id: "ghép-biến-đổi-composition-vì-sao-thứ-tự-nhân-ma-trận-quan-trọng",
          kind: "section",
          label: "M = A·B: B chạy trước",
          detail: "M·v = A(B·v) — đọc từ phải sang trái",
        },
        {
          id: "pf-order",
          kind: "pitfall",
          label: "Bẫy: nhân sai thứ tự",
          detail:
            "rotate rồi scale ≠ scale rồi rotate — object méo theo trục sai mà không có lỗi nào",
        },
        {
          id: "obj-order",
          kind: "objective",
          label: "Giải thích vì sao thứ tự quan trọng",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Kết nối",
      children: [
        {
          id: "kết-nối-về-sau-ma-trận-trong-pipeline-3d",
          kind: "section",
          label: "Ma trận trong pipeline 3D",
          detail: "cùng luật chơi, chỉ thêm chiều",
        },
        {
          id: "checkpoint-vector-clock",
          kind: "link",
          label: "Mini-build: Đồng hồ vector",
          detail: "Cần học trước",
        },
        {
          id: "homogeneous-coordinates-4x4",
          kind: "link",
          label: "Toạ độ đồng nhất & 4x4",
          detail: "Bước tiếp: thêm translation",
        },
      ],
    },
  ],
  en: [
    {
      id: "read",
      kind: "section",
      label: "Read: columns are everything",
      children: [
        {
          id: "what-a-matrix-is-a-space-transforming-machine",
          kind: "section",
          label: "Matrix = transforming machine",
          detail: "all of space follows its two columns",
        },
        {
          id: "reading-a-matrix-by-columns-where-the-basis-vectors-land",
          kind: "section",
          label: "Columns = basis-vector images",
          detail: "î lands in column 1, ĵ in column 2",
        },
        {
          id: "matrix-times-vector-a-linear-combination-of-columns",
          kind: "section",
          label: "Multiply = combine the columns",
          detail: "M·v blends the columns by v's components",
        },
        {
          id: "pf-rows",
          kind: "pitfall",
          label: "Trap: reading rows, not columns",
          detail:
            "the top row is just the x component of BOTH columns — not \"the x-axis transform\"; GLSL stores column-major too",
        },
      ],
    },
    {
      id: "build",
      kind: "section",
      label: "Build from scratch",
      children: [
        {
          id: "building-the-2d-rotation-matrix-from-scratch",
          kind: "section",
          label: "Rotation = rotate both basis vectors",
          detail: "column 1 = (cos θ, sin θ) — î after rotating",
        },
        {
          id: "why-the-second-column-is--sintheta-costheta",
          kind: "section",
          label: "Column 2 = (−sin θ, cos θ)",
          detail: "ĵ always leads î by exactly 90°",
        },
        {
          id: "scale-and-shear-matrices",
          kind: "section",
          label: "Scale stretches, shear tilts",
        },
        {
          id: "pf-shear",
          kind: "pitfall",
          label: "Trap: shear is not mild rotation",
          detail: "only rotation preserves every edge length",
        },
      ],
    },
    {
      id: "compose",
      kind: "section",
      label: "Compose: order is law",
      children: [
        {
          id: "composition-why-matrix-multiplication-order-matters",
          kind: "section",
          label: "M = A·B: B runs first",
          detail: "M·v = A(B·v) — read right to left",
        },
        {
          id: "pf-order",
          kind: "pitfall",
          label: "Trap: multiplying in wrong order",
          detail:
            "rotate-then-scale ≠ scale-then-rotate — the object skews along the wrong axis with no error",
        },
        {
          id: "obj-order",
          kind: "objective",
          label: "Explain why multiplication order matters",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Connections",
      children: [
        {
          id: "looking-ahead-matrices-in-the-3d-pipeline",
          kind: "section",
          label: "Matrices in the 3D pipeline",
          detail: "same rules, one more dimension",
        },
        {
          id: "checkpoint-vector-clock",
          kind: "link",
          label: "Mini-build: vector clock",
          detail: "Learn first",
        },
        {
          id: "homogeneous-coordinates-4x4",
          kind: "link",
          label: "Homogeneous coordinates & 4x4",
          detail: "Next: translation joins in",
        },
      ],
    },
  ],
};
