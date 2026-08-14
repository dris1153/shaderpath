import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-3d-portfolio",
    kind: "build",
    prompt: {
      vi: `Dựng một trang portfolio 3D thật bằng Next.js App Router: đạt Lighthouse Performance trên 90 ở mọi trang không chứa canvas, và chạy mượt trên một thiết bị di động tầm trung.

Bám theo năm mốc gợi ý: (1) dựng skeleton site — layout và trang nội dung thuần Server Component, chưa đụng WebGL, đạt điểm 95+; (2) tích hợp hero 3D qua một hòn đảo canvas duy nhất — \`next/dynamic({ ssr: false })\` gọi từ Client Component, giữ chỗ layout bằng aspect-ratio cố định trước khi mount; (3) thêm tier thích nghi cho hero — độ chi tiết geometry và DPR giảm theo thiết bị, tôn trọng \`prefers-reduced-motion\`, dừng render loop khi ẩn; (4) xác nhận disposal qua nhiều lần điều hướng route bằng \`<Link>\`, không chỉ một lần mount/unmount; (5) hoàn thiện và tổng hợp một bảng audit Lighthouse đầy đủ, theo đúng phương pháp luận chính thức (mobile preset, throttled).

\`starterCode\` bên dưới dựng sẵn khung sườn sáu module — layout, trang nội dung, hero island, hook tier thiết bị, scene 3D, và verification — với TODO cho từng mốc; \`solutionCode\` gộp cả sáu module vào một file, ranh giới đánh dấu rõ bằng comment, vì đây là kiến trúc tham khảo chứ không phải cấu trúc thư mục thật.`,
      en: `Build a real 3D portfolio site with the Next.js App Router: score above 90 on Lighthouse Performance for every non-canvas page, and run smoothly on a mid-range mobile device.

Follow five suggested milestones: (1) build the site skeleton — a pure Server Component layout and content pages, no WebGL yet, hitting 95+; (2) integrate the 3D hero through a single canvas island — \`next/dynamic({ ssr: false })\` called from a Client Component, with layout space reserved via a fixed aspect-ratio before it mounts; (3) add adaptive tiers to the hero — geometry detail and DPR drop per device, \`prefers-reduced-motion\` respected, render loop stopped when hidden; (4) verify disposal across repeated \`<Link>\` route navigations, not just a single mount/unmount; (5) polish and assemble a complete Lighthouse audit table, following the official methodology (mobile preset, throttled).

The \`starterCode\` below scaffolds six modules — layout, content page, hero island, device-tier hook, 3D scene, and verification — with a TODO per milestone; \`solutionCode\` folds all six modules into one file with boundaries clearly marked by comments, since this is a reference architecture, not an actual folder structure.`,
    },
    starterCode: `// ============================================================
// SIX-MODULE SCAFFOLD for the 3D portfolio capstone. In a real repo
// each "MODULE" comment marks a SEPARATE file under app/ or components/ —
// kept in one place here only so starter/solution stay easy to diff.
// ============================================================

// TODO Milestone 1 — MODULE 1: app/layout.tsx (Server Component)
// Fill in a Metadata export (title/description/openGraph), semantic
// <header>/<footer>, and a skip-to-content link. Must NEVER import
// three/@react-three/fiber.
//
// import type { Metadata } from "next";
// export const metadata: Metadata = { ... };
// export default function RootLayout({ children }: { children: ReactNode }) { ... }

// TODO Milestone 1 — MODULE 2: app/page.tsx (Server Component)
// All copy here — h1, intro, project list — must render with ZERO client
// JS. Import HeroIsland but do not make this file itself a Client Component.
//
// import { HeroIsland } from "@/components/hero-island";
// export default function HomePage() { ... }

// TODO Milestone 2 — MODULE 3: components/hero-island.tsx
// "use client"; next/dynamic(() => import("./hero-scene"), { ssr: false })
// wrapped in a fixed-aspect-ratio <div> whose size is reserved BEFORE the
// chunk resolves (the loading fallback needs the SAME dimensions).

// TODO Milestone 3 — MODULE 4: hooks/use-device-tier.ts
// Detect tier from navigator.hardwareConcurrency/deviceMemory (reuse the
// heuristic from adaptive-quality-tiers) + track prefers-reduced-motion via
// matchMedia.

// TODO Milestone 3 — MODULE 5: components/hero-scene.tsx
// R3F <Canvas frameloop="demand"> with useVisibleFrameloop pumping
// invalidate() only while visible, useDisposable for geometry/material,
// mesh detail + dpr driven by the tier hook, spin animation gated by
// !reducedMotion.

// TODO Milestone 4 — MODULE 6: disposal-across-navigation verification
// Write the manual test procedure as a comment: navigate away/back via
// <Link> N times while watching renderer.info.memory, plus a heap-snapshot
// diff.

// TODO Milestone 5: final Lighthouse audit table — fill in after running a
// real mobile-preset, throttled Lighthouse pass + \`next experimental-analyze\`.`,
    solutionCode: `// One file, six commented module boundaries — in a real repo each
// "MODULE" block below is its own file at the path named in its comment.
// Architecture: Server Components own all content/SEO; exactly one Client
// Component boundary (hero-island) pulls in \`three\`; a device-tier hook
// drives the hero's detail/DPR/motion; disposal is verified across route
// navigation, not just mount/unmount.

// ============================================================
// MODULE 1: app/layout.tsx — Server Component. Sets the SEO/meta shell
// every page inherits. Never imports three/@react-three/fiber — if this
// file's chunk ever contains WebGL code, EVERY route pays for it.
// ============================================================
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Jane Doe — 3D Frontend Engineer", template: "%s · Jane Doe" },
  description: "Portfolio of a frontend engineer specializing in WebGL and React Three Fiber.",
  openGraph: { title: "Jane Doe — 3D Frontend Engineer", type: "website" },
};

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <header>{/* plain HTML/CSS nav — zero JS cost */}</header>
        <main id="main">{children}</main>
        <footer>{/* ... */}</footer>
      </body>
    </html>
  );
}

// ============================================================
// MODULE 2: app/page.tsx — Server Component. All copy renders in the
// FIRST HTML response: indexable with zero client JS, and none of it
// blocks on \`three\` loading.
// ============================================================
import { HeroIsland } from "./hero-island";

export function HomePage() {
  return (
    <>
      <section aria-label="Hero">
        <h1>Jane Doe</h1>
        <p>I build performant, interactive 3D experiences for the web.</p>
        <HeroIsland />
      </section>
      <section aria-label="Selected work">
        <h2>Selected work</h2>
        {/* real content: project cards, case studies — plain HTML, indexed
            regardless of whether the hero below it has finished loading */}
      </section>
    </>
  );
}

// ============================================================
// MODULE 3: components/hero-island.tsx — the ONLY file that pulls in
// \`three\`. Must be "use client": Next.js requires ssr:false to be called
// from inside a Client Component, not a Server Component like MODULE 2.
// ============================================================
"use client"; // first line of this module's real file
import dynamic from "next/dynamic";

// Fixed aspect box reserved BEFORE the heavy chunk loads — the #1 CLS
// source on canvas-hero pages is content jumping when the canvas mounts.
// The loading fallback below matches this same box's dimensions, so
// nothing shifts between "loading" and "mounted" either.
const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => <div className="aspect-video w-full animate-pulse rounded bg-muted" />,
  },
);

export function HeroIsland() {
  return (
    <div className="aspect-video w-full overflow-hidden rounded">
      <HeroScene />
    </div>
  );
}

// ============================================================
// MODULE 4: hooks/use-device-tier.ts — tier + reduced-motion detection,
// reusing the heuristic from Track 12's adaptive-quality-tiers and
// checkpoint-mobile-ready-scene rather than inventing a new one.
// ============================================================
"use client"; // first line of this module's real file
import { useEffect, useState } from "react";

export type Tier = "low" | "mid" | "high";

export interface DeviceProfile {
  tier: Tier;
  reducedMotion: boolean;
}

function detectTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 4 || mem <= 4) return "low";
  if (cores <= 8 || mem <= 8) return "mid";
  return "high";
}

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>({ tier: "mid", reducedMotion: false });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setProfile({ tier: detectTier(), reducedMotion: mq.matches });
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return profile;
}

// ============================================================
// MODULE 5: components/hero-scene.tsx — dynamic-imported ONLY from
// hero-island.tsx (MODULE 3). Every three/@react-three/fiber import lives
// downstream of this one file, so a bundle analyzer run shows them in the
// hero's own chunk, never in the shared or page chunk.
// ============================================================
"use client"; // first line of this module's real file
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useDeviceProfile, type Tier } from "./use-device-tier";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";

const TIER_DETAIL: Record<Tier, number> = { low: 0, mid: 1, high: 2 };
const TIER_DPR: Record<Tier, [number, number]> = {
  low: [1, 1],
  mid: [1, 1.5],
  high: [1, 2],
};

// Reuses this platform's own useDisposable/useVisibleFrameloop — the
// "battery-respect visibility pause" the brief asks for IS the same
// demand-frameloop contract every lesson demo already follows, not a
// separate mechanism invented for the portfolio.
function HeroMesh({ detail, spin }: { detail: number; spin: boolean }) {
  const disposables = useDisposable();
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => disposables.register(new THREE.IcosahedronGeometry(1.2, detail)),
    [detail, disposables],
  );
  const material = useMemo(
    () => disposables.register(new THREE.MeshStandardMaterial({ color: "#7aa2f7", roughness: 0.3 })),
    [disposables],
  );

  useFrame((_state, delta) => {
    if (spin && meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

function FrameloopGate({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  useVisibleFrameloop(containerRef);
  return null;
}

export function HeroScene() {
  const { tier, reducedMotion } = useDeviceProfile();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="size-full">
      <Canvas
        frameloop="demand"
        dpr={TIER_DPR[tier]}
        gl={{ antialias: tier !== "low", powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4], fov: 45 }}
      >
        <FrameloopGate containerRef={containerRef} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <HeroMesh detail={TIER_DETAIL[tier]} spin={!reducedMotion} />
      </Canvas>
    </div>
  );
}

// ============================================================
// MODULE 6: disposal across route navigation — verification (part of
// this build, not optional). Real portfolios have multiple routes (e.g.
// "/", "/work/[slug]"); the hero mounts on "/" and must fully
// unmount+dispose when a <Link> navigates to "/work/foo", then remount
// cleanly on the way back. App Router does client-side navigation without
// a full page reload, so React unmount/mount — and therefore
// useDisposable's cleanup — is the ONLY thing that frees the
// WebGLRenderer/geometries/materials. Keeping the hero as a page-scoped
// component (mounted from MODULE 2's app/page.tsx, never hoisted into
// MODULE 1's persistent layout) is what makes this teardown happen at all.
//
// Procedure — run for real, don't guess:
// 1. Open DevTools -> Memory tab, take a heap snapshot on "/".
// 2. Click a <Link href="/work/foo"> and navigate back to "/" ten times,
//    while watching renderer.info.memory (log it in a temporary
//    useEffect, or read it live via React DevTools).
// 3. geometries/textures counts must return to the SAME baseline number
//    after every round trip. A climbing count means the hero's cleanup
//    isn't running on route change — almost always because it got hoisted
//    into a persistent layout instead of staying page-scoped.
// 4. Take a second heap snapshot after the 10 round trips, diff against
//    the first (Comparison view) — no retained THREE.BufferGeometry or
//    Material instances beyond the one currently mounted.

// ============================================================
// FINAL AUDIT TABLE — measured on the dev machine with a real Lighthouse
// run: \`next build && next start\`, then Chrome DevTools -> Lighthouse
// panel, device: Moto G Power preset, 4x CPU slowdown, Slow 4G network.
// NEVER audit \`next dev\` — its unminified/unbundled output tanks every
// score regardless of how well the app is actually built. Numbers below
// are illustrative for a hero of this complexity; always re-measure your
// own build rather than trusting these.
//
// | Page / metric                              | Before (no tiers, eager three import) | After |
// |---------------------------------------------|------------------------------------------|-------|
// | "/" — Lighthouse Performance                 | ~52                                        | ~93   |
// | "/work/[slug]" — Lighthouse Performance       | ~88 (no 3D on this route)                  | ~96   |
// | LCP                                           | ~4.1s (blocked behind the three chunk)     | ~1.6s |
// | CLS                                           | 0.31 (canvas pop-in)                       | 0.01  |
// | TBT                                           | ~890ms (three eval on the main thread)     | ~120ms|
// | three/@react-three/fiber KB in the page chunk | present (bundled with shared code)         | 0 — hero chunk only |
// | renderer.info.memory after 10 route round trips | climbs every trip                        | returns to baseline |`,
    hints: [
      {
        vi: "`ssr: false` chỉ hợp lệ khi gọi từ bên trong một file `\"use client\"` — gọi thẳng `next/dynamic(..., { ssr: false })` trong `app/page.tsx` (Server Component) báo lỗi ngay lúc build. Đó là lý do MODULE 3 (`hero-island.tsx`) tồn tại như một boundary riêng, tách khỏi MODULE 2.",
        en: "`ssr: false` is only valid when called from inside a `\"use client\"` file — calling `next/dynamic(..., { ssr: false })` directly in `app/page.tsx` (a Server Component) errors at build time. That's why MODULE 3 (`hero-island.tsx`) exists as its own boundary, separate from MODULE 2.",
      },
      {
        vi: "Giữ chỗ layout không dừng ở \"trước khi chunk tải\" — `loading:` fallback của `next/dynamic` và container đang mount `<Canvas>` thật phải cùng kích thước (`aspect-video` áp cho cả hai). Thiếu bước này, CLS vẫn xảy ra ở đúng khoảnh khắc chuyển từ fallback sang canvas thật, dù trước đó không có gì nhảy.",
        en: "Reserving layout space doesn't stop at 'before the chunk loads' — the `next/dynamic` `loading:` fallback and the container mounting the real `<Canvas>` must be the SAME size (`aspect-video` applied to both). Skip this and CLS still happens right at the fallback-to-real-canvas transition, even though nothing shifted before that.",
      },
      {
        vi: "Hero phải là component gắn theo TRANG (`app/page.tsx`), không phải theo layout — nếu hoisting nó lên `app/layout.tsx` để \"tránh phải remount mỗi lần điều hướng\", nó sẽ không bao giờ unmount khi chuyển route, và một component không bao giờ unmount thì cleanup của `useDisposable` cũng không bao giờ chạy. Kiểm tra disposal qua route navigation (MODULE 6) sẽ luôn \"pass giả\" nếu mắc lỗi này, vì đơn giản là không có unmount nào xảy ra để mà leak.",
        en: "The hero must be a PAGE-scoped component (`app/page.tsx`), not a layout-scoped one — hoisting it into `app/layout.tsx` to 'avoid remounting on every navigation' means it never unmounts on a route change, and a component that never unmounts never runs `useDisposable`'s cleanup either. The route-navigation disposal check (MODULE 6) will falsely 'pass' under this mistake, simply because no unmount ever happens for anything to leak from.",
      },
    ],
    checklist: [
      {
        vi: "Lighthouse Performance trên 90 ở mọi trang không chứa canvas (mobile preset, throttled)",
        en: "Lighthouse Performance above 90 on every non-canvas page (mobile preset, throttled)",
      },
      {
        vi: "CLS đo được dưới 0.1 ngay cả trong lúc hero 3D đang mount",
        en: "Measured CLS stays under 0.1 even while the 3D hero is mounting",
      },
      {
        vi: "LCP không bị chunk three chặn đường — phần tử LCP vẫn là text/heading, không phải canvas",
        en: "LCP is never blocked behind the three chunk — the LCP element stays text/heading, not the canvas",
      },
      {
        vi: "next/dynamic({ ssr: false }) chỉ được gọi từ file \"use client\" — build không lỗi",
        en: "next/dynamic({ ssr: false }) is only ever called from a \"use client\" file — the build doesn't error",
      },
      {
        vi: "Tier hero thật sự đổi giữa các cấu hình thiết bị mô phỏng (độ chi tiết geometry/DPR khác nhau đo được, không chỉ đọc code)",
        en: "The hero's tier genuinely changes across simulated device profiles (measurably different geometry detail/DPR, not just read from the code)",
      },
      {
        vi: "prefers-reduced-motion được tôn trọng — animation dừng khi bật cờ này",
        en: "prefers-reduced-motion is respected — animation stops when the flag is set",
      },
      {
        vi: "Canvas dừng hoàn toàn render loop khi ẩn hoặc ngoài viewport, xác nhận qua useVisibleFrameloop/data-frames",
        en: "The canvas fully stops its render loop when hidden or off-screen, confirmed via useVisibleFrameloop/data-frames",
      },
      {
        vi: "Điều hướng qua lại giữa các route (qua <Link>, 10 lần) không làm renderer.info.memory tăng dần",
        en: "Navigating back and forth between routes (via <Link>, 10 times) never makes renderer.info.memory climb",
      },
      {
        vi: "Bundle analyzer xác nhận three/@react-three/fiber chỉ nằm trong chunk của hero, không rò vào chunk trang hay chunk chia sẻ",
        en: "The bundle analyzer confirms three/@react-three/fiber live only in the hero's chunk, never leaking into a page or shared chunk",
      },
      {
        vi: "Có bảng audit Lighthouse đầy đủ, ghi rõ phương pháp đo (preset/throttle/version), không chỉ con số trần trụi",
        en: "A complete Lighthouse audit table exists, documenting the measurement method (preset/throttle/version), not just bare numbers",
      },
    ],
  },
];
