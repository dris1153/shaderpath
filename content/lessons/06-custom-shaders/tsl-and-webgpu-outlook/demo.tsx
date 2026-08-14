"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { color, mix, sin, time, uniform, uv } from "three/tsl";
import { MeshBasicNodeMaterial, WebGPURenderer } from "three/webgpu";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "TSL trực tiếp: một colorNode, hai backend",
    freq: "Tần số sọc",
    sourceHeading: "TSL source đang chạy (material.colorNode)",
    backendPending: "Đang khởi tạo renderer…",
    backendWebgpu: "Backend: WebGPU thật — TSL biên dịch ra WGSL",
    backendWebgl2Node:
      "Backend: WebGL2 (WebGPURenderer tự fallback vì trình duyệt không có WebGPU) — cùng TSL, biên dịch ra GLSL",
    backendClassic:
      "WebGPURenderer không khởi tạo được ở trình duyệt này — hiển thị màu tĩnh thay thế",
  },
  en: {
    title: "TSL live: one colorNode, two backends",
    freq: "Stripe frequency",
    sourceHeading: "Live TSL source (material.colorNode)",
    backendPending: "Initializing renderer…",
    backendWebgpu: "Backend: real WebGPU — TSL compiled to WGSL",
    backendWebgl2Node:
      "Backend: WebGL2 (WebGPURenderer auto-fallback, no WebGPU in this browser) — same TSL, compiled to GLSL",
    backendClassic:
      "WebGPURenderer failed to initialize in this browser — showing a static color instead",
  },
} as const;

// Exactly what runs below — shown verbatim so the reader sees the code driving
// the mesh, not a paraphrase (the GLSL twin lives in theory.mdx for comparison).
const TSL_SOURCE = `const uFreq = uniform(10);

material.colorNode = mix(
  color(0x0ea5e9),
  color(0xf59e0b),
  sin(uv().x.mul(uFreq).add(time)).mul(0.5).add(0.5),
);`;

type Backend = "pending" | "webgpu" | "webgl2-node" | "classic";

// `RootState["gl"]` is typed as THREE.WebGLRenderer even when a WebGPURenderer
// was actually installed via the async `gl` factory below — duck-type the two
// flags three sets at runtime instead of trusting the R3F type.
function detectBackend(gl: THREE.WebGLRenderer): Backend {
  const anyGl = gl as unknown as {
    isWebGPURenderer?: boolean;
    backend?: { isWebGPUBackend?: boolean };
  };
  if (!anyGl.isWebGPURenderer) return "classic";
  return anyGl.backend?.isWebGPUBackend ? "webgpu" : "webgl2-node";
}

function TslSphere() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  // Computed straight from the live renderer, not from a prop: correct on the
  // very first paint, since R3F only mounts children after `gl` is final.
  const backend = useMemo(() => detectBackend(gl), [gl]);
  const meshRef = useRef<THREE.Mesh>(null);

  const uFreq = useMemo(() => uniform(10), []);
  const material = useMemo(() => {
    const m = new MeshBasicNodeMaterial();
    // The exact 4-line node graph in TSL_SOURCE above.
    m.colorNode = mix(
      color(0x0ea5e9),
      color(0xf59e0b),
      sin(uv().x.mul(uFreq).add(time)).mul(0.5).add(0.5),
    );
    return m;
  }, [uFreq]);

  // <primitive> is NOT auto-disposed by R3F (only JSX-intrinsic materials
  // are) — dispose the one we constructed by hand ourselves.
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    uFreq.value = numberOf(values, "freq", 10);
    invalidate();
  }, [values, uFreq, invalidate]);

  // Continuous but cheap: FrameloopGate already pumps invalidate() while the
  // demo is visible (§8.3), so this rotation and the TSL `time` node both
  // animate for free and both freeze off-screen with zero extra code here.
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 48, 32]} />
      {backend === "classic" ? (
        <meshBasicMaterial color="#0ea5e9" />
      ) : (
        <primitive object={material} attach="material" />
      )}
    </mesh>
  );
}

function TslPanel() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const [backendLabel, setBackendLabel] = useState<string>(L.backendPending);

  return (
    <div className="flex size-full flex-col md:flex-row">
      <div className="relative h-1/2 w-full md:h-full md:w-1/2">
        <DemoCanvas
          camera={{ position: [0, 0, 3.2], fov: 42 }}
          gl={async (defaultProps) => {
            try {
              const renderer = new WebGPURenderer({
                canvas: defaultProps.canvas as HTMLCanvasElement,
                antialias: true,
                powerPreference: "high-performance",
              });
              // WebGPURenderer already falls back to a WebGL2 backend
              // internally when navigator.gpu/an adapter is unavailable — the
              // catch below only guards the near-impossible case where even
              // that fallback throws, so this demo never white-screens.
              await renderer.init();
              return renderer;
            } catch {
              return new THREE.WebGLRenderer({
                canvas: defaultProps.canvas as HTMLCanvasElement,
                antialias: true,
              });
            }
          }}
          onCreated={(state) => {
            const b = detectBackend(state.gl);
            setBackendLabel(
              b === "webgpu"
                ? L.backendWebgpu
                : b === "webgl2-node"
                  ? L.backendWebgl2Node
                  : L.backendClassic,
            );
          }}
        >
          <TslSphere />
        </DemoCanvas>
        <div className="text-muted-foreground pointer-events-none absolute bottom-2 left-2 max-w-[92%] rounded bg-background/80 px-2 py-1 text-[10px] font-medium sm:text-xs">
          {backendLabel}
        </div>
      </div>
      <div className="bg-background/60 h-1/2 w-full overflow-auto border-t p-3 md:h-full md:w-1/2 md:border-t-0 md:border-l">
        <p className="text-muted-foreground mb-2 text-xs font-medium">
          {L.sourceHeading}
        </p>
        <pre className="overflow-x-auto text-[11px] leading-4 whitespace-pre">
          <code>{TSL_SOURCE}</code>
        </pre>
      </div>
    </div>
  );
}

export default function TslWebgpuOutlookDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "number",
          key: "freq",
          label: L.freq,
          min: 2,
          max: 40,
          step: 1,
          defaultValue: 10,
        },
      ]}
    >
      <TslPanel />
    </Demo>
  );
}
