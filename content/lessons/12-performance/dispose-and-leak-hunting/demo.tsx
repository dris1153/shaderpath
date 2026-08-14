"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import { Button } from "@/components/ui/button";
import { useDisposable } from "@/lib/hooks/use-disposable";

const LABELS = {
  vi: {
    title: "Phòng thí nghiệm leak: mount/unmount, xem VRAM có quay về 0",
    mode: "Chế độ",
    modeClean: "Sạch — useDisposable",
    modeLeakySkip: "Rò rỉ — bỏ qua dispose",
    modeLeakyRaf: "Rò rỉ — RAF sống sót",
    mount: "Mount",
    unmount: "Unmount",
    auto: "Tự động ×10",
    geo: "geo",
    tex: "tex",
    loops: "RAF sống sót",
    cycles: "chu kỳ",
  },
  en: {
    title: "Leak lab: mount/unmount, watch whether VRAM returns to 0",
    mode: "Mode",
    modeClean: "Clean — useDisposable",
    modeLeakySkip: "Leaky — skip disposal",
    modeLeakyRaf: "Leaky — surviving RAF",
    mount: "Mount",
    unmount: "Unmount",
    auto: "Auto ×10",
    geo: "geo",
    tex: "tex",
    loops: "surviving RAF",
    cycles: "cycles",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];
type LeakMode = "clean" | "leaky-skip" | "leaky-raf";

function makeSwatchTexture(hue: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// Only the texture is built with `new` here — geometry/material come from
// JSX tags, so R3F auto-disposes them on unmount. The texture is the exact
// gap useDisposable exists to fill (§case study in theory).
function CleanBox() {
  const disposables = useDisposable();
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(
    () => disposables.register(makeSwatchTexture(150)),
    [disposables],
  );

  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.6;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// BUG: geometry + texture + material all built with `new`, attached via
// <primitive>, never disposed — every mount leaks all three permanently.
function LeakySkipBox() {
  const mesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const texture = makeSwatchTexture(0);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
  }, []);

  useFrame((_state, delta) => {
    mesh.rotation.y += delta * 0.6;
  });

  return <primitive object={mesh} />;
}

// BUG #1: same GPU leak as LeakySkipBox. BUG #2: a hand-rolled RAF loop
// OUTSIDE useFrame/useVisibleRaf whose cleanup forgets cancelAnimationFrame
// — the loop (and its closure over `mesh`) keeps running and keeps `mesh`
// alive long after unmount. `onSurvive` fires exactly once, at the moment
// this instance unmounts without canceling its loop.
function LeakyRafBox({ onSurvive }: { onSurvive: () => void }) {
  const mesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const texture = makeSwatchTexture(260);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
  }, []);

  useEffect(() => {
    const tick = () => {
      mesh.rotation.y += 0.01;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      // BUG: the real fix is `cancelAnimationFrame(handle)` here — this
      // loop keeps no handle to cancel, so it survives unmount and keeps
      // `mesh` (and its GPU resources) alive forever.
      onSurvive();
    };
  }, [mesh, onSurvive]);

  return <primitive object={mesh} />;
}

// Reads renderer.info.memory every rendered frame, only calls back when a
// count actually changes (mount/unmount) — the first scoreboard the theory
// describes, read continuously instead of trusting a single glance.
function MemoryProbe({
  onChange,
}: {
  onChange: (mem: { geometries: number; textures: number }) => void;
}) {
  const gl = useThree((s) => s.gl);
  const last = useRef({ geometries: -1, textures: -1 });

  useFrame(() => {
    const { geometries, textures } = gl.info.memory;
    if (
      geometries !== last.current.geometries ||
      textures !== last.current.textures
    ) {
      last.current = { geometries, textures };
      onChange({ geometries, textures });
    }
  });

  return null;
}

function LeakLabBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const mode = stringOf(values, "mode", "clean") as LeakMode;
  const [mounted, setMounted] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [survivingLoops, setSurvivingLoops] = useState(0);
  const [mem, setMem] = useState({ geometries: 0, textures: 0 });
  const [autoRunning, setAutoRunning] = useState(false);

  const toggle = useCallback(() => {
    setMounted((prev) => {
      if (prev) setCycles((c) => c + 1); // completed a full cycle on unmount
      return !prev;
    });
  }, []);

  const handleSurvive = useCallback(() => {
    setSurvivingLoops((n) => n + 1);
  }, []);

  const runAutoCycle = useCallback(() => {
    setAutoRunning(true);
    let remaining = 10;
    const step = () => {
      if (remaining <= 0) {
        setAutoRunning(false);
        return;
      }
      remaining--;
      toggle(); // mount
      setTimeout(() => {
        toggle(); // unmount
        setTimeout(step, 120);
      }, 220);
    };
    step();
  }, [toggle]);

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 4, 5]} intensity={50} />
        <MemoryProbe onChange={setMem} />
        {mounted && mode === "clean" && <CleanBox />}
        {mounted && mode === "leaky-skip" && <LeakySkipBox />}
        {mounted && mode === "leaky-raf" && (
          <LeakyRafBox onSurvive={handleSurvive} />
        )}
      </DemoCanvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-2">
        <span className="bg-background/85 rounded px-2 py-1 text-xs font-medium">
          {mode === "clean"
            ? L.modeClean
            : mode === "leaky-skip"
              ? L.modeLeakySkip
              : L.modeLeakyRaf}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "clean" ? "default" : "destructive"}
            onClick={toggle}
            disabled={autoRunning}
          >
            {mounted ? L.unmount : L.mount}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={runAutoCycle}
            disabled={autoRunning}
          >
            {L.auto}
          </Button>
        </div>
        <span className="bg-background/85 rounded px-2 py-1 font-mono text-[11px] whitespace-nowrap">
          {L.geo} {mem.geometries} · {L.tex} {mem.textures} · {L.loops}{" "}
          {survivingLoops} · {L.cycles} {cycles}
        </span>
      </div>
    </div>
  );
}

export default function DisposeAndLeakHuntingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "clean",
          options: [
            { value: "clean", label: L.modeClean },
            { value: "leaky-skip", label: L.modeLeakySkip },
            { value: "leaky-raf", label: L.modeLeakyRaf },
          ],
        },
      ]}
    >
      <LeakLabBody L={L} />
    </Demo>
  );
}
