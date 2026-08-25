import type { Localized, MindMapNode } from "../../../types";

// Handwritten map: the lesson's seven headings collapse into three moves of
// one chain (place, look, squeeze) plus the connections that reuse it.
export const mindMap: Localized<MindMapNode[]> = {
  vi: [
    {
      id: "chain",
      kind: "section",
      label: "Một chuỗi, ba ma trận",
      children: [
        {
          id: "chuỗi-từ-model-tới-clip-space-vai-trò-ba-ma-trận",
          kind: "section",
          label: "P·V·M — đọc phải sang trái",
          detail: "M đặt vào world, V kéo về mắt camera, P nén vào clip",
        },
        {
          id: "sáu-không-gian-sáu-ý-nghĩa-cụ-thể",
          kind: "section",
          label: "Sáu không gian",
          detail: "local → world → view → clip → NDC → màn hình",
        },
        {
          id: "pf-order",
          kind: "pitfall",
          label: "Bẫy: nhân sai thứ tự",
          detail: "trong P·V·M·v thì M chạy TRƯỚC dù đứng cuối biểu thức",
        },
      ],
    },
    {
      id: "view",
      kind: "section",
      label: "View = camera nghịch đảo",
      children: [
        {
          id: "ma-trận-view-là-nghịch-đảo-transform-của-camera",
          kind: "section",
          label: "V = C⁻¹",
          detail: "camera đứng yên — cả thế giới bị kéo về khung nhìn",
        },
        {
          id: "dựng-ma-trận-lookat-từ-eye-target-và-up",
          kind: "section",
          label: "lookAt: eye, target, up",
          detail: "ba vector dựng trọn hệ trục camera",
        },
        {
          id: "pf-view",
          kind: "pitfall",
          label: "Bẫy: dùng C làm view matrix",
          detail: "phải là C⁻¹ — quên nghịch đảo thì cảnh chạy ngược hướng",
        },
      ],
    },
    {
      id: "projection",
      kind: "section",
      label: "Projection & về pixel",
      children: [
        {
          id: "ma-trận-perspective-ở-mức-công-thức-fov-focal-length-nearfar",
          kind: "section",
          label: "Perspective: fov, near/far",
          detail: "nén frustum hình chóp cụt về khối [-1,1]",
        },
        {
          id: "từ-ndc-ra-pixel-viewport-transform",
          kind: "section",
          label: "NDC → pixel",
          detail: "viewport transform — bước cuối, GPU tự làm",
        },
        {
          id: "pf-w",
          kind: "pitfall",
          label: "Bẫy: quên chia w",
          detail: "sau P mới là clip space — chia w rồi mới thành NDC",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Kết nối",
      children: [
        {
          id: "track-sau-dùng-lại-toàn-bộ-chuỗi-này",
          kind: "section",
          label: "Chuỗi này quay lại mọi track",
        },
        {
          id: "matrix-basics",
          kind: "link",
          label: "Ma trận 2x2 & 3x3",
          detail: "Cần học trước",
        },
        {
          id: "homogeneous-coordinates-4x4",
          kind: "link",
          label: "Toạ độ đồng nhất & 4x4",
          detail: "Cần học trước",
        },
        {
          id: "scene-graph-and-transforms",
          kind: "link",
          label: "Scene graph trong three.js",
          detail: "Nơi chuỗi này thành code thật",
        },
      ],
    },
  ],
  en: [
    {
      id: "chain",
      kind: "section",
      label: "One chain, three matrices",
      children: [
        {
          id: "the-chain-from-model-to-clip-space-what-each-matrix-does",
          kind: "section",
          label: "P·V·M — read right to left",
          detail: "M places in world, V pulls to the camera, P squeezes into clip",
        },
        {
          id: "six-spaces-six-concrete-meanings",
          kind: "section",
          label: "Six spaces",
          detail: "local → world → view → clip → NDC → screen",
        },
        {
          id: "pf-order",
          kind: "pitfall",
          label: "Trap: wrong multiplication order",
          detail: "in P·V·M·v, M runs FIRST despite sitting last",
        },
      ],
    },
    {
      id: "view",
      kind: "section",
      label: "View = inverted camera",
      children: [
        {
          id: "the-view-matrix-is-the-cameras-transform-inverted",
          kind: "section",
          label: "V = C⁻¹",
          detail: "the camera stays put — the world gets pulled to it",
        },
        {
          id: "building-the-lookat-matrix-from-eye-target-and-up",
          kind: "section",
          label: "lookAt: eye, target, up",
          detail: "three vectors build the whole camera frame",
        },
        {
          id: "pf-view",
          kind: "pitfall",
          label: "Trap: using C as view matrix",
          detail: "it must be C⁻¹ — skip the inverse and the scene moves backwards",
        },
      ],
    },
    {
      id: "projection",
      kind: "section",
      label: "Projection & down to pixels",
      children: [
        {
          id: "the-perspective-matrix-at-the-formula-level-fov-focal-length-nearfar",
          kind: "section",
          label: "Perspective: fov, near/far",
          detail: "squeezes the frustum into the [-1,1] cube",
        },
        {
          id: "from-ndc-to-pixels-the-viewport-transform",
          kind: "section",
          label: "NDC → pixels",
          detail: "the viewport transform — last step, done by the GPU",
        },
        {
          id: "pf-w",
          kind: "pitfall",
          label: "Trap: forgetting the w divide",
          detail: "after P you are in clip space — divide by w to reach NDC",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Connections",
      children: [
        {
          id: "where-this-chain-resurfaces-later",
          kind: "section",
          label: "This chain returns in every track",
        },
        {
          id: "matrix-basics",
          kind: "link",
          label: "Matrices 2x2 & 3x3",
          detail: "Learn first",
        },
        {
          id: "homogeneous-coordinates-4x4",
          kind: "link",
          label: "Homogeneous coordinates & 4x4",
          detail: "Learn first",
        },
        {
          id: "scene-graph-and-transforms",
          kind: "link",
          label: "Scene graph in three.js",
          detail: "Where this chain becomes real code",
        },
      ],
    },
  ],
};
