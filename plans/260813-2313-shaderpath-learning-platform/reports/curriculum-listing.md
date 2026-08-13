# Shaderpath Curriculum — Danh sách đầy đủ (Phase 2)

> Slug bị ĐÓNG BĂNG từ thời điểm này (D9) — đổi tên sau sẽ gãy notes/bookmarks.
> 🔨 = Mini-build checkpoint · ⭐ = Elective (không chặn unlock)

## Track 0 — Nền tảng Toán học cho đồ hoạ · 14 units (10 core, 3 build, 1 elective) · ~9h

### Không gian & Vector

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Toạ độ Descartes & UV space | `cartesian-and-uv-space` | core | 25 | 1/5 |
| 2 | Vector cơ bản | `vector-basics` | core | 30 | 1/5 |
| 3 | Dot, Cross & Normalize | `dot-and-cross-products` | core | 40 | 2/5 |
| 4 | Mini-build: Đồng hồ vector | `checkpoint-vector-clock` | 🔨 | 45 | 2/5 |

### Ma trận & Transform

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 5 | Ma trận 2x2 & 3x3 | `matrix-basics` | core | 40 | 2/5 |
| 6 | Toạ độ đồng nhất & ma trận 4x4 | `homogeneous-coordinates-4x4` | core | 40 | 3/5 |
| 7 | Model → View → Projection | `model-view-projection` | core | 45 | 3/5 |
| 8 | Mini-build: Cube 3D tự chiếu | `checkpoint-wireframe-cube` | 🔨 | 60 | 3/5 |

### Xoay, Nội suy & Màu

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 9 | Euler angles & gimbal lock | `euler-angles-and-gimbal-lock` | core | 35 | 3/5 |
| 10 | Quaternion | `quaternions` | ⭐ | 45 | 4/5 |
| 11 | Lượng giác cho animation | `trigonometry-for-animation` | core | 30 | 2/5 |
| 12 | Nội suy & easing | `interpolation-and-easing` | core | 35 | 2/5 |
| 13 | sRGB, linear & gamma | `srgb-linear-and-gamma` | core | 30 | 3/5 |
| 14 | Mini-build: Quỹ đạo & nhịp đập | `checkpoint-orbit-animation` | 🔨 | 60 | 3/5 |

## Track 1 — WebGL Thuần · 15 units (11 core, 3 build, 1 elective) · ~9h

### Pipeline & Context

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | WebGL là gì (và không là gì) | `what-webgl-is-and-isnt` | core | 25 | 2/5 |
| 2 | Rendering pipeline từ A đến Z | `rendering-pipeline-a-to-z` | core | 35 | 2/5 |
| 3 | Canvas, context & devicePixelRatio | `canvas-context-and-dpr` | core | 30 | 2/5 |
| 4 | Mini-build: Canvas full-screen tự resize | `checkpoint-responsive-clear` | 🔨 | 45 | 2/5 |

### Tam giác đầu tiên

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 5 | Buffer: VBO & VAO | `buffers-vbo-vao` | core | 35 | 2/5 |
| 6 | Vertex shader, fragment shader & rasterization | `vertex-fragment-rasterization` | core | 35 | 2/5 |
| 7 | Attribute, uniform & varying | `attributes-uniforms-varyings` | core | 30 | 2/5 |
| 8 | Tam giác đầu tiên bằng WebGL2 thuần | `first-triangle-webgl2` | core | 40 | 2/5 |
| 9 | Mini-build: Quad động 2 tam giác | `checkpoint-animated-quad` | 🔨 | 50 | 2/5 |

### GPU State & Memory

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 10 | Texture: upload & sampling | `textures-upload-and-sampling` | core | 35 | 2/5 |
| 11 | Framebuffer & render-to-texture | `framebuffers-render-to-texture` | core | 40 | 3/5 |
| 12 | Depth buffer & z-fighting | `depth-buffer-and-z-fighting` | core | 30 | 3/5 |
| 13 | Blending & alpha | `blending-and-alpha` | core | 30 | 2/5 |
| 14 | WebGL1 vs WebGL2 vs WebGPU | `webgl-vs-webgpu-landscape` | ⭐ | 25 | 2/5 |
| 15 | Mini-build: Render-to-texture & tint pass | `checkpoint-render-to-texture-tint` | 🔨 | 55 | 3/5 |

## Track 2 — GLSL Fundamentals · 10 units (8 core, 2 build, 0 elective) · ~6h

### Ngôn ngữ của GPU

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Cú pháp GLSL, kiểu dữ liệu & swizzling | `glsl-syntax-types-swizzling` | core | 30 | 2/5 |
| 2 | Precision qualifier | `precision-qualifiers` | core | 25 | 2/5 |
| 3 | Hàm dựng sẵn của GLSL | `glsl-builtin-functions` | core | 35 | 2/5 |
| 4 | Cái giá của branching trên GPU | `branching-cost-on-gpu` | core | 35 | 3/5 |
| 5 | Mini-build: Gradient palette bằng cosine | `checkpoint-gradient-palette` | 🔨 | 50 | 3/5 |

### Shaping & Patterns

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 6 | Shaping function & 2D SDF | `shaping-functions-and-2d-sdf` | core | 40 | 3/5 |
| 7 | Gradient, pattern & tiling | `gradients-patterns-tiling` | core | 35 | 2/5 |
| 8 | Ma trận biến đổi trong shader | `matrix-transforms-in-shaders` | core | 35 | 3/5 |
| 9 | Debug shader bằng màu | `shader-debugging-by-color` | core | 25 | 2/5 |
| 10 | Mini-build: Poster pattern lát gạch động | `checkpoint-pattern-tile-poster` | 🔨 | 55 | 3/5 |

## Track 3 — Three.js Core · 14 units (11 core, 3 build, 0 elective) · ~9h

### Scene căn bản

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Scene, Camera & Renderer | `scene-camera-renderer` | core | 30 | 2/5 |
| 2 | Geometry & BufferGeometry | `geometries-and-buffergeometry` | core | 35 | 2/5 |
| 3 | Material: từ Basic đến Physical | `materials-from-basic-to-physical` | core | 40 | 3/5 |
| 4 | Mini-build: Tĩnh vật từ hình khối cơ bản | `checkpoint-primitive-still-life` | 🔨 | 50 | 3/5 |

### Ánh sáng, Texture & Asset

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 5 | Ánh sáng & shadow map | `lights-and-shadow-maps` | core | 40 | 3/5 |
| 6 | Texture & nén KTX2 | `textures-and-compression-ktx2` | core | 35 | 2/5 |
| 7 | Load GLTF với Draco & meshopt | `loading-gltf-draco-meshopt` | core | 40 | 2/5 |
| 8 | Mini-build: GLTF Viewer | `checkpoint-gltf-viewer` | 🔨 | 55 | 3/5 |

### Chuyển động & Tương tác

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 9 | AnimationMixer & clip | `animation-mixer-and-clips` | core | 35 | 2/5 |
| 10 | Raycasting & picking | `raycasting-and-picking` | core | 30 | 2/5 |
| 11 | Camera & controls | `cameras-and-controls` | core | 30 | 2/5 |
| 12 | Scene graph & transform hierarchy | `scene-graph-and-transforms` | core | 35 | 2/5 |
| 13 | Đọc source Three.js: WebGLRenderer & Object3D | `reading-threejs-source` | core | 45 | 3/5 |
| 14 | Mini-build: Showroom tương tác | `checkpoint-interactive-showroom` | 🔨 | 60 | 3/5 |

## Track 4 — React Three Fiber · 13 units (9 core, 3 build, 1 elective) · ~8h

### Mental model

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Vì sao R3F tồn tại: reconciler, không phải wrapper | `why-r3f-reconciler` | core | 30 | 3/5 |
| 2 | JSX ↔ Three.js mapping | `jsx-to-three-mapping` | core | 30 | 3/5 |
| 3 | Hook cốt lõi: useFrame, useThree, useLoader | `r3f-core-hooks` | core | 35 | 3/5 |
| 4 | Mini-build: Dựng lại showroom bằng R3F | `checkpoint-scene-rebuild-r3f` | 🔨 | 50 | 3/5 |

### Vòng đời & drei

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 5 | Disposal & memory leak | `disposal-and-memory-leaks` | core | 35 | 3/5 |
| 6 | drei essentials | `drei-essentials` | core | 30 | 3/5 |
| 7 | Memoize geometry & material | `memoizing-geometry-and-materials` | core | 30 | 3/5 |
| 8 | Suspense & load asset | `suspense-and-asset-loading` | core | 30 | 3/5 |
| 9 | Mini-build: Asset gallery | `checkpoint-asset-gallery` | 🔨 | 55 | 3/5 |

### Composition & Tooling

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 10 | Portal, View & multi-canvas | `portals-views-multi-canvas` | core | 35 | 3/5 |
| 11 | Leva debug UI | `leva-debug-ui` | ⭐ | 25 | 3/5 |
| 12 | R3F vs Three.js thuần: khi nào dùng cái nào | `r3f-vs-vanilla-three` | core | 30 | 3/5 |
| 13 | Mini-build: Product configurator nhỏ | `checkpoint-mini-configurator` | 🔨 | 60 | 3/5 |

## Track 5 — GSAP & Animation Nâng cao · 13 units (9 core, 3 build, 1 elective) · ~8h

### Animation lõi

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Tween, Timeline & Stagger | `tweens-timelines-stagger` | core | 35 | 3/5 |
| 2 | Easing chuyên sâu | `easing-in-depth` | core | 30 | 3/5 |
| 3 | Mini-build: Chuỗi intro hero | `checkpoint-hero-intro-sequence` | 🔨 | 50 | 3/5 |

### Scroll & Cử chỉ

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 4 | ScrollTrigger cơ bản | `scrolltrigger-fundamentals` | core | 40 | 3/5 |
| 5 | ScrollTrigger + R3F: một render loop duy nhất | `scrolltrigger-plus-r3f-single-loop` | core | 45 | 4/5 |
| 6 | Observer & Draggable | `observer-and-draggable` | core | 30 | 3/5 |
| 7 | FLIP cho chuyển layout | `flip-layout-transitions` | core | 35 | 3/5 |
| 8 | SplitText cho Typography | `splittext-typography` | ⭐ | 30 | 3/5 |
| 9 | Mini-build: Section cuộn ghim có 3D | `checkpoint-scroll-section` | 🔨 | 55 | 4/5 |

### Nghề animation

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 10 | Chọn công cụ animation | `choosing-your-animation-tool` | core | 30 | 3/5 |
| 11 | Nguyên tắc animation cho UI | `animation-principles-for-ui` | core | 30 | 3/5 |
| 12 | Animation thân thiện compositor | `compositor-friendly-animation` | core | 30 | 3/5 |
| 13 | Mini-build: Trang scrollytelling | `checkpoint-scrollytelling-page` | 🔨 | 60 | 4/5 |

## Track 6 — Custom Shader trong Three.js · 10 units (7 core, 2 build, 1 elective) · ~7h

### ShaderMaterial

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | ShaderMaterial vs RawShaderMaterial | `shadermaterial-vs-rawshadermaterial` | core | 35 | 3/5 |
| 2 | Uniform Three tự inject | `three-injected-uniforms` | core | 30 | 3/5 |
| 3 | Attribute tuỳ biến trên geometry | `custom-geometry-attributes` | core | 40 | 4/5 |
| 4 | Helper shaderMaterial của drei | `drei-shadermaterial-helper` | core | 30 | 3/5 |
| 5 | Mini-build: Lá cờ bay | `checkpoint-waving-flag` | 🔨 | 50 | 3/5 |

### Hack material có sẵn

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 6 | onBeforeCompile | `onbeforecompile` | core | 45 | 4/5 |
| 7 | Hệ thống shader chunk của Three | `three-shader-chunk-system` | core | 40 | 4/5 |
| 8 | InstancedMesh & attribute per-instance | `instancedmesh-per-instance-attributes` | core | 40 | 4/5 |
| 9 | TSL và tương lai WebGPU | `tsl-and-webgpu-outlook` | ⭐ | 30 | 4/5 |
| 10 | Mini-build: MeshStandardMaterial nâng cấp | `checkpoint-enhanced-standard-material` | 🔨 | 55 | 4/5 |

## Track 7 — Procedural & Noise · 10 units (8 core, 2 build, 0 elective) · ~7h

### Nền tảng noise

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Hash function trên GPU | `hash-functions-on-gpu` | core | 30 | 3/5 |
| 2 | Value noise & Gradient noise | `value-and-gradient-noise` | core | 35 | 3/5 |
| 3 | Perlin & Simplex noise | `perlin-and-simplex-noise` | core | 40 | 4/5 |
| 4 | FBM — Fractal Brownian Motion | `fbm-fractal-brownian-motion` | core | 40 | 4/5 |
| 5 | Mini-build: Mây thủ tục | `checkpoint-procedural-clouds` | 🔨 | 55 | 4/5 |

### Trường nâng cao

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 6 | Domain warping | `domain-warping` | core | 40 | 4/5 |
| 7 | Voronoi & Worley noise | `voronoi-and-worley` | core | 40 | 4/5 |
| 8 | Curl noise & flow field | `curl-noise-flow-fields` | core | 40 | 4/5 |
| 9 | Noise 3D/4D theo thời gian | `noise-in-3d-4d-time` | core | 30 | 3/5 |
| 10 | Mini-build: Vật liệu địa hình động | `checkpoint-animated-terrain-material` | 🔨 | 55 | 4/5 |

## Track 8 — Raymarching & SDF · 13 units (8 core, 3 build, 2 elective) · ~9h

### Sphere tracing

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Nguyên lý sphere tracing | `sphere-tracing-principle` | core | 40 | 4/5 |
| 2 | SDF nguyên thuỷ | `sdf-primitives` | core | 35 | 4/5 |
| 3 | Phép boolean SDF & smooth min | `sdf-boolean-ops-smooth-min` | core | 35 | 4/5 |
| 4 | Mini-build: Điêu khắc SDF | `checkpoint-sdf-sculpture` | 🔨 | 50 | 4/5 |

### Shading trường khoảng cách

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 5 | Tính normal từ gradient SDF | `sdf-normals-from-gradient` | core | 35 | 4/5 |
| 6 | Bóng mềm & AO trong raymarch | `raymarched-shadows-and-ao` | core | 40 | 4/5 |
| 7 | Lặp không gian (domain repetition) | `domain-repetition` | core | 35 | 4/5 |
| 8 | Mini-build: Thế giới lưới vô hạn | `checkpoint-infinite-grid-world` | 🔨 | 55 | 4/5 |

### Khí quyển & Tích hợp

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 9 | Fog & tán xạ khí quyển | `fog-and-atmospheric-scattering` | core | 30 | 4/5 |
| 10 | Cơ bản render thể tích | `volumetric-rendering-basics` | ⭐ | 45 | 5/5 |
| 11 | Tối ưu raymarching | `raymarching-optimization` | core | 40 | 4/5 |
| 12 | Tích hợp raymarch với depth rasterized | `raymarch-raster-depth-integration` | ⭐ | 45 | 5/5 |
| 13 | Mini-build: Toàn cảnh raymarch | `checkpoint-raymarched-vista` | 🔨 | 60 | 5/5 |

## Track 9 — GPGPU, Particles & Simulation · 12 units (5 core, 3 build, 5 elective) · ~9h

### Trạng thái trên GPU

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Vì sao particle phải sống trên GPU | `why-particles-live-on-gpu` | core | 30 | 4/5 |
| 2 | Ping-pong FBO & texture trạng thái | `pingpong-fbo-state-textures` | core | 45 | 4/5 |
| 3 | GPUComputationRenderer | `gpucomputationrenderer` | core | 40 | 4/5 |
| 4 | Transform feedback (WebGL2) | `transform-feedback` | ⭐ | 40 | 5/5 |
| 5 | Mini-build: Lưới 100k particle | `checkpoint-100k-particle-grid` | 🔨 | 55 | 5/5 |

### Hành vi ở quy mô lớn

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 6 | Particle theo flow field | `flow-field-particles` | core | 40 | 4/5 |
| 7 | Boids flocking trên GPU | `boids-flocking-on-gpu` | ⭐ | 45 | 5/5 |
| 8 | Instancing hàng triệu object | `instancing-a-million-objects` | core | 40 | 4/5 |
| 9 | Mini-build: Trường particle tương tác | `checkpoint-interactive-particle-field` | 🔨 | 55 | 5/5 |

### Mô phỏng

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 10 | Cơ bản mô phỏng vải | `cloth-simulation-basics` | ⭐ | 45 | 5/5 |
| 11 | Giới thiệu mô phỏng chất lỏng | `fluid-simulation-intro` | ⭐ | 35 | 5/5 |
| 12 | Mini-build: Lá cờ vải mô phỏng | `checkpoint-cloth-flag` | 🔨⭐ | 60 | 5/5 |

## Track 10 — Post-processing · 10 units (8 core, 2 build, 0 elective) · ~7h

### Composer & Hiệu ứng lõi

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | EffectComposer & Render Pass | `effectcomposer-and-passes` | core | 30 | 3/5 |
| 2 | Bloom làm đúng cách | `bloom-done-right` | core | 35 | 3/5 |
| 3 | Depth of Field & Motion Blur | `depth-of-field-and-motion-blur` | core | 40 | 4/5 |
| 4 | SSAO — Ambient Occlusion không gian màn hình | `ssao` | core | 40 | 4/5 |
| 5 | Mini-build: Cảnh điện ảnh | `checkpoint-cinematic-scene` | 🔨 | 55 | 4/5 |

### Grading & Pass tự viết

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 6 | Hiệu ứng phong cách: Grain, Vignette, Chromatic Aberration | `stylistic-effects-grain-vignette` | core | 30 | 3/5 |
| 7 | Color Grading, LUT & Tone Mapping | `color-grading-lut-tonemapping` | core | 40 | 4/5 |
| 8 | Tự viết Custom Pass | `writing-custom-passes` | core | 45 | 4/5 |
| 9 | Thứ tự Pass & Chi phí Fillrate | `pass-order-and-fillrate` | core | 30 | 3/5 |
| 10 | Mini-build: Bộ hiệu ứng chữ ký | `checkpoint-signature-effect-stack` | 🔨 | 60 | 4/5 |

## Track 11 — PBR & Lighting Theory · 11 units (8 core, 2 build, 1 elective) · ~8h

### Lý thuyết BRDF

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Trực giác về Rendering Equation | `rendering-equation-intuition` | core | 40 | 4/5 |
| 2 | BRDF & Mô hình Microfacet | `brdf-and-microfacets` | core | 45 | 4/5 |
| 3 | Fresnel & Xấp xỉ Schlick | `fresnel-and-schlick` | core | 35 | 4/5 |
| 4 | Metalness/Roughness Workflow | `metalness-roughness-workflow` | core | 35 | 4/5 |
| 5 | Mini-build: Nghiên cứu vật liệu | `checkpoint-material-study` | 🔨 | 50 | 4/5 |

### Ánh sáng từ ảnh

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 6 | IBL: Irradiance Map & Prefiltered Environment | `ibl-irradiance-and-prefilter` | core | 45 | 4/5 |
| 7 | HDRI, Exposure & Tone Mapping | `hdri-exposure-tonemapping` | core | 35 | 4/5 |
| 8 | Kỹ thuật đổ bóng: PCF, VSM, CSM | `shadow-techniques-pcf-vsm-csm` | core | 45 | 4/5 |
| 9 | Area Light & Light Probe | `area-lights-and-probes` | ⭐ | 30 | 4/5 |
| 10 | Vì sao Asset của bạn trông như Nhựa | `why-assets-look-like-plastic` | core | 30 | 4/5 |
| 11 | Mini-build: Dựng Studio Lighting | `checkpoint-studio-lighting-setup` | 🔨 | 60 | 4/5 |

## Track 12 — Performance & Production · 13 units (10 core, 3 build, 0 elective) · ~9h

### Đo trước đã

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Công cụ Profiling cho WebGL | `profiling-webgl-tools` | core | 30 | 3/5 |
| 2 | Draw Call, Batching & Instancing | `draw-calls-batching-instancing` | core | 40 | 4/5 |
| 3 | Mini-build: Profile & Sửa cảnh chậm | `checkpoint-profile-and-fix` | 🔨 | 55 | 4/5 |

### Scale cảnh

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 4 | Culling & LOD | `culling-and-lod` | core | 40 | 4/5 |
| 5 | Ngân sách Bộ nhớ Texture | `texture-memory-budget` | core | 30 | 3/5 |
| 6 | Đứng hình do Compile Shader | `shader-compilation-stalls` | core | 30 | 3/5 |
| 7 | Asset Pipeline: Draco & KTX2 | `asset-pipeline-draco-ktx2` | core | 35 | 3/5 |
| 8 | Mini-build: Asset Diet | `checkpoint-asset-diet` | 🔨 | 55 | 4/5 |

### Ship ra production

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 9 | GPU Mobile dạng Tile & Overdraw | `mobile-tile-gpus-and-overdraw` | core | 35 | 4/5 |
| 10 | Adaptive Quality Tier | `adaptive-quality-tiers` | core | 40 | 4/5 |
| 11 | Dispose & Săn Memory Leak | `dispose-and-leak-hunting` | core | 35 | 3/5 |
| 12 | Next.js SSR, Hydration & Canvas | `nextjs-ssr-hydration-canvas` | core | 40 | 3/5 |
| 13 | Mini-build: Cảnh sẵn sàng cho Mobile | `checkpoint-mobile-ready-scene` | 🔨 | 60 | 4/5 |

## Track 13 — Capstone Projects · 4 units (0 core, 4 build, 0 elective) · ~32h

### Bốn dự án tổng kết

| # | Bài | Slug | Loại | Phút | Khó |
|--:|---|---|---|--:|--:|
| 1 | Capstone: Trang giới thiệu sản phẩm cuộn trang | `capstone-scroll-product-showcase` | 🔨 | 480 | 5/5 |
| 2 | Capstone: Địa hình Raymarch | `capstone-raymarched-landscape` | 🔨 | 480 | 5/5 |
| 3 | Capstone: Hệ Particle GPU Tương tác | `capstone-gpu-particle-system` | 🔨 | 480 | 5/5 |
| 4 | Capstone: Portfolio 3D | `capstone-3d-portfolio` | 🔨 | 480 | 5/5 |

---

**Tổng:** 162 units = 112 core lessons + 38 mini-builds + 13 electives · 35 modules · 14 tracks · ~136h (capstones tính 8h/dự án)
