"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";
import { useQuality } from "@/components/providers/quality-provider";
import { useDemoContext } from "./demo-context";

function FrameloopGate() {
  const { containerRef } = useDemoContext();
  useVisibleFrameloop(containerRef);
  return null;
}

// R3F canvas with the platform contract baked in: demand frameloop pumped
// only while visible (§8.3), DPR clamped per the detected/overridden quality tier.
export function DemoCanvas({
  children,
  onCreated,
  ...props
}: Omit<CanvasProps, "frameloop" | "dpr">) {
  const { dpr } = useQuality();
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      {...props}
      onCreated={(state) => {
        // `manual: true` tells R3F to stop managing the camera entirely, which
        // includes never calling updateProjectionMatrix. The left/right/top/
        // bottom a demo passes then land on the object but never reach the
        // projection matrix, and the canvas renders empty. Bake them once.
        if ((state.camera as { manual?: boolean }).manual) {
          state.camera.updateProjectionMatrix();
        }
        onCreated?.(state);
      }}
    >
      <FrameloopGate />
      {children}
    </Canvas>
  );
}
