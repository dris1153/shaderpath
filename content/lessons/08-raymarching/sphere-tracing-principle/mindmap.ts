import type { Localized, MindMapNode } from "../../../types";

// Handwritten map: core idea → the loop you write → the three tuning knobs,
// with the traps sitting next to the knob they belong to.
export const mindMap: Localized<MindMapNode[]> = {
  vi: [
    {
      id: "idea",
      kind: "section",
      label: "Ý tưởng cốt lõi",
      children: [
        {
          id: "không-cần-hình-học-cảnh-là-một-hàm-khoảng-cách",
          kind: "section",
          label: "Cảnh = hàm khoảng cách",
          detail: "không vertex nào cả — SDF trả về khoảng cách gần nhất",
        },
        {
          id: "vì-sao-gọi-là-sphere-tracing-bước-an-toàn-tối-đa",
          kind: "section",
          label: "Bước = quả cầu an toàn",
          detail: "đi đúng d(p) mỗi lần — không bao giờ xuyên mặt",
        },
      ],
    },
    {
      id: "loop",
      kind: "section",
      label: "Vòng lặp bạn sẽ viết",
      children: [
        {
          id: "dựng-tia-từ-camera-gốc-hướng-fov-và-aspect",
          kind: "section",
          label: "Tia: gốc + hướng đơn vị",
          detail: "fov và aspect quyết định hướng qua từng pixel",
        },
        {
          id: "vòng-lặp-march-bước-tới-kiểm-tra-hit-kiểm-tra-miss",
          kind: "section",
          label: "March: bước, hit, miss",
          detail: "t += d(p) tới khi chạm hoặc bỏ cuộc",
        },
        {
          id: "pf-rd",
          kind: "pitfall",
          label: "Bẫy: quên normalize rd",
          detail: "t không còn là khoảng cách thật — hình méo như sai fov",
        },
      ],
    },
    {
      id: "knobs",
      kind: "section",
      label: "Ba nút chỉnh",
      children: [
        {
          id: "maxsteps-vì-sao-tia-lướt-cạnh-grazing-làm-thủng-silhouette",
          kind: "section",
          label: "maxSteps vs tia lướt cạnh",
          detail: "tia grazing bước li ti — hết steps là thủng silhouette",
        },
        {
          id: "epsilon-quá-lớn-thì-lồi-lõm-quá-nhỏ-thì-banding",
          kind: "section",
          label: "epsilon: lồi lõm ↔ banding",
        },
        {
          id: "debug-bằng-heatmap-nhìn-thấy-chi-phí-từng-pixel",
          kind: "section",
          label: "Heatmap = nhìn thấy chi phí",
          detail: "tô màu theo số bước — thấy ngay pixel nào đắt",
        },
        {
          id: "pf-eps",
          kind: "pitfall",
          label: "Bẫy: epsilon tuyệt đối",
          detail: "phải theo tỉ lệ cảnh — 0.001 vô nghĩa ở bán kính 100",
        },
        {
          id: "pf-maxdist",
          kind: "pitfall",
          label: "Bẫy: thiếu maxDist",
          detail: "tia trượt mãi chạy đủ maxSteps mới chịu dừng — phí vô ích",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Kết nối",
      children: [
        {
          id: "sdf-primitives",
          kind: "link",
          label: "SDF primitives",
          detail: "Bước tiếp: kho các hàm khoảng cách",
        },
        {
          id: "sdf-normals-from-gradient",
          kind: "link",
          label: "Pháp tuyến từ gradient",
          detail: "Bước tiếp theo để có ánh sáng",
        },
        {
          id: "raymarch-raster-depth-integration",
          kind: "link",
          label: "Ghép raymarch với raster",
          detail: "Về sau: sống chung với mesh",
        },
      ],
    },
  ],
  en: [
    {
      id: "idea",
      kind: "section",
      label: "The core idea",
      children: [
        {
          id: "no-geometry-required-the-scene-is-a-distance-function",
          kind: "section",
          label: "Scene = distance function",
          detail: "no vertices at all — the SDF returns the nearest distance",
        },
        {
          id: "why-sphere-tracing-the-maximum-safe-step",
          kind: "section",
          label: "Step = safe sphere",
          detail: "advance exactly d(p) each time — never punch through",
        },
      ],
    },
    {
      id: "loop",
      kind: "section",
      label: "The loop you will write",
      children: [
        {
          id: "building-a-ray-from-the-camera-origin-direction-fov-and-aspect",
          kind: "section",
          label: "Ray: origin + unit direction",
          detail: "fov and aspect shape the per-pixel direction",
        },
        {
          id: "the-march-loop-step-check-for-a-hit-check-for-a-miss",
          kind: "section",
          label: "March: step, hit, miss",
          detail: "t += d(p) until contact or give-up",
        },
        {
          id: "pf-rd",
          kind: "pitfall",
          label: "Trap: unnormalized rd",
          detail: "t stops being real distance — warps like a wrong fov",
        },
      ],
    },
    {
      id: "knobs",
      kind: "section",
      label: "The three tuning knobs",
      children: [
        {
          id: "maxsteps-why-grazing-rays-punch-holes-in-silhouettes",
          kind: "section",
          label: "maxSteps vs grazing rays",
          detail: "grazing rays inch along — running out punches silhouette holes",
        },
        {
          id: "epsilon-too-big-is-lumpy-too-small-is-banding",
          kind: "section",
          label: "epsilon: lumpy ↔ banding",
        },
        {
          id: "debugging-with-a-heatmap-seeing-the-cost-per-pixel",
          kind: "section",
          label: "Heatmap = seeing the cost",
          detail: "color by step count — expensive pixels light up",
        },
        {
          id: "pf-eps",
          kind: "pitfall",
          label: "Trap: absolute epsilon",
          detail: "scale it with the scene — 0.001 means nothing at radius 100",
        },
        {
          id: "pf-maxdist",
          kind: "pitfall",
          label: "Trap: missing maxDist",
          detail: "runaway rays burn all maxSteps before giving up",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Connections",
      children: [
        {
          id: "sdf-primitives",
          kind: "link",
          label: "SDF primitives",
          detail: "Next: your library of distance functions",
        },
        {
          id: "sdf-normals-from-gradient",
          kind: "link",
          label: "Normals from the gradient",
          detail: "The next step toward lighting",
        },
        {
          id: "raymarch-raster-depth-integration",
          kind: "link",
          label: "Raymarch meets raster",
          detail: "Later: coexisting with meshes",
        },
      ],
    },
  ],
};
