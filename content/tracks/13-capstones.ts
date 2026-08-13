import type { LessonMeta, ModuleDef, TrackDef } from "../types";

export const track: TrackDef = {
  id: "capstones",
  order: 13,
  title: { vi: "Capstone Projects", en: "Capstone Projects" },
  summary: {
    vi: "Bốn dự án lớn tổng hợp toàn bộ lộ trình: showcase cuộn trang, địa hình raymarch, một triệu particle và portfolio 3D đạt Lighthouse 90+.",
    en: "Four projects that synthesize the whole path: a scroll showcase, a raymarched landscape, a million particles and a 3D portfolio scoring Lighthouse 90+.",
  },
  moduleIds: ["capstones-01-projects"],
};

export const modules: ModuleDef[] = [
  {
    id: "capstones-01-projects",
    trackId: "capstones",
    order: 1,
    title: { vi: "Bốn dự án tổng kết", en: "The Four Projects" },
    lessonSlugs: [
      "capstone-scroll-product-showcase",
      "capstone-raymarched-landscape",
      "capstone-gpu-particle-system",
      "capstone-3d-portfolio",
    ],
  },
];

export const lessons: LessonMeta[] = [
  {
    slug: "capstone-scroll-product-showcase",
    trackId: "capstones",
    moduleId: "capstones-01-projects",
    order: 1,
    title: { vi: "Capstone: Trang giới thiệu sản phẩm cuộn trang", en: "Capstone: Scroll-Driven Product Showcase" },
    summary: {
      vi: "Dự án nhiều buổi: tải model GLTF thật, dựng trình tự kể chuyện bằng ScrollTrigger đồng bộ với render loop R3F, và phủ một lớp post-processing hoàn thiện — như một trang sản phẩm cao cấp thật sự.",
      en: "A multi-session project: load a real GLTF model, build a scroll-driven narrative with ScrollTrigger synced to the R3F render loop, and finish it with a post-processing pass — like a real premium product page.",
    },
    difficulty: 5,
    estimatedMinutes: 480,
    tags: ["build", "gsap", "postfx"],
    tier: "core",
    kind: "checkpoint",
    prerequisites: [
      "checkpoint-scrollytelling-page",
      "checkpoint-signature-effect-stack",
      "checkpoint-gltf-viewer",
    ],
    objectives: {
      vi: [
        "Tải và tối ưu một model GLTF thật cho web (Draco/KTX2, LOD nếu cần)",
        "Dựng chuỗi ScrollTrigger đồng bộ camera/animation theo scroll, dùng đúng single-loop rule",
        "Hoàn thiện bằng một chuỗi post-processing phù hợp phong cách sản phẩm",
      ],
      en: [
        "Load and optimize a real GLTF model for the web (Draco/KTX2, LOD if needed)",
        "Build a ScrollTrigger sequence syncing camera/animation to scroll, following the single-loop rule",
        "Finish with a post-processing chain matching the product's visual style",
      ],
    },
    hasDemo: false,
    hasPlayground: false,
  },
  {
    slug: "capstone-raymarched-landscape",
    trackId: "capstones",
    moduleId: "capstones-01-projects",
    order: 2,
    title: { vi: "Capstone: Địa hình Raymarch", en: "Capstone: Raymarched Landscape" },
    summary: {
      vi: "Dự án nhiều buổi: dựng một địa hình vô hạn bằng fullscreen fragment shader, FBM cho terrain, atmospheric scattering cho bầu trời, và quality tier để chạy được cả trên máy yếu.",
      en: "A multi-session project: build an infinite landscape in a fullscreen fragment shader, FBM for terrain, atmospheric scattering for the sky, and quality tiers so it runs on weaker machines too.",
    },
    difficulty: 5,
    estimatedMinutes: 480,
    tags: ["build", "sdf", "shader"],
    tier: "core",
    kind: "checkpoint",
    prerequisites: ["checkpoint-raymarched-vista", "checkpoint-mobile-ready-scene"],
    objectives: {
      vi: [
        "Dựng terrain bằng FBM raymarched trên toàn màn hình, không dùng mesh",
        "Cài đặt atmospheric scattering đơn giản cho bầu trời và sương mù xa",
        "Thêm quality tier giảm số bước raymarch/octave FBM theo hiệu năng thiết bị",
      ],
      en: [
        "Build FBM-based raymarched terrain across the full screen, no mesh involved",
        "Implement simple atmospheric scattering for sky and distance fog",
        "Add quality tiers that reduce raymarch steps/FBM octaves based on device performance",
      ],
    },
    hasDemo: false,
    hasPlayground: false,
  },
  {
    slug: "capstone-gpu-particle-system",
    trackId: "capstones",
    moduleId: "capstones-01-projects",
    order: 3,
    title: { vi: "Capstone: Hệ Particle GPU Tương tác", en: "Capstone: Interactive GPU Particle System" },
    summary: {
      vi: "Dự án nhiều buổi: mô phỏng một triệu particle hoàn toàn trên GPU bằng ping-pong FBO, chuyển động theo flow field và phản hồi tương tác chuột theo thời gian thực.",
      en: "A multi-session project: simulate one million particles entirely on the GPU with ping-pong FBOs, driven by a flow field and responding to mouse interaction in real time.",
    },
    difficulty: 5,
    estimatedMinutes: 480,
    tags: ["build", "gpgpu"],
    tier: "core",
    kind: "checkpoint",
    prerequisites: ["checkpoint-interactive-particle-field", "checkpoint-mobile-ready-scene"],
    objectives: {
      vi: [
        "Mô phỏng 1M particle bằng ping-pong FBO, không đụng CPU mỗi frame",
        "Điều khiển chuyển động particle bằng flow field (noise-based hoặc curl noise)",
        "Thêm tương tác chuột ảnh hưởng trực tiếp lên simulation trên GPU",
      ],
      en: [
        "Simulate 1M particles with ping-pong FBOs, touching the CPU on zero frames",
        "Drive particle motion with a flow field (noise-based or curl noise)",
        "Add mouse interaction that directly affects the GPU simulation",
      ],
    },
    hasDemo: false,
    hasPlayground: false,
  },
  {
    slug: "capstone-3d-portfolio",
    trackId: "capstones",
    moduleId: "capstones-01-projects",
    order: 4,
    title: { vi: "Capstone: Portfolio 3D", en: "Capstone: 3D Portfolio" },
    summary: {
      vi: "Dự án nhiều buổi: một trang portfolio thật với 3D hero, nhưng phải đạt Lighthouse trên 90 và chạy mượt trên thiết bị mobile tầm trung — bài kiểm tra cuối cùng cho mọi kỹ thuật performance đã học.",
      en: "A multi-session project: a real portfolio site with a 3D hero, but it must score Lighthouse above 90 and run smoothly on a mid-range mobile device — the final exam for every performance technique covered so far.",
    },
    difficulty: 5,
    estimatedMinutes: 480,
    tags: ["build", "perf", "r3f"],
    tier: "core",
    kind: "checkpoint",
    prerequisites: ["checkpoint-mobile-ready-scene"],
    objectives: {
      vi: [
        "Dựng một 3D hero section tích hợp vào trang portfolio thật",
        "Đạt điểm Lighthouse > 90 trên các trang không chứa canvas",
        "Xác nhận cảnh 3D chạy mượt (không giật, không leak) trên mobile tầm trung",
      ],
      en: [
        "Build a 3D hero section integrated into a real portfolio page",
        "Reach a Lighthouse score above 90 on non-canvas pages",
        "Confirm the 3D scene runs smoothly (no jank, no leaks) on a mid-range mobile device",
      ],
    },
    hasDemo: false,
    hasPlayground: false,
  },
];
