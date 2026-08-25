import type { Localized, MindMapNode } from "../../../types";

// Handwritten map: the formula is the skeleton — hypothesis, then each letter
// of D·G·F, then the denominator/energy bookkeeping most learners drop.
export const mindMap: Localized<MindMapNode[]> = {
  vi: [
    {
      id: "hypothesis",
      kind: "section",
      label: "Giả thuyết microfacet",
      children: [
        {
          id: "macro-thô-ráp--triệu-gương-vi-mô-giả-thuyết-microfacet",
          kind: "section",
          label: "Thô ráp = triệu gương nhỏ",
          detail: "mỗi facet là gương hoàn hảo — chỉ hướng là ngẫu nhiên",
        },
        {
          id: "roughness-là-gì-về-mặt-thống-kê-độ-tán-của-pháp-tuyến-vi-mô",
          kind: "section",
          label: "Roughness = độ tán pháp tuyến",
          detail: "một con số điều khiển cả phân bố thống kê",
        },
      ],
    },
    {
      id: "numerator",
      kind: "section",
      label: "Tử số: D·G·F",
      children: [
        {
          id: "cook-torrance-fr--dgf--4nvnl",
          kind: "section",
          label: "Cook-Torrance = D·G·F / 4(n·v)(n·l)",
        },
        {
          id: "d--ggxtrowbridge-reitz-bao-nhiêu-microfacet-chĩa-đúng-hướng-h",
          kind: "section",
          label: "D: bao nhiêu facet trúng h",
          detail: "GGX — đuôi dài tạo highlight có viền mềm",
        },
        {
          id: "g--smith-shadowing-masking-vì-sao-thiếu-g-làm-rìa-cháy-sáng",
          kind: "section",
          label: "G: facet che khuất nhau",
          detail: "thiếu G thì rìa vật \"cháy sáng\"",
        },
        {
          id: "f--fresnel-schlick-phản-chiếu-luôn-gắt-hơn-ở-góc-xiên",
          kind: "section",
          label: "F: gắt hơn ở góc xiên",
          detail: "Schlick xấp xỉ Fresnel — rẻ mà đủ chính xác",
        },
      ],
    },
    {
      id: "energy",
      kind: "section",
      label: "Mẫu số & năng lượng",
      children: [
        {
          id: "chuẩn-hoá-4nvnl-và-cân-bằng-năng-lượng-kd",
          kind: "section",
          label: "Chuẩn hoá & cân bằng k_d",
          detail: "specular lấy bao nhiêu, diffuse còn bấy nhiêu",
        },
        {
          id: "cài-glsl-từ-đầu-dựng-cook-torrance-từng-bước",
          kind: "section",
          label: "GLSL từng bước",
        },
        {
          id: "pf-eps",
          kind: "pitfall",
          label: "Bẫy: quên epsilon ở mẫu",
          detail: "n·v → 0 ở rìa — chia 0 thành pixel NaN đen",
        },
        {
          id: "pf-kd",
          kind: "pitfall",
          label: "Bẫy: quên (1−metalness) vào k_d",
          detail: "kim loại thuần không có diffuse",
        },
      ],
    },
    {
      id: "intuition",
      kind: "section",
      label: "Trực giác & kết nối",
      children: [
        {
          id: "roughness-quyết-định-tất-cả-trực-giác-thị-giác-cần-nhớ",
          kind: "section",
          label: "Roughness quyết định tất cả",
        },
        {
          id: "rendering-equation-intuition",
          kind: "link",
          label: "Phương trình rendering",
          detail: "Cần học trước",
        },
        {
          id: "fresnel-and-schlick",
          kind: "link",
          label: "Fresnel & Schlick",
          detail: "Đào sâu chữ F",
        },
        {
          id: "checkpoint-material-study",
          kind: "link",
          label: "Checkpoint: material study",
          detail: "Nơi áp dụng tất cả",
        },
      ],
    },
  ],
  en: [
    {
      id: "hypothesis",
      kind: "section",
      label: "The microfacet hypothesis",
      children: [
        {
          id: "rough-at-macro-scale--millions-of-micro-mirrors-the-microfacet-hypothesis",
          kind: "section",
          label: "Rough = millions of tiny mirrors",
          detail: "each facet is a perfect mirror — only orientation is random",
        },
        {
          id: "what-roughness-actually-is-statistically-the-spread-of-micro-normals",
          kind: "section",
          label: "Roughness = micro-normal spread",
          detail: "one number steering a whole statistical distribution",
        },
      ],
    },
    {
      id: "numerator",
      kind: "section",
      label: "Numerator: D·G·F",
      children: [
        {
          id: "cook-torrance-fr--dgf--4nvnl",
          kind: "section",
          label: "Cook-Torrance = D·G·F / 4(n·v)(n·l)",
        },
        {
          id: "d--ggxtrowbridge-reitz-how-many-microfacets-point-exactly-along-h",
          kind: "section",
          label: "D: how many facets hit h",
          detail: "GGX — the long tail gives soft-edged highlights",
        },
        {
          id: "g--smith-shadowing-masking-why-skipping-g-makes-edges-glow-too-bright",
          kind: "section",
          label: "G: facets shadow each other",
          detail: "skip G and edges \"glow too bright\"",
        },
        {
          id: "f--fresnel-schlick-reflection-always-gets-harder-at-grazing-angles",
          kind: "section",
          label: "F: harder at grazing angles",
          detail: "Schlick approximates Fresnel — cheap yet accurate",
        },
      ],
    },
    {
      id: "energy",
      kind: "section",
      label: "Denominator & energy",
      children: [
        {
          id: "the-4nvnl-normalization-and-energy-balance-via-kd",
          kind: "section",
          label: "Normalization & the k_d balance",
          detail: "what specular takes, diffuse gives up",
        },
        {
          id: "building-the-glsl-implementation-step-by-step",
          kind: "section",
          label: "GLSL step by step",
        },
        {
          id: "pf-eps",
          kind: "pitfall",
          label: "Trap: no epsilon in denominator",
          detail: "n·v → 0 at edges — dividing by 0 makes black NaN pixels",
        },
        {
          id: "pf-kd",
          kind: "pitfall",
          label: "Trap: dropping (1−metalness) from k_d",
          detail: "pure metals have no diffuse at all",
        },
      ],
    },
    {
      id: "intuition",
      kind: "section",
      label: "Intuition & connections",
      children: [
        {
          id: "roughness-rules-everything-the-visual-intuition-to-keep",
          kind: "section",
          label: "Roughness rules everything",
        },
        {
          id: "rendering-equation-intuition",
          kind: "link",
          label: "The rendering equation",
          detail: "Learn first",
        },
        {
          id: "fresnel-and-schlick",
          kind: "link",
          label: "Fresnel & Schlick",
          detail: "Deep-dives the F",
        },
        {
          id: "checkpoint-material-study",
          kind: "link",
          label: "Checkpoint: material study",
          detail: "Where it all gets applied",
        },
      ],
    },
  ],
};
