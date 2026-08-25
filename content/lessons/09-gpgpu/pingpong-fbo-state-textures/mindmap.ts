import type { Localized, MindMapNode } from "../../../types";

// Handwritten map: groups the ten headings into the three-beat story — the
// GPU constraint, state living in textures, and the render/swap loop.
export const mindMap: Localized<MindMapNode[]> = {
  vi: [
    {
      id: "why",
      kind: "section",
      label: "Vì sao phải ping-pong",
      children: [
        {
          id: "vì-sao-không-thể-đọc-và-ghi-cùng-một-texture-trong-một-pass",
          kind: "section",
          label: "Đọc + ghi cùng texture = cấm",
          detail: "feedback loop — WebGL bỏ qua draw call, báo INVALID_OPERATION",
        },
        {
          id: "ping-pong-hai-render-target-thay-phiên-đọcghi",
          kind: "section",
          label: "Hai render target thay phiên",
          detail: "frame này đọc A ghi B, frame sau đảo lại",
        },
        {
          id: "pf-bind",
          kind: "pitfall",
          label: "Bẫy: một RT giữ hai vai",
          detail: "vừa là sampler vào vừa là framebuffer ra trong cùng draw call",
        },
      ],
    },
    {
      id: "state",
      kind: "section",
      label: "Trạng thái sống trong texture",
      children: [
        {
          id: "mã-hoá-trạng-thái-vào-rgba-positionlife-và-velocity",
          kind: "section",
          label: "RGBA = position/life + velocity",
          detail: "mỗi pixel là một hạt, mỗi kênh một con số",
        },
        {
          id: "fragment-shader-compute-đọc-trạng-thái-cũ-ghi-trạng-thái-mới",
          kind: "section",
          label: "Compute = fragment shader thường",
          detail: "đọc trạng thái cũ, ghi trạng thái mới",
        },
        {
          id: "dựng-webglrendertarget-thủ-công-trong-threejs",
          kind: "section",
          label: "Dựng WebGLRenderTarget thủ công",
        },
        {
          id: "compute-scene-quad-phủ-kín-khung-hình--camera-orthographic",
          kind: "section",
          label: "Quad + camera orthographic",
        },
        {
          id: "độ-chính-xác-của-half-float",
          kind: "section",
          label: "Half float: đủ nhưng có trần",
        },
      ],
    },
    {
      id: "render",
      kind: "section",
      label: "Vẽ hạt & hoán đổi",
      children: [
        {
          id: "render-particle-points-đọc-uv-trỏ-vào-texture-trạng-thái",
          kind: "section",
          label: "Points đọc UV vào state texture",
          detail: "attribute chỉ giữ UV — vị trí thật nằm trong texture",
        },
        {
          id: "hoán-đổi-tham-chiếu-trong-js--không-sao-chép-dữ-liệu",
          kind: "section",
          label: "Swap = đổi tham chiếu JS",
          detail: "không byte nào được copy",
        },
        {
          id: "pf-delta",
          kind: "pitfall",
          label: "Bẫy: không clamp uDelta",
          detail: "tab ẩn rồi mở lại — một dt khổng lồ phá tung mô phỏng",
        },
        {
          id: "pf-reset",
          kind: "pitfall",
          label: "Bẫy: quên setRenderTarget(null)",
          detail: "frame chính vẽ nhầm vào render target compute",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Kết nối",
      children: [
        {
          id: "bài-này-dẫn-tới-đâu",
          kind: "section",
          label: "Bài này dẫn tới đâu",
        },
        {
          id: "why-particles-live-on-gpu",
          kind: "link",
          label: "Vì sao hạt sống trên GPU",
          detail: "Cần học trước",
        },
        {
          id: "gpucomputationrenderer",
          kind: "link",
          label: "GPUComputationRenderer",
          detail: "Helper gói sẵn đúng pattern này",
        },
      ],
    },
  ],
  en: [
    {
      id: "why",
      kind: "section",
      label: "Why ping-pong at all",
      children: [
        {
          id: "why-you-cant-read-and-write-the-same-texture-in-one-pass",
          kind: "section",
          label: "Read + write same texture = forbidden",
          detail: "a feedback loop — WebGL skips the draw, logs INVALID_OPERATION",
        },
        {
          id: "ping-pong-two-render-targets-trading-readwrite",
          kind: "section",
          label: "Two render targets take turns",
          detail: "this frame reads A writes B; next frame flips",
        },
        {
          id: "pf-bind",
          kind: "pitfall",
          label: "Trap: one RT in both roles",
          detail: "input sampler and output framebuffer in the same draw call",
        },
      ],
    },
    {
      id: "state",
      kind: "section",
      label: "State lives in textures",
      children: [
        {
          id: "encoding-state-into-rgba-positionlife-and-velocity",
          kind: "section",
          label: "RGBA = position/life + velocity",
          detail: "each pixel is a particle, each channel a number",
        },
        {
          id: "the-compute-fragment-shader-read-old-state-write-new-state",
          kind: "section",
          label: "Compute = ordinary fragment shader",
          detail: "read old state, write new state",
        },
        {
          id: "building-a-webglrendertarget-by-hand-in-threejs",
          kind: "section",
          label: "Building a WebGLRenderTarget by hand",
        },
        {
          id: "the-compute-scene-a-screen-filling-quad--an-orthographic-camera",
          kind: "section",
          label: "Quad + orthographic camera",
        },
        {
          id: "half-floats-precision",
          kind: "section",
          label: "Half float: enough, with a ceiling",
        },
      ],
    },
    {
      id: "render",
      kind: "section",
      label: "Drawing particles & swapping",
      children: [
        {
          id: "rendering-particles-points-reading-a-uv-into-the-state-texture",
          kind: "section",
          label: "Points read UVs into state",
          detail: "attributes hold only UVs — real positions live in the texture",
        },
        {
          id: "swapping-references-in-js--no-data-copying",
          kind: "section",
          label: "Swap = JS reference exchange",
          detail: "not a single byte is copied",
        },
        {
          id: "pf-delta",
          kind: "pitfall",
          label: "Trap: unclamped uDelta",
          detail: "a hidden-then-reopened tab hands you one huge dt",
        },
        {
          id: "pf-reset",
          kind: "pitfall",
          label: "Trap: skipping setRenderTarget(null)",
          detail: "the main frame renders into the compute target",
        },
      ],
    },
    {
      id: "links",
      kind: "link",
      label: "Connections",
      children: [
        {
          id: "where-this-lesson-leads",
          kind: "section",
          label: "Where this lesson leads",
        },
        {
          id: "why-particles-live-on-gpu",
          kind: "link",
          label: "Why particles live on the GPU",
          detail: "Learn first",
        },
        {
          id: "gpucomputationrenderer",
          kind: "link",
          label: "GPUComputationRenderer",
          detail: "A helper wrapping exactly this pattern",
        },
      ],
    },
  ],
};
