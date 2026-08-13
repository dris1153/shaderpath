// Global lesson slug registry — THE source of the `LessonSlug` union (spec §8.1).
// Slugs are FROZEN once content ships: renaming breaks notes/bookmarks anchors (D9).
// Order here mirrors curriculum order (track → module → unit) for readability only.

export const LESSON_SLUGS = [
  // ── Track 0 · math ────────────────────────────────────────────────
  // module math-01-spaces-and-vectors
  "cartesian-and-uv-space",
  "vector-basics",
  "dot-and-cross-products",
  "checkpoint-vector-clock",
  // module math-02-matrices-and-transforms
  "matrix-basics",
  "homogeneous-coordinates-4x4",
  "model-view-projection",
  "checkpoint-wireframe-cube",
  // module math-03-rotation-interpolation-color
  "euler-angles-and-gimbal-lock",
  "quaternions",
  "trigonometry-for-animation",
  "interpolation-and-easing",
  "srgb-linear-and-gamma",
  "checkpoint-orbit-animation",

  // ── Track 1 · webgl ───────────────────────────────────────────────
  // module webgl-01-pipeline-and-context
  "what-webgl-is-and-isnt",
  "rendering-pipeline-a-to-z",
  "canvas-context-and-dpr",
  "checkpoint-responsive-clear",
  // module webgl-02-first-triangle
  "buffers-vbo-vao",
  "vertex-fragment-rasterization",
  "attributes-uniforms-varyings",
  "first-triangle-webgl2",
  "checkpoint-animated-quad",
  // module webgl-03-gpu-state-and-memory
  "textures-upload-and-sampling",
  "framebuffers-render-to-texture",
  "depth-buffer-and-z-fighting",
  "blending-and-alpha",
  "webgl-vs-webgpu-landscape",
  "checkpoint-render-to-texture-tint",

  // ── Track 2 · glsl ────────────────────────────────────────────────
  // module glsl-01-language-of-the-gpu
  "glsl-syntax-types-swizzling",
  "precision-qualifiers",
  "glsl-builtin-functions",
  "branching-cost-on-gpu",
  "checkpoint-gradient-palette",
  // module glsl-02-shaping-and-patterns
  "shaping-functions-and-2d-sdf",
  "gradients-patterns-tiling",
  "matrix-transforms-in-shaders",
  "shader-debugging-by-color",
  "checkpoint-pattern-tile-poster",

  // ── Track 3 · threejs ─────────────────────────────────────────────
  // module threejs-01-scene-fundamentals
  "scene-camera-renderer",
  "geometries-and-buffergeometry",
  "materials-from-basic-to-physical",
  "checkpoint-primitive-still-life",
  // module threejs-02-light-texture-assets
  "lights-and-shadow-maps",
  "textures-and-compression-ktx2",
  "loading-gltf-draco-meshopt",
  "checkpoint-gltf-viewer",
  // module threejs-03-motion-and-interaction
  "animation-mixer-and-clips",
  "raycasting-and-picking",
  "cameras-and-controls",
  "scene-graph-and-transforms",
  "reading-threejs-source",
  "checkpoint-interactive-showroom",

  // ── Track 4 · r3f ─────────────────────────────────────────────────
  // module r3f-01-mental-model
  "why-r3f-reconciler",
  "jsx-to-three-mapping",
  "r3f-core-hooks",
  "checkpoint-scene-rebuild-r3f",
  // module r3f-02-lifecycle-and-drei
  "disposal-and-memory-leaks",
  "drei-essentials",
  "memoizing-geometry-and-materials",
  "suspense-and-asset-loading",
  "checkpoint-asset-gallery",
  // module r3f-03-composition-and-tooling
  "portals-views-multi-canvas",
  "leva-debug-ui",
  "r3f-vs-vanilla-three",
  "checkpoint-mini-configurator",

  // ── Track 5 · gsap ────────────────────────────────────────────────
  // module gsap-01-core-animation
  "tweens-timelines-stagger",
  "easing-in-depth",
  "checkpoint-hero-intro-sequence",
  // module gsap-02-scroll-and-gesture
  "scrolltrigger-fundamentals",
  "scrolltrigger-plus-r3f-single-loop",
  "observer-and-draggable",
  "flip-layout-transitions",
  "splittext-typography",
  "checkpoint-scroll-section",
  // module gsap-03-animation-craft
  "choosing-your-animation-tool",
  "animation-principles-for-ui",
  "compositor-friendly-animation",
  "checkpoint-scrollytelling-page",

  // ── Track 6 · custom-shaders ──────────────────────────────────────
  // module custom-shaders-01-shadermaterial
  "shadermaterial-vs-rawshadermaterial",
  "three-injected-uniforms",
  "custom-geometry-attributes",
  "drei-shadermaterial-helper",
  "checkpoint-waving-flag",
  // module custom-shaders-02-hacking-materials
  "onbeforecompile",
  "three-shader-chunk-system",
  "instancedmesh-per-instance-attributes",
  "tsl-and-webgpu-outlook",
  "checkpoint-enhanced-standard-material",

  // ── Track 7 · procedural ──────────────────────────────────────────
  // module procedural-01-noise-foundations
  "hash-functions-on-gpu",
  "value-and-gradient-noise",
  "perlin-and-simplex-noise",
  "fbm-fractal-brownian-motion",
  "checkpoint-procedural-clouds",
  // module procedural-02-advanced-fields
  "domain-warping",
  "voronoi-and-worley",
  "curl-noise-flow-fields",
  "noise-in-3d-4d-time",
  "checkpoint-animated-terrain-material",

  // ── Track 8 · raymarching ─────────────────────────────────────────
  // module raymarching-01-sphere-tracing
  "sphere-tracing-principle",
  "sdf-primitives",
  "sdf-boolean-ops-smooth-min",
  "checkpoint-sdf-sculpture",
  // module raymarching-02-shading-the-field
  "sdf-normals-from-gradient",
  "raymarched-shadows-and-ao",
  "domain-repetition",
  "checkpoint-infinite-grid-world",
  // module raymarching-03-atmosphere-and-integration
  "fog-and-atmospheric-scattering",
  "volumetric-rendering-basics",
  "raymarching-optimization",
  "raymarch-raster-depth-integration",
  "checkpoint-raymarched-vista",

  // ── Track 9 · gpgpu ───────────────────────────────────────────────
  // module gpgpu-01-state-on-the-gpu
  "why-particles-live-on-gpu",
  "pingpong-fbo-state-textures",
  "gpucomputationrenderer",
  "transform-feedback",
  "checkpoint-100k-particle-grid",
  // module gpgpu-02-behaviors-at-scale
  "flow-field-particles",
  "boids-flocking-on-gpu",
  "instancing-a-million-objects",
  "checkpoint-interactive-particle-field",
  // module gpgpu-03-simulation (fully elective)
  "cloth-simulation-basics",
  "fluid-simulation-intro",
  "checkpoint-cloth-flag",

  // ── Track 10 · postprocessing ─────────────────────────────────────
  // module postprocessing-01-composer-and-effects
  "effectcomposer-and-passes",
  "bloom-done-right",
  "depth-of-field-and-motion-blur",
  "ssao",
  "checkpoint-cinematic-scene",
  // module postprocessing-02-grading-and-custom
  "stylistic-effects-grain-vignette",
  "color-grading-lut-tonemapping",
  "writing-custom-passes",
  "pass-order-and-fillrate",
  "checkpoint-signature-effect-stack",

  // ── Track 11 · pbr ────────────────────────────────────────────────
  // module pbr-01-brdf-theory
  "rendering-equation-intuition",
  "brdf-and-microfacets",
  "fresnel-and-schlick",
  "metalness-roughness-workflow",
  "checkpoint-material-study",
  // module pbr-02-image-based-lighting
  "ibl-irradiance-and-prefilter",
  "hdri-exposure-tonemapping",
  "shadow-techniques-pcf-vsm-csm",
  "area-lights-and-probes",
  "why-assets-look-like-plastic",
  "checkpoint-studio-lighting-setup",

  // ── Track 12 · performance ────────────────────────────────────────
  // module performance-01-measure-first
  "profiling-webgl-tools",
  "draw-calls-batching-instancing",
  "checkpoint-profile-and-fix",
  // module performance-02-scale-the-scene
  "culling-and-lod",
  "texture-memory-budget",
  "shader-compilation-stalls",
  "asset-pipeline-draco-ktx2",
  "checkpoint-asset-diet",
  // module performance-03-ship-to-production
  "mobile-tile-gpus-and-overdraw",
  "adaptive-quality-tiers",
  "dispose-and-leak-hunting",
  "nextjs-ssr-hydration-canvas",
  "checkpoint-mobile-ready-scene",

  // ── Track 13 · capstones ──────────────────────────────────────────
  // module capstones-01-projects (each unit = one capstone build)
  "capstone-scroll-product-showcase",
  "capstone-raymarched-landscape",
  "capstone-gpu-particle-system",
  "capstone-3d-portfolio",
] as const;

export type LessonSlug = (typeof LESSON_SLUGS)[number];
