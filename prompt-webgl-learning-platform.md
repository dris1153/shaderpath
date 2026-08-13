# PROMPT: Xây dựng "Shaderpath" — Learning Platform cho Frontend Dev bước vào thế giới 3D & Shader

> Dán toàn bộ file này vào Claude Code / Cursor / agent của bạn làm spec gốc. Các mục được đánh số để bạn có thể ra lệnh theo phase (`"Làm Phase 2"`).

---

## 0. TÓM TẮT

Xây dựng một **web app học tập cá nhân (self-hosted, single-user)** tên là **Shaderpath** — lộ trình học có cấu trúc đưa một frontend developer từ zero đến thành thạo Three.js, WebGL, GLSL, GSAP và animation nâng cao.

Nguyên tắc cốt lõi:

- **Nội dung bài học = hardcode trong repo** (TypeScript/MDX modules). Không có CMS, không fetch từ đâu cả.
- **SQLite = chỉ lưu tiến độ học tập của người dùng.** Không lưu nội dung bài học.
- **UI = shadcn/ui thuần.** Không viết custom component design system. Chỉ compose các primitive có sẵn. Không tự chế màu, không tự chế spacing scale — dùng đúng design token của shadcn.
- **Đa ngôn ngữ ngay từ đầu**: `vi` (mặc định) và `en`. Cả UI chrome lẫn nội dung bài học đều phải song ngữ. Kiến trúc phải cho phép thêm ngôn ngữ thứ 3 mà không refactor.
- Mỗi bài học gồm 4 phần bắt buộc: **Lý thuyết → Trích dẫn nguồn → Demo tương tác → Bài tập**.

---

## 1. TECH STACK (cố định, không thay thế)

| Layer           | Lựa chọn                                                   | Ghi chú                                                     |
| --------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Framework       | **Next.js 15 (App Router, TypeScript strict)**             | Server Components cho content, Client Components cho canvas |
| UI              | **shadcn/ui + Tailwind CSS v4**                            | Cài qua CLI. Chỉ dùng component có sẵn.                     |
| Icons           | **tabler-icon**                                            |                                                             |
| i18n            | **next-intl**                                              | Routing dạng `/[locale]/...`                                |
| DB              | **SQLite (better-sqlite3)**                                | File `./data/progress.db`, sync driver, chạy server-side    |
| ORM             | **Drizzle ORM + drizzle-kit**                              | Migration versioned, commit vào repo                        |
| 3D              | **three** + **@react-three/fiber** + **@react-three/drei** |                                                             |
| Post-processing | **@react-three/postprocessing** (postprocessing lib)       |                                                             |
| Animation       | **gsap** (+ ScrollTrigger, Observer, Flip)                 |                                                             |
| Code editor     | **@monaco-editor/react**                                   | Cho GLSL playground, có syntax highlight GLSL               |
| Markdown        | **MDX (next-mdx-remote hoặc @next/mdx)**                   | Cho phép nhúng React component vào bài học                  |
| Math render     | **KaTeX** (rehype-katex + remark-math)                     | Bắt buộc — nội dung có nhiều công thức                      |
| Code highlight  | **shiki**                                                  | Hỗ trợ GLSL grammar                                         |
| State           | **zustand**                                                | Chỉ cho UI ephemeral state (playground, panel toggle)       |
| Server state    | **TanStack Query**                                         | Cho progress read/write                                     |
| Test            | **vitest** + **playwright** (smoke test route)             |                                                             |

**Không dùng:** Redux, styled-components, MUI, custom CSS framework, Prisma, Supabase, bất kỳ backend ngoài.

---

## 2. KIẾN TRÚC THƯ MỤC

```
shaderpath/
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx                    # Dashboard: tiến độ tổng quan
│       ├── roadmap/page.tsx            # Bản đồ lộ trình (graph view)
│       ├── track/[trackSlug]/page.tsx  # Danh sách module trong track
│       ├── lesson/[lessonSlug]/page.tsx
│       ├── playground/page.tsx         # GLSL sandbox độc lập
│       ├── notes/page.tsx              # Ghi chú cá nhân đã lưu
│       └── stats/page.tsx              # Heatmap, streak, thời gian học
├── content/
│   ├── curriculum.ts                   # Cây lộ trình: track → module → lesson (metadata)
│   ├── lessons/
│   │   ├── 01-math/
│   │   │   ├── vectors/
│   │   │   │   ├── meta.ts             # LessonMeta (typed)
│   │   │   │   ├── theory.vi.mdx
│   │   │   │   ├── theory.en.mdx
│   │   │   │   ├── exercises.ts        # Exercise[] song ngữ
│   │   │   │   ├── demo.tsx            # React component demo tương tác
│   │   │   │   └── references.ts       # Citation[]
│   │   │   └── ...
│   │   └── ...
│   └── i18n/
│       ├── vi.json                     # UI strings
│       └── en.json
├── components/
│   ├── ui/                             # shadcn generated — KHÔNG SỬA
│   ├── lesson/                         # Compose từ ui/
│   ├── playground/
│   └── viz/                            # Wrapper R3F dùng chung
├── db/
│   ├── schema.ts
│   ├── client.ts
│   └── migrations/
├── lib/
│   ├── progress.ts                     # Server actions
│   ├── curriculum.ts                   # Query helper, tính % hoàn thành, unlock logic
│   └── srs.ts                          # Spaced repetition
└── data/progress.db                    # gitignored
```

---

## 3. MÔ HÌNH NỘI DUNG (Content Model)

### 3.1 Kiểu dữ liệu

```ts
type Locale = "vi" | "en";
type Localized<T> = Record<Locale, T>;

interface LessonMeta {
  slug: string; // unique toàn hệ thống, kebab-case
  trackId: string;
  moduleId: string;
  order: number;
  title: Localized<string>;
  summary: Localized<string>; // 1–2 câu
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  tags: string[]; // 'glsl' | 'r3f' | 'math' | 'perf' | ...
  prerequisites: string[]; // slug của lesson khác → dùng cho unlock logic
  objectives: Localized<string[]>; // "Sau bài này bạn sẽ..."
  hasDemo: boolean;
  hasPlayground: boolean; // có GLSL editor nhúng không
}

interface Citation {
  id: string;
  type: "book" | "paper" | "article" | "spec" | "video" | "repo";
  title: string;
  authors?: string[];
  year?: number;
  url?: string;
  note?: Localized<string>; // vì sao nên đọc cái này
}

interface Exercise {
  id: string;
  kind: "concept" | "code" | "shader" | "build";
  prompt: Localized<string>; // MDX string
  starterCode?: string;
  solutionCode?: string; // hiện sau khi user tự đánh dấu "đã thử"
  hints: Localized<string>[]; // hiện tuần tự, mỗi lần 1 hint
  checklist: Localized<string>[]; // self-assessment sau khi làm xong
  referenceImage?: string; // ảnh output đúng, để so sánh bằng mắt
}
```

### 3.2 Quy tắc viết bài học

- Lý thuyết viết **prose thật sự**, không phải bullet list rời rạc. Giải thích _tại sao_, không chỉ _cách làm_.
- Mọi công thức toán dùng KaTeX. Ví dụ: chuyển từ world space sang clip space phải viết rõ chuỗi nhân ma trận, không nói suông.
- Mỗi bài **tối thiểu 2 citation thật** (có URL kiểm chứng được). Ưu tiên: WebGL spec (Khronos), _Real-Time Rendering_ (Akenine-Möller), _The Book of Shaders_, Inigo Quilez articles, Three.js docs/source, GPU Gems, ShaderToy, Physically Based Rendering (pbr-book.org).
- Mỗi bài **tối thiểu 3 bài tập**, phân bố: 1 concept (kiểm tra hiểu), 1 code (viết được), 1 build (tạo ra thứ gì đó).
- Bản `en` không phải là bản dịch máy — viết lại tự nhiên, nhưng phải cùng cấu trúc heading để so sánh được.

---

## 4. LỘ TRÌNH HỌC (Curriculum) — bắt buộc implement đầy đủ

13 track, chạy tuần tự nhưng cho phép unlock sớm nếu prerequisites thoả mãn.

### Track 0 — Nền tảng Toán học cho đồ hoạ _(newbie)_

Toạ độ Descartes & UV space · Vector: cộng, dot, cross, normalize và **ý nghĩa hình học** của từng phép · Ma trận 2x2/3x3/4x4, homogeneous coordinates · Model → View → Projection pipeline · Euler angles và vấn đề gimbal lock · Quaternion (khi nào cần, khi nào không) · Lượng giác cho animation: sin/cos/atan2 · Interpolation: lerp, slerp, smoothstep, easing curves · Không gian màu: sRGB vs linear, gamma correction.

### Track 1 — WebGL Thuần _(nền móng, không được bỏ qua)_

WebGL là gì và không là gì · Rendering pipeline từ A đến Z · `getContext`, canvas sizing, devicePixelRatio · VBO, VAO, `bufferData` · Vertex shader / fragment shader / rasterization · attribute vs uniform vs varying · Vẽ tam giác đầu tiên bằng WebGL2 thuần (không thư viện) · Texture: upload, sampler, wrap mode, mipmap · Framebuffer object & render-to-texture · Depth buffer, z-fighting · Blending & alpha · WebGL2 vs WebGL1 vs WebGPU (bối cảnh).

### Track 2 — GLSL Fundamentals

Cú pháp, kiểu dữ liệu, swizzling · precision qualifier · Built-in functions: `mix`, `clamp`, `step`, `smoothstep`, `fract`, `mod`, `length`, `distance` · Không có branching miễn phí — vì sao `if` đắt trên GPU · Vẽ hình 2D bằng distance field · Gradient, pattern, tiling · Ma trận biến đổi trong shader · Debug shader: kỹ thuật xuất giá trị ra màu.

### Track 3 — Three.js Core (thuần, không React)

Scene / Camera / Renderer · Geometry: built-in và `BufferGeometry` tự tạo · Material: Basic → Lambert → Phong → Standard → Physical · Ánh sáng và bóng đổ (shadow map, bias, cascade) · Texture loading, `KTX2Loader`, nén texture · Loader: GLTF, Draco, meshopt · Animation system: `AnimationMixer`, clip, skinning · Raycasting & interaction · Controls · Scene graph & transform hierarchy · Đọc source Three.js (bắt buộc: `WebGLRenderer`, `Object3D`).

### Track 4 — React Three Fiber

Vì sao R3F tồn tại — reconciler, không phải wrapper · JSX ↔ Three.js mapping · `useFrame`, `useThree`, `useLoader` · Vòng đời & disposal (memory leak là kẻ thù số 1) · drei: `OrbitControls`, `Environment`, `useTexture`, `Html`, `shaderMaterial` · `useMemo` cho geometry/material — khi nào cần · Suspense & lazy loading assets · Portal, multiple canvas, `View` component · Leva cho debug UI · So sánh khi nào dùng R3F, khi nào dùng Three thuần.

### Track 5 — GSAP & Animation Nâng cao

Tween, Timeline, stagger · Easing: hiểu bezier, custom ease · ScrollTrigger: scrub, pin, snap, `containerAnimation` · Đồng bộ ScrollTrigger với render loop của R3F (điểm ai cũng làm sai) · Observer & Draggable · Flip plugin cho layout transition · SplitText cho typography · GSAP vs Framer Motion vs CSS animation — chọn cái nào · Animation principles: anticipation, follow-through, secondary motion · Performance: chỉ animate `transform` và `opacity`, hiểu compositor layer.

### Track 6 — Custom Shader trong Three.js

`ShaderMaterial` vs `RawShaderMaterial` · Uniform built-in mà Three inject sẵn · `onBeforeCompile` — hack vào material có sẵn mà vẫn giữ được lighting/shadow · Shader chunk system của Three · `#include` và `ShaderChunk` override · Truyền attribute tuỳ biến từ geometry · `InstancedMesh` + per-instance attribute · `shaderMaterial` helper của drei · TSL (Three Shading Language) — bối cảnh WebGPU.

### Track 7 — Procedural & Noise

Random không có random trên GPU — hash function · Value noise, Gradient noise, Perlin, Simplex · FBM (fractal Brownian motion) · Domain warping (kỹ thuật của Inigo Quilez) · Voronoi / Worley noise · Curl noise cho flow field · Ứng dụng: mây, nước, địa hình, marble, vân gỗ · Noise 3D & 4D (animate qua thời gian mà không lặp).

### Track 8 — Raymarching & Signed Distance Fields

Nguyên lý sphere tracing · SDF cơ bản: sphere, box, torus, capsule · Boolean ops: union, subtraction, intersection, smooth min · Domain repetition (không gian vô hạn với O(1) bộ nhớ) · Tính normal bằng gradient · Soft shadow, ambient occlusion trong raymarch · Fog & atmospheric scattering đơn giản · Volumetric rendering cơ bản · Tối ưu: bounding volume, step count adaptive, early exit · Kết hợp raymarch với rasterized scene (depth integration).

### Track 9 — GPGPU, Particles & Simulation

Vì sao particle phải chạy trên GPU · Ping-pong FBO · Lưu trạng thái vào texture (position/velocity encoding) · `GPUComputationRenderer` của Three · Transform feedback (WebGL2) · Flow field particles · Boids / flocking trên GPU · Cloth simulation cơ bản · Fluid: giới thiệu SPH / PBF / stable fluids (Stam) · Instancing hàng triệu object.

### Track 10 — Post-processing

EffectComposer & render pass · Bloom (và vì sao bloom rẻ tiền trông tệ) · DOF, motion blur · SSAO · Chromatic aberration, vignette, film grain · Color grading & LUT · Custom pass tự viết · Tone mapping: ACES, Reinhard · Thứ tự pass quan trọng thế nào · Chi phí fillrate.

### Track 11 — PBR & Lighting Theory

Rendering equation (hiểu, không cần thuộc) · BRDF, microfacet model · Metalness/Roughness workflow · Fresnel & Schlick approximation · IBL: irradiance map, prefiltered environment, BRDF LUT · HDRI, exposure, tone mapping · Shadow techniques: PCF, VSM, cascaded · Area light, light probe · Vì sao asset của bạn trông "nhựa".

### Track 12 — Performance & Production

Đo trước khi tối ưu: Spector.js, Chrome DevTools, `stats.js`, RenderDoc · Draw call, batching, instancing · Frustum & occlusion culling · LOD · Texture memory budget · Shader compilation stall & pre-warming · Mobile GPU: tile-based rendering, vì sao overdraw giết mobile · Adaptive quality tier (detect GPU, giảm resolution/effect) · Asset pipeline: Draco, KTX2/Basis, gltf-transform · Memory leak: dispose geometry/material/texture đúng cách · SSR/hydration với Next.js và canvas.

### Track 13 — Capstone Projects

4 project lớn, mỗi cái là một lesson kiểu `build`:

1. **Scroll-driven product showcase** — GLTF + ScrollTrigger + post-processing.
2. **Raymarched landscape** — full-screen fragment shader, FBM terrain, atmospheric scattering, quality tier.
3. **GPU particle system tương tác** — 1M particle, flow field, mouse interaction, FBO ping-pong.
4. **Portfolio site có 3D hero** — nhưng đạt Lighthouse > 90 và chạy mượt trên mobile tầm trung.

---

## 5. DATABASE SCHEMA (Drizzle)

Chỉ lưu tiến độ. Nội dung bài học **không bao giờ** vào DB.

```ts
// db/schema.ts
export const lessonProgress = sqliteTable("lesson_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonSlug: text("lesson_slug").notNull().unique(),
  status: text("status", {
    enum: ["locked", "not_started", "in_progress", "completed"],
  })
    .notNull()
    .default("not_started"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  scrollPercent: real("scroll_percent").notNull().default(0), // resume đúng chỗ
  confidence: integer("confidence"), // 1–5, tự đánh giá sau khi xong
});

export const exerciseAttempts = sqliteTable("exercise_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonSlug: text("lesson_slug").notNull(),
  exerciseId: text("exercise_id").notNull(),
  status: text("status", {
    enum: ["not_started", "attempted", "completed", "skipped"],
  })
    .notNull()
    .default("not_started"),
  hintsRevealed: integer("hints_revealed").notNull().default(0),
  solutionRevealed: integer("solution_revealed", { mode: "boolean" })
    .notNull()
    .default(false),
  userCode: text("user_code"), // lưu code user viết trong playground
  checklistState: text("checklist_state", { mode: "json" }).$type<boolean[]>(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonSlug: text("lesson_slug").notNull(),
  anchorId: text("anchor_id"), // id của heading/đoạn được highlight
  selectedText: text("selected_text"),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const bookmarks = sqliteTable("bookmarks", {
  /* lessonSlug, anchorId, createdAt */
});

export const studySessions = sqliteTable("study_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonSlug: text("lesson_slug"),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  durationSeconds: integer("duration_seconds").notNull().default(0),
});

export const reviewQueue = sqliteTable("review_queue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonSlug: text("lesson_slug").notNull().unique(),
  intervalDays: integer("interval_days").notNull().default(1),
  easeFactor: real("ease_factor").notNull().default(2.5),
  dueAt: integer("due_at", { mode: "timestamp" }).notNull(),
  reviewCount: integer("review_count").notNull().default(0),
});

export const playgroundSnippets = sqliteTable("playground_snippets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  vertexShader: text("vertex_shader"),
  fragmentShader: text("fragment_shader").notNull(),
  uniformsJson: text("uniforms_json", { mode: "json" }),
  forkedFromLesson: text("forked_from_lesson"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // locale, theme, quality tier, editor font size
});
```

Index cần có: `lesson_progress(status)`, `exercise_attempts(lesson_slug)`, `review_queue(due_at)`, `study_sessions(started_at)`.

---

## 6. TÍNH NĂNG

### 6.1 Bắt buộc (MVP)

1. **Roadmap view** — hiển thị 13 track dạng cây/timeline, mỗi track có progress ring. Lesson bị khoá nếu prerequisites chưa xong (nhưng có nút "Học trước dù sao" — không ép buộc).
2. **Lesson page** — layout 3 cột trên desktop:
   - Trái: sidebar điều hướng module (shadcn `ScrollArea` + `Accordion`)
   - Giữa: nội dung MDX (theory → demo → exercises → references)
   - Phải: table of contents dính (sticky), tự highlight theo scroll
3. **Auto-save tiến độ** — track scroll %, thời gian ở trên trang (dừng đếm khi tab ẩn, dùng `visibilitychange`). Debounce ghi DB 5s/lần.
4. **Demo tương tác** — mỗi demo là React component nhúng trực tiếp trong MDX, có control panel (shadcn `Slider`, `Switch`, `Select`) để chỉnh tham số real-time.
5. **GLSL Playground** — Monaco editor + live preview canvas. Compile lỗi thì hiện lỗi GLSL đã parse (số dòng chính xác), không crash app. Có uniform mặc định: `uTime`, `uResolution`, `uMouse`. Lưu snippet vào DB.
6. **Exercise flow** — mở bài tập → thử → xin hint (từng cái một, ghi lại số hint đã dùng) → tự chấm bằng checklist → xem solution.
7. **Language switcher** — đổi locale giữ nguyên route và vị trí scroll.
8. **Dark/light mode** — `next-themes`, tôn trọng `prefers-color-scheme`.
9. **Command palette** (`Cmd+K`) — shadcn `Command`, tìm kiếm lesson theo title/tag/nội dung.

### 6.2 Nên có (Phase 2)

10. **Ghi chú & highlight** — bôi đen text trong bài học → popover → lưu note gắn với anchor.
11. **Spaced repetition** — sau khi hoàn thành lesson, đưa vào review queue (thuật toán SM-2 rút gọn). Dashboard hiện "N bài cần ôn hôm nay".
12. **Stats page** — heatmap kiểu GitHub theo `studySessions`, streak hiện tại, tổng giờ, phân bố theo track (dùng `recharts` — shadcn có chart component).
13. **Export/Import progress** — dump JSON để backup, vì DB là file local.
14. **Quality tier detection** — playground và demo tự giảm resolution/DPR trên máy yếu.

### 6.3 Không làm

- Đăng nhập, multi-user, sync cloud, comment, leaderboard, AI chatbot, gamification badge sến súa.

---

## 7. RÀNG BUỘC UI

- Chỉ dùng shadcn component. Danh sách cần cài: `button, card, tabs, accordion, scroll-area, separator, badge, progress, slider, switch, select, dialog, sheet, popover, tooltip, command, sonner, skeleton, alert, collapsible, breadcrumb, dropdown-menu, avatar, chart, resizable, toggle-group`.
- **Không viết file CSS mới** ngoài `globals.css` do shadcn sinh ra. Mọi styling qua Tailwind utility.
- Không tự định nghĩa màu hex. Dùng `bg-background`, `text-muted-foreground`, `border-border`, v.v.
- Canvas 3D bọc trong shadcn `Card` với `AspectRatio` cố định, có `Skeleton` khi loading.
- Layout playground dùng `Resizable` panel (editor | preview).
- Mọi trạng thái loading/error phải có UI tương ứng, không để màn hình trắng.
- Responsive: mobile ẩn sidebar vào `Sheet`, TOC vào `Drawer`.

---

## 8. RÀNG BUỘC KỸ THUẬT

1. **TypeScript strict**, không `any`. Curriculum phải type-safe: sai `slug` trong `prerequisites` là lỗi compile-time (dùng `as const` + union type sinh ra từ curriculum).
2. **Không memory leak.** Mọi component R3F phải dispose geometry, material, texture, và huỷ RAF khi unmount. Viết một hook `useDisposable` dùng chung.
3. **Canvas không render khi ngoài viewport** — dùng IntersectionObserver, pause render loop. Đây là bắt buộc, không phải tối ưu về sau.
4. **GSAP + R3F**: dùng một render loop duy nhất. Đăng ký `gsap.ticker` điều khiển, hoặc để `useFrame` đọc giá trị GSAP đã tween. Không được để hai loop đánh nhau.
5. **Shader viết trong file `.glsl` riêng**, import qua `vite-plugin-glsl` hoặc raw loader — không nhét string vào JSX.
6. Server Component cho nội dung tĩnh, `'use client'` chỉ ở component có canvas/interactivity.
7. better-sqlite3 chỉ chạy trong Server Action / Route Handler. Bật `WAL` mode.
8. Migration commit vào repo, chạy tự động lúc khởi động nếu DB chưa tồn tại.

---

## 9. KẾ HOẠCH TRIỂN KHAI (làm tuần tự, mỗi phase chạy được)

| Phase  | Nội dung                                                                                                                        | Định nghĩa "xong"                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **1**  | Scaffold Next.js + shadcn + next-intl + Drizzle. Layout, theme, language switcher.                                              | `pnpm dev` chạy, đổi được ngôn ngữ và theme    |
| **2**  | Content pipeline: MDX + KaTeX + shiki, kiểu `LessonMeta`, `curriculum.ts` với đầy đủ 13 track (metadata thôi, chưa có nội dung) | Roadmap page render đủ cây lộ trình            |
| **3**  | Lesson page + TOC + progress tracking + SQLite ghi/đọc                                                                          | Đọc bài, reload lại vẫn nhớ vị trí và %        |
| **4**  | Hệ thống demo: `<Demo>` wrapper, control panel, IntersectionObserver pause                                                      | 3 demo mẫu chạy được ở Track 0–2               |
| **5**  | GLSL Playground: Monaco + live compile + error mapping + lưu snippet                                                            | Sửa shader thấy đổi ngay, lỗi hiện đúng dòng   |
| **6**  | Exercise system: hint, checklist, solution reveal, lưu code                                                                     | Làm trọn 1 bài tập, reload vẫn giữ trạng thái  |
| **7**  | Viết nội dung thật: **Track 0 và Track 1 đầy đủ song ngữ** (đây là mẫu chuẩn cho các track sau)                                 | Mỗi lesson đủ 4 phần, ≥2 citation, ≥3 exercise |
| **8**  | Notes, bookmarks, command palette, stats + heatmap, SRS                                                                         | Dashboard hiện đúng streak và bài cần ôn       |
| **9**  | Viết nốt Track 2 → 13                                                                                                           |                                                |
| **10** | Polish: a11y (keyboard nav, focus ring, aria), performance audit, export/import                                                 | Lighthouse ≥ 90 các trang không canvas         |

---

## 10. YÊU CẦU CHẤT LƯỢNG NỘI DUNG

Đây là phần quan trọng nhất và cũng dễ làm ẩu nhất. Ràng buộc:

- **Không viết nội dung chung chung.** "Shader chạy trên GPU nên nhanh" là vô giá trị. Phải: "Fragment shader chạy song song cho mỗi pixel; với màn hình 1920×1080 ở DPR 2 là ~8.3 triệu invocation mỗi frame, nên một phép `pow()` thừa cũng đo được bằng ms."
- **Mọi con số phải có nguồn** hoặc ghi rõ là ước lượng.
- **Code trong bài học phải chạy được**, không phải pseudo-code. Nếu là snippet cắt ra, ghi rõ context.
- **Nêu cả cái sai thường gặp.** Mỗi lesson nên có một callout "Lỗi hay gặp" — ví dụ quên `needsUpdate`, nhầm thứ tự nhân ma trận, dùng `THREE.Color` không đúng color space.
- Bài học ở track cao (8, 9, 11) phải giữ được độ chặt chẽ toán học — không được đơn giản hoá đến mức sai.

---

## 11. CHECKLIST NGHIỆM THU

- [ ] Đổi locale không mất trạng thái, không lỗi hydration
- [ ] Xoá `data/progress.db` → khởi động lại → tự migrate, app vẫn chạy
- [ ] Mở 20 lesson liên tiếp, `performance.memory` không tăng tuyến tính (không leak)
- [ ] Scroll qua trang có 3 canvas → chỉ canvas trong viewport tiêu GPU
- [ ] Shader lỗi cú pháp → hiện lỗi có số dòng, app không crash
- [ ] Toàn bộ app điều hướng được bằng bàn phím
- [ ] Không có file CSS custom nào ngoài `globals.css`
- [ ] `tsc --noEmit` sạch, không `any`, không `@ts-ignore`
- [ ] Mọi lesson có đủ: objectives, theory (2 ngôn ngữ), ≥2 citation, ≥3 exercise

---

## 12. LỆNH KHỞI ĐỘNG

> Bắt đầu từ **Phase 1**. Trước khi code, in ra cây thư mục dự kiến và danh sách file sẽ tạo để tôi xác nhận. Sau mỗi phase, dừng lại báo cáo những gì đã xong và những gì cần tôi quyết định. Không nhảy cóc phase. Nếu có chỗ trong spec này mâu thuẫn hoặc thiếu, hỏi trước khi tự quyết.
