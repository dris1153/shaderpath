import type { LessonMeta, ModuleDef, TrackDef } from "../types";

export const track: TrackDef = {
  id: "custom-shaders",
  order: 6,
  title: {
    vi: "Custom Shader trong Three.js",
    en: "Custom Shaders in Three.js",
  },
  summary: {
    vi: "ShaderMaterial, onBeforeCompile và hệ thống shader chunk — can thiệp vào material của Three mà vẫn giữ lighting.",
    en: "ShaderMaterial, onBeforeCompile and the shader chunk system — hacking Three's materials while keeping their lighting.",
  },
  moduleIds: [
    "custom-shaders-01-shadermaterial",
    "custom-shaders-02-hacking-materials",
  ],
};

export const modules: ModuleDef[] = [
  {
    id: "custom-shaders-01-shadermaterial",
    trackId: "custom-shaders",
    order: 1,
    title: { vi: "ShaderMaterial", en: "ShaderMaterial" },
    lessonSlugs: [
      "shadermaterial-vs-rawshadermaterial",
      "three-injected-uniforms",
      "custom-geometry-attributes",
      "drei-shadermaterial-helper",
      "checkpoint-waving-flag",
    ],
  },
  {
    id: "custom-shaders-02-hacking-materials",
    trackId: "custom-shaders",
    order: 2,
    title: {
      vi: "Hack material có sẵn",
      en: "Hacking Built-in Materials",
    },
    lessonSlugs: [
      "onbeforecompile",
      "three-shader-chunk-system",
      "instancedmesh-per-instance-attributes",
      "tsl-and-webgpu-outlook",
      "checkpoint-enhanced-standard-material",
    ],
  },
];

export const lessons: LessonMeta[] = [
  {
    slug: "shadermaterial-vs-rawshadermaterial",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-01-shadermaterial",
    order: 1,
    title: {
      vi: "ShaderMaterial vs RawShaderMaterial",
      en: "ShaderMaterial vs RawShaderMaterial",
    },
    summary: {
      vi: "ShaderMaterial cho bạn sẵn các khai báo built-in (projectionMatrix, uv, ...); RawShaderMaterial để bạn tự khai báo mọi thứ — hiểu ranh giới để chọn đúng.",
      en: "ShaderMaterial hands you built-in declarations (projectionMatrix, uv, ...) for free; RawShaderMaterial makes you declare everything — know the boundary to pick correctly.",
    },
    difficulty: 3,
    estimatedMinutes: 35,
    tags: ["shader", "threejs", "glsl"],
    tier: "core",
    kind: "lesson",
    prerequisites: ["checkpoint-scrollytelling-page"],
    objectives: {
      vi: [
        "Viết một ShaderMaterial tối thiểu với vertex/fragment shader tuỳ biến",
        "Liệt kê các khai báo Three tự thêm vào ShaderMaterial mà RawShaderMaterial không có",
        "Chọn RawShaderMaterial khi cần kiểm soát toàn bộ nguồn shader (ví dụ chia sẻ code với WebGL thuần)",
      ],
      en: [
        "Write a minimal ShaderMaterial with a custom vertex/fragment shader",
        "List the declarations Three auto-injects into ShaderMaterial that RawShaderMaterial lacks",
        "Choose RawShaderMaterial when full control over shader source is required (e.g. sharing code with raw WebGL)",
      ],
    },
    hasDemo: true,
    hasPlayground: true,
  },
  {
    slug: "three-injected-uniforms",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-01-shadermaterial",
    order: 2,
    title: {
      vi: "Uniform Three tự inject",
      en: "Three's Built-in Injected Uniforms",
    },
    summary: {
      vi: "modelMatrix, cameraPosition, resolution nội bộ — những uniform Three âm thầm cấp sẵn, và cách khai báo custom uniform sống cạnh chúng.",
      en: "modelMatrix, cameraPosition, internal resolution — the uniforms Three quietly provides, and how to declare custom uniforms alongside them.",
    },
    difficulty: 3,
    estimatedMinutes: 30,
    tags: ["shader", "threejs"],
    tier: "core",
    kind: "lesson",
    prerequisites: ["shadermaterial-vs-rawshadermaterial"],
    objectives: {
      vi: [
        "Liệt kê các uniform/attribute built-in mà Three tự truyền vào mọi ShaderMaterial",
        "Khai báo và cập nhật custom uniform (time, color, texture) từ JavaScript mỗi frame",
        "Tránh trùng tên giữa uniform tự khai báo và uniform built-in của Three",
      ],
      en: [
        "List the built-in uniforms/attributes Three automatically passes into every ShaderMaterial",
        "Declare and update custom uniforms (time, color, texture) from JavaScript each frame",
        "Avoid name collisions between custom uniforms and Three's built-ins",
      ],
    },
    hasDemo: true,
    hasPlayground: false,
  },
  {
    slug: "custom-geometry-attributes",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-01-shadermaterial",
    order: 3,
    title: {
      vi: "Attribute tuỳ biến trên geometry",
      en: "Custom Geometry Attributes",
    },
    summary: {
      vi: "Gắn thêm dữ liệu per-vertex (random seed, offset, weight) vào BufferGeometry rồi đọc chúng trong vertex shader như attribute bậc nhất.",
      en: "Attaching extra per-vertex data (random seed, offset, weight) onto BufferGeometry and reading it in the vertex shader as a first-class attribute.",
    },
    difficulty: 4,
    estimatedMinutes: 40,
    tags: ["shader", "glsl", "threejs"],
    tier: "core",
    kind: "lesson",
    prerequisites: ["three-injected-uniforms"],
    objectives: {
      vi: [
        "Tạo BufferAttribute tuỳ biến và gắn vào geometry bằng setAttribute",
        "Khai báo attribute tương ứng trong vertex shader và dùng nó để biến đổi vị trí/màu",
        "Giải thích vì sao attribute (per-vertex) khác uniform (per-draw-call)",
      ],
      en: [
        "Create a custom BufferAttribute and attach it to a geometry with setAttribute",
        "Declare the matching attribute in the vertex shader and use it to drive position/color",
        "Explain why attributes (per-vertex) differ from uniforms (per-draw-call)",
      ],
    },
    hasDemo: true,
    hasPlayground: true,
  },
  {
    slug: "drei-shadermaterial-helper",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-01-shadermaterial",
    order: 4,
    title: {
      vi: "Helper shaderMaterial của drei",
      en: "drei's shaderMaterial Helper",
    },
    summary: {
      vi: "drei's shaderMaterial() gói ShaderMaterial thành một R3F component có uniform tự động thành prop reactive — ít boilerplate, vẫn full control.",
      en: "drei's shaderMaterial() wraps ShaderMaterial into an R3F component with uniforms auto-mapped to reactive props — less boilerplate, still full control.",
    },
    difficulty: 3,
    estimatedMinutes: 30,
    tags: ["shader", "r3f", "threejs"],
    tier: "core",
    kind: "lesson",
    prerequisites: ["custom-geometry-attributes"],
    objectives: {
      vi: [
        "Tạo material bằng shaderMaterial() và đăng ký nó qua extend của R3F",
        "Truyền uniform như prop JSX thay vì set thủ công qua ref",
        "So sánh lợi ích/hạn chế của helper này so với ShaderMaterial thuần",
      ],
      en: [
        "Create a material with shaderMaterial() and register it via R3F's extend",
        "Pass uniforms as JSX props instead of setting them manually through a ref",
        "Compare this helper's benefits/limits against a plain ShaderMaterial",
      ],
    },
    hasDemo: true,
    hasPlayground: false,
  },
  {
    slug: "checkpoint-waving-flag",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-01-shadermaterial",
    order: 5,
    title: { vi: "Mini-build: Lá cờ bay", en: "Mini-build: Waving Flag" },
    summary: {
      vi: "Một lá cờ với vertex displacement điều khiển bởi custom uniform (thời gian, gió, biên độ) — tổng hợp toàn bộ module ShaderMaterial.",
      en: "A flag with vertex displacement driven by custom uniforms (time, wind, amplitude) — synthesizing the whole ShaderMaterial module.",
    },
    difficulty: 3,
    estimatedMinutes: 50,
    tags: ["shader", "glsl", "build"],
    tier: "core",
    kind: "checkpoint",
    prerequisites: ["drei-shadermaterial-helper"],
    objectives: {
      vi: [
        "Kết hợp custom uniform, custom attribute và vertex displacement trong một shader",
        "Tự đối chiếu kết quả với checklist trước khi xem đáp án",
      ],
      en: [
        "Combine custom uniforms, custom attributes and vertex displacement in one shader",
        "Self-verify the result against the checklist before reaching for the solution",
      ],
    },
    hasDemo: false,
    hasPlayground: false,
  },
  {
    slug: "onbeforecompile",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-02-hacking-materials",
    order: 6,
    title: { vi: "onBeforeCompile", en: "onBeforeCompile" },
    summary: {
      vi: "Hack thẳng vào source shader của MeshStandardMaterial trước khi compile — thêm hiệu ứng tuỳ biến mà vẫn giữ nguyên lighting và shadow có sẵn.",
      en: "Hacking directly into MeshStandardMaterial's shader source before it compiles — adding custom effects while keeping its lighting and shadows intact.",
    },
    difficulty: 4,
    estimatedMinutes: 45,
    tags: ["shader", "threejs", "glsl"],
    tier: "core",
    kind: "lesson",
    prerequisites: ["checkpoint-waving-flag"],
    objectives: {
      vi: [
        "Dùng onBeforeCompile để chèn code vào vertex/fragment shader của một material built-in",
        "Giữ nguyên lighting/shadow pipeline trong khi thêm hiệu ứng tuỳ biến",
        "Giải thích vì sao cần customProgramCacheKey khi uniform ảnh hưởng đến biến thể shader",
      ],
      en: [
        "Use onBeforeCompile to inject code into a built-in material's vertex/fragment shader",
        "Preserve the lighting/shadow pipeline while adding a custom effect",
        "Explain why customProgramCacheKey is needed when a uniform affects shader variants",
      ],
    },
    hasDemo: true,
    hasPlayground: true,
  },
  {
    slug: "three-shader-chunk-system",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-02-hacking-materials",
    order: 7,
    title: {
      vi: "Hệ thống shader chunk của Three",
      en: "Three's Shader Chunk System",
    },
    summary: {
      vi: "Shader built-in của Three được lắp ráp từ hàng chục chunk qua #include — biết tên chunk đúng là chìa khoá để chèn code vào đúng chỗ.",
      en: "Three's built-in shaders are assembled from dozens of chunks via #include — knowing the right chunk name is the key to injecting code in the right place.",
    },
    difficulty: 4,
    estimatedMinutes: 40,
    tags: ["shader", "glsl", "threejs"],
    tier: "core",
    kind: "lesson",
    prerequisites: ["onbeforecompile"],
    objectives: {
      vi: [
        "Đọc cấu trúc #include trong shader built-in và định vị chunk cần sửa",
        "Ghi đè một chunk qua THREE.ShaderChunk và hiểu phạm vi ảnh hưởng toàn cục của nó",
        "Kết hợp #include chèn thêm với onBeforeCompile để tuỳ biến có kiểm soát",
      ],
      en: [
        "Read the #include structure in built-in shaders and locate the chunk to modify",
        "Override a chunk via THREE.ShaderChunk and understand its global effect",
        "Combine injected #include chunks with onBeforeCompile for controlled customization",
      ],
    },
    hasDemo: true,
    hasPlayground: true,
  },
  {
    slug: "instancedmesh-per-instance-attributes",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-02-hacking-materials",
    order: 8,
    title: {
      vi: "InstancedMesh & attribute per-instance",
      en: "InstancedMesh & Per-Instance Attributes",
    },
    summary: {
      vi: "InstancedMesh vẽ hàng ngàn bản sao trong một draw call — thêm attribute per-instance để mỗi bản sao có màu, offset hay pha animation riêng.",
      en: "InstancedMesh draws thousands of copies in one draw call — adding per-instance attributes gives each copy its own color, offset or animation phase.",
    },
    difficulty: 4,
    estimatedMinutes: 40,
    tags: ["shader", "threejs", "perf"],
    tier: "core",
    kind: "lesson",
    prerequisites: ["three-shader-chunk-system"],
    objectives: {
      vi: [
        "Dựng InstancedMesh và set instanceMatrix cho từng bản sao",
        "Thêm InstancedBufferAttribute per-instance và đọc nó trong vertex shader",
        "Giải thích lợi ích draw-call so với việc tạo N mesh riêng lẻ",
      ],
      en: [
        "Build an InstancedMesh and set instanceMatrix per copy",
        "Add a per-instance InstancedBufferAttribute and read it in the vertex shader",
        "Explain the draw-call benefit versus creating N separate meshes",
      ],
    },
    hasDemo: true,
    hasPlayground: false,
  },
  {
    slug: "tsl-and-webgpu-outlook",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-02-hacking-materials",
    order: 9,
    title: {
      vi: "TSL và tương lai WebGPU",
      en: "TSL and the WebGPU Outlook",
    },
    summary: {
      vi: "Three Shading Language biên dịch cùng một node graph ra cả GLSL và WGSL — cái nhìn trước về hướng đi khi WebGPU trở thành mặc định.",
      en: "Three Shading Language compiles one node graph down to both GLSL and WGSL — a preview of where things head as WebGPU becomes the default.",
    },
    difficulty: 4,
    estimatedMinutes: 30,
    tags: ["shader", "threejs", "tooling"],
    tier: "elective",
    kind: "lesson",
    prerequisites: ["three-shader-chunk-system"],
    objectives: {
      vi: [
        "Viết một node shader đơn giản bằng TSL và so sánh với GLSL tương đương",
        "Giải thích vì sao TSL tách biệt logic shader khỏi backend WebGL/WebGPU",
        "Đánh giá khi nào nên bắt đầu dùng TSL cho project mới",
      ],
      en: [
        "Write a simple node shader with TSL and compare it to the equivalent GLSL",
        "Explain why TSL decouples shader logic from the WebGL/WebGPU backend",
        "Assess when it makes sense to start a new project with TSL",
      ],
    },
    hasDemo: true,
    hasPlayground: false,
  },
  {
    slug: "checkpoint-enhanced-standard-material",
    trackId: "custom-shaders",
    moduleId: "custom-shaders-02-hacking-materials",
    order: 10,
    title: {
      vi: "Mini-build: MeshStandardMaterial nâng cấp",
      en: "Mini-build: Enhanced Standard Material",
    },
    summary: {
      vi: "Chèn một hiệu ứng tuỳ biến (ví dụ dissolve hoặc rim glow) vào MeshStandardMaterial qua onBeforeCompile mà lighting và shadow vẫn nguyên vẹn.",
      en: "Inject a custom effect (e.g. dissolve or rim glow) into MeshStandardMaterial via onBeforeCompile while lighting and shadows stay intact.",
    },
    difficulty: 4,
    estimatedMinutes: 55,
    tags: ["shader", "threejs", "build"],
    tier: "core",
    kind: "checkpoint",
    prerequisites: ["instancedmesh-per-instance-attributes"],
    objectives: {
      vi: [
        "Kết hợp onBeforeCompile và shader chunk system để nâng cấp một material có sẵn",
        "Chứng minh lighting/shadow không bị phá vỡ sau khi chèn hiệu ứng tuỳ biến",
      ],
      en: [
        "Combine onBeforeCompile and the shader chunk system to upgrade a built-in material",
        "Prove lighting/shadows remain intact after injecting the custom effect",
      ],
    },
    hasDemo: false,
    hasPlayground: false,
  },
];
