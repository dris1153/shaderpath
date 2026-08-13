"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";
import { useDemoContext } from "./demo-context";

function FrameloopGate() {
  const { containerRef } = useDemoContext();
  useVisibleFrameloop(containerRef);
  return null;
}

// R3F canvas with the platform contract baked in: demand frameloop pumped
// only while visible (§8.3), clamped DPR (quality tiers land in Phase 10).
export function DemoCanvas({
  children,
  ...props
}: Omit<CanvasProps, "frameloop" | "dpr">) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      {...props}
    >
      <FrameloopGate />
      {children}
    </Canvas>
  );
}
