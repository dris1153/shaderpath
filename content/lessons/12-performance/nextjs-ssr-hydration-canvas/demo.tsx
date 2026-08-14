"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import { Button } from "@/components/ui/button";

const LABELS = {
  vi: {
    title: "Meta-demo: chính bạn đang xem thứ được next/dynamic tải",
    meta: "Demo này được nạp qua registry đúng cách mô tả trong bài:",
    strategy: "Chiến lược mount",
    strategyEager: "Eager (không chờ scroll)",
    strategyDeferred: "Deferred (chờ vào viewport)",
    placeholder: "Giữ chỗ layout (aspect-ratio)",
    reset: "Replay",
    waitingEager: "đang tải hòn đảo canvas…",
    waitingDeferred: "cuộn xuống để hòn đảo vào viewport…",
    seoTop:
      "Đoạn văn bản này render trên server, có mặt trong HTML đầu tiên — index được ngay cả khi JavaScript chưa chạy.",
    seoBelow:
      "Nội dung phía dưới hòn đảo canvas — nếu không giữ chỗ layout, nó sẽ bị đẩy xuống đúng lúc canvas mount.",
    islandLabel: "hòn đảo canvas (Client Component)",
    shift: "dịch chuyển layout",
    timing: "mounted sau",
    ms: "ms",
    px: "px",
  },
  en: {
    title: "Meta-demo: you're watching what next/dynamic loaded",
    meta: "This demo itself was loaded through the registry described in the lesson:",
    strategy: "Mount strategy",
    strategyEager: "Eager (doesn't wait for scroll)",
    strategyDeferred: "Deferred (waits to enter viewport)",
    placeholder: "Reserve layout space (aspect-ratio)",
    reset: "Replay",
    waitingEager: "loading the canvas island…",
    waitingDeferred: "scroll down to bring the island into view…",
    seoTop:
      "This paragraph renders on the server and exists in the very first HTML — indexable even before JavaScript runs.",
    seoBelow:
      "Content below the canvas island — without reserved layout space, this gets pushed down the instant the canvas mounts.",
    islandLabel: "canvas island (Client Component)",
    shift: "layout shift",
    timing: "mounted after",
    ms: "ms",
    px: "px",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];
type Strategy = "eager" | "deferred";

// Deliberately fixed, known pixel heights (Tailwind h-10 / h-40) so the
// "shift" readout is an exact, honest number derived from the same classes
// driving the visual — not a real Layout Instability API score (that's a
// whole-document metric; see the CLS reference for the real thing).
const COLLAPSED_PX = 40;
const MOUNTED_PX = 160;

function SpinningCube() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.5;
      ref.current.rotation.y += delta * 0.8;
    }
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#7aa2f7" />
    </mesh>
  );
}

// The real payload behind the "canvas island" — only ever created client-side
// (it's rendered conditionally by IslandSlot below, never during SSR).
function CanvasIsland({ onMounted }: { onMounted: () => void }) {
  return (
    <div className="h-40 w-full overflow-hidden rounded border">
      <DemoCanvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        onCreated={() => onMounted()}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={30} />
        <SpinningCube />
      </DemoCanvas>
    </div>
  );
}

// Gates WHEN the island mounts: eager waits a short simulated load delay
// (real next/dynamic still fetches a JS chunk — it's async even "eager"),
// deferred waits until the slot is scrolled into view via IntersectionObserver
// before starting that same delay.
function IslandSlot({
  strategy,
  placeholder,
  L,
}: {
  strategy: Strategy;
  placeholder: boolean;
  L: Labels;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(strategy === "eager");
  const [shouldMount, setShouldMount] = useState(false);
  const [mountMs, setMountMs] = useState<number | null>(null);
  // Lazy useState initializer: guaranteed to run exactly once, unlike
  // useRef(performance.now()) which would call the impure performance.now()
  // on every render even though only the first result is kept.
  const [requestedAt] = useState(() => performance.now());

  useEffect(() => {
    if (strategy === "eager" || visible) return;
    const el = slotRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [strategy, visible]);

  useEffect(() => {
    if (!visible) return;
    // Simulated chunk fetch — even "eager" dynamic imports are async.
    const timer = setTimeout(() => setShouldMount(true), 500);
    return () => clearTimeout(timer);
  }, [visible]);

  const shift = !placeholder && shouldMount ? MOUNTED_PX - COLLAPSED_PX : 0;
  const elapsed = mountMs !== null ? Math.round(mountMs - requestedAt) : null;

  return (
    <div
      ref={slotRef}
      className="my-3"
      style={placeholder ? { minHeight: MOUNTED_PX } : undefined}
    >
      {shouldMount ? (
        <CanvasIsland onMounted={() => setMountMs(performance.now())} />
      ) : (
        <div
          className="flex items-center justify-center rounded border border-dashed text-xs opacity-60"
          style={{ height: COLLAPSED_PX }}
        >
          {strategy === "eager" ? L.waitingEager : L.waitingDeferred}
        </div>
      )}
      <div className="text-muted-foreground mt-1 flex gap-3 font-mono text-[10px]">
        <span>
          {L.shift}: {shift}
          {L.px}
        </span>
        <span>
          {L.timing}: {elapsed !== null ? `${elapsed}${L.ms}` : "—"}
        </span>
      </div>
    </div>
  );
}

function SimulatedPage({
  strategy,
  placeholder,
  L,
}: {
  strategy: Strategy;
  placeholder: boolean;
  L: Labels;
}) {
  return (
    <div className="h-full space-y-3 overflow-y-auto p-3 text-xs">
      <p>{L.seoTop}</p>
      <div className="h-56 rounded border border-dashed opacity-40" />
      <div className="text-[10px] font-medium opacity-70">{L.islandLabel}</div>
      <IslandSlot strategy={strategy} placeholder={placeholder} L={L} />
      <p>{L.seoBelow}</p>
      <p>{L.seoBelow}</p>
    </div>
  );
}

function DemoBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const strategy = stringOf(values, "strategy", "eager") as Strategy;
  const placeholder = booleanOf(values, "placeholder", true);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="flex size-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <p className="text-muted-foreground truncate text-[10px]">
          {L.meta}{" "}
          <code className="text-[10px]">
            {'() => import("./lessons/12-performance/nextjs-ssr-hydration-canvas/demo")'}
          </code>
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setResetKey((k) => k + 1)}
        >
          {L.reset}
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        {/* Re-keying on strategy/placeholder too: switching a control mid-run
            restarts the simulation instead of leaving stale mount state. */}
        <SimulatedPage
          key={`${resetKey}-${strategy}-${placeholder}`}
          strategy={strategy}
          placeholder={placeholder}
          L={L}
        />
      </div>
    </div>
  );
}

export default function NextjsSsrHydrationCanvasDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={4 / 3}
      controls={[
        {
          kind: "select",
          key: "strategy",
          label: L.strategy,
          defaultValue: "eager",
          options: [
            { value: "eager", label: L.strategyEager },
            { value: "deferred", label: L.strategyDeferred },
          ],
        },
        {
          kind: "boolean",
          key: "placeholder",
          label: L.placeholder,
          defaultValue: true,
        },
      ]}
    >
      <DemoBody L={L} />
    </Demo>
  );
}
