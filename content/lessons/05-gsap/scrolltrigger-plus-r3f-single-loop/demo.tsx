"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";

gsap.registerPlugin(ScrollTrigger);

interface Labels {
  title: string;
  broken: string;
  scrollHint: string;
  sections: string[];
  progress: string;
  r3fFrames: string;
  extraFrames: string;
}

const LABELS: Record<"vi" | "en", Labels> = {
  vi: {
    title: "ScrollTrigger + R3F: một render loop",
    broken: "Chế độ lỗi (2 loop cạnh tranh)",
    scrollHint: "Cuộn khu vực này",
    sections: ["Bắt đầu", "1/3 quãng đường", "2/3 quãng đường", "Kết thúc"],
    progress: "Tiến độ scrub",
    r3fFrames: "R3F đã render (đọc progress)",
    extraFrames: "Render thừa từ ticker (lỗi)",
  },
  en: {
    title: "ScrollTrigger + R3F: One Render Loop",
    broken: "Broken mode (2 competing loops)",
    scrollHint: "Scroll this area",
    sections: ["Start", "1/3 through", "2/3 through", "End"],
    progress: "Scrub progress",
    r3fFrames: "R3F rendered (reads progress)",
    extraFrames: "Extra ticker renders (broken)",
  },
};

// The plain object ScrollTrigger writes to and useFrame reads from — never
// React state (spec §8.4): state updates here would re-render at scroll rate.
interface ScrollProgress {
  value: number;
}

interface FrameStats {
  r3fFrames: number;
  extraRenders: number;
}

/** Hoists R3F's `invalidate` out of the Canvas so the DOM-level scroller can call it. */
function InvalidateBridge({
  invalidateRef,
}: {
  invalidateRef: RefObject<(() => void) | null>;
}) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidateRef.current = invalidate;
  }, [invalidate, invalidateRef]);
  return null;
}

function Scene({
  progressRef,
  broken,
  stats,
}: {
  progressRef: RefObject<ScrollProgress>;
  broken: boolean;
  stats: RefObject<FrameStats>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, camera } = useThree();

  // Correct pattern: useFrame only READS the plain progress object —
  // ScrollTrigger is the sole writer, R3F is the sole renderer.
  useFrame(() => {
    const p = progressRef.current.value;
    if (meshRef.current) {
      meshRef.current.rotation.y = p * Math.PI * 2.5;
      meshRef.current.rotation.x = p * Math.PI * 0.5;
    }
    camera.position.z = 5 - p * 2.8;
    camera.lookAt(0, 0, 0);
    stats.current.r3fFrames++;
  });

  // Anti-pattern, wired up on purpose: a second RAF-driven loop rendering the
  // SAME scene outside R3F's schedule — exactly the
  // `gsap.ticker.add(() => renderer.render(...))` mistake this lesson dissects.
  useEffect(() => {
    if (!broken) return;
    const renderExtra = () => {
      gl.render(scene, camera);
      stats.current.extraRenders++;
    };
    gsap.ticker.add(renderExtra);
    return () => {
      gsap.ticker.remove(renderExtra);
    };
  }, [broken, gl, scene, camera, stats]);

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.7, 0.22, 128, 32]} />
      <meshNormalMaterial />
    </mesh>
  );
}

function StatsReadout({
  stats,
  progressRef,
  L,
}: {
  stats: RefObject<FrameStats>;
  progressRef: RefObject<ScrollProgress>;
  L: Labels;
}) {
  const [display, setDisplay] = useState({ progress: 0, r3f: 0, extra: 0 });

  // Polled on a coarse interval purely for the HUD text — never used to drive
  // the scene (that would reintroduce the exact problem this lesson fixes).
  useEffect(() => {
    const id = setInterval(() => {
      setDisplay({
        progress: progressRef.current.value,
        r3f: stats.current.r3fFrames,
        extra: stats.current.extraRenders,
      });
    }, 250);
    return () => clearInterval(id);
  }, [stats, progressRef]);

  return (
    <div className="bg-background/85 pointer-events-none absolute top-2 right-2 space-y-0.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] backdrop-blur">
      <p>
        {L.progress}: {(display.progress * 100).toFixed(0)}%
      </p>
      <p>
        {L.r3fFrames}: {display.r3f}
      </p>
      <p className={display.extra > 0 ? "text-destructive" : undefined}>
        {L.extraFrames}: {display.extra}
      </p>
    </div>
  );
}

function ScrollArea({
  progressRef,
  invalidateRef,
  L,
}: {
  progressRef: RefObject<ScrollProgress>;
  invalidateRef: RefObject<(() => void) | null>;
  L: Labels;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ScrollTrigger scoped to the demo's OWN scrollable div (never `window`) —
  // this instance would otherwise fight the lesson page's own scroll.
  useGsapContext(() => {
    if (!scrollerRef.current || !contentRef.current) return;
    ScrollTrigger.create({
      trigger: contentRef.current,
      scroller: scrollerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current.value = self.progress;
        invalidateRef.current?.();
      },
    });
  }, []);

  return (
    <div ref={scrollerRef} className="absolute inset-0 overflow-y-auto">
      <div ref={contentRef} style={{ height: "320%" }}>
        {L.sections.map((label, i) => (
          <div
            key={label}
            style={{ height: `${100 / L.sections.length}%` }}
            className="flex items-center justify-center"
          >
            <span className="bg-background/80 rounded-md border px-3 py-1.5 text-xs backdrop-blur">
              {i === 0 ? `${L.scrollHint} — ${label}` : label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollR3fInner() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const { values } = useDemoContext();
  const broken = booleanOf(values, "broken");

  const progressRef = useRef<ScrollProgress>({ value: 0 });
  const statsRef = useRef<FrameStats>({ r3fFrames: 0, extraRenders: 0 });
  const invalidateRef = useRef<(() => void) | null>(null);

  return (
    <div className="relative h-full w-full">
      <DemoCanvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <InvalidateBridge invalidateRef={invalidateRef} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 4]} intensity={1.2} />
        <Scene progressRef={progressRef} broken={broken} stats={statsRef} />
      </DemoCanvas>
      <ScrollArea
        progressRef={progressRef}
        invalidateRef={invalidateRef}
        L={L}
      />
      <StatsReadout stats={statsRef} progressRef={progressRef} L={L} />
    </div>
  );
}

export default function ScrollTriggerR3fSingleLoopDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "boolean",
          key: "broken",
          label: L.broken,
          defaultValue: false,
        },
      ]}
    >
      <ScrollR3fInner />
    </Demo>
  );
}
