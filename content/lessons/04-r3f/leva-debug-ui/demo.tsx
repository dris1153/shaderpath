"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";

// leva isn't installed in this repo (spec: theory shows real leva code in
// fenced blocks; this demo mimics the tweak-then-copy workflow with the
// platform's own controls — grouped labels + a leva-style readout panel).
const LABELS = {
  vi: {
    title: "Workflow tinh chỉnh vật liệu — panel kiểu leva",
    color: "Material · Màu",
    roughness: "Material · Nhám",
    metalness: "Material · Kim loại",
    intensity: "Light · Cường độ",
    colorNames: { orange: "Cam", sky: "Xanh da trời", lime: "Xanh chanh", pink: "Hồng" },
  },
  en: {
    title: "Material Tuning Workflow — a leva-style Panel",
    color: "Material · Color",
    roughness: "Material · Roughness",
    metalness: "Material · Metalness",
    intensity: "Light · Intensity",
    colorNames: { orange: "Orange", sky: "Sky", lime: "Lime", pink: "Pink" },
  },
} as const;

type ColorKey = "orange" | "sky" | "lime" | "pink";
const COLOR_KEYS: ColorKey[] = ["orange", "sky", "lime", "pink"];
const COLOR_HEX: Record<ColorKey, string> = {
  orange: "#f97316",
  sky: "#38bdf8",
  lime: "#a3e635",
  pink: "#f472b6",
};
const DEFAULT_COLOR: ColorKey = "orange";

function TunedMaterialScene() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const colorKey = stringOf(values, "color", DEFAULT_COLOR) as ColorKey;
  const color = COLOR_HEX[colorKey];
  const roughness = numberOf(values, "roughness", 0.4);
  const metalness = numberOf(values, "metalness", 0.2);
  const intensity = numberOf(values, "intensity", 1.2);

  useEffect(() => {
    invalidate();
  }, [colorKey, roughness, metalness, intensity, invalidate]);

  // Exactly what a real `useControls` call would return — the snippet a
  // learner would copy into source once the tuning loop below is done.
  const snippet = useMemo(
    () =>
      `{ color: "${color}", roughness: ${roughness.toFixed(2)}, metalness: ${metalness.toFixed(2)}, intensity: ${intensity.toFixed(2)} }`,
    [color, roughness, metalness, intensity],
  );

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[2.5, 3, 2.5]} intensity={intensity} />
      <mesh rotation={[0.4, 0.6, 0]}>
        <torusKnotGeometry args={[0.8, 0.28, 128, 32]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>
      <Html position={[-1.9, 1.55, 0]} occlude={false}>
        <div className="w-56 space-y-1 rounded-md border border-white/10 bg-[#151922]/95 p-2 font-mono text-[10px] text-white/80 shadow-lg">
          <div className="mb-1 text-[9px] font-semibold tracking-wide text-white/40 uppercase">
            material
          </div>
          <div>
            color <span className="text-white">{color}</span>
          </div>
          <div>
            roughness <span className="text-white">{roughness.toFixed(2)}</span>
          </div>
          <div>
            metalness <span className="text-white">{metalness.toFixed(2)}</span>
          </div>
          <div className="mt-1 mb-1 text-[9px] font-semibold tracking-wide text-white/40 uppercase">
            light
          </div>
          <div>
            intensity <span className="text-white">{intensity.toFixed(2)}</span>
          </div>
          <div className="mt-1.5 border-t border-white/10 pt-1 text-white/50">
            useControls(() =&gt; ({snippet}))
          </div>
        </div>
      </Html>
    </>
  );
}

export default function LevaDebugUiDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "color",
          label: L.color,
          defaultValue: DEFAULT_COLOR,
          options: COLOR_KEYS.map((k) => ({ value: k, label: L.colorNames[k] })),
        },
        { kind: "number", key: "roughness", label: L.roughness, min: 0, max: 1, step: 0.01, defaultValue: 0.4 },
        { kind: "number", key: "metalness", label: L.metalness, min: 0, max: 1, step: 0.01, defaultValue: 0.2 },
        { kind: "number", key: "intensity", label: L.intensity, min: 0, max: 4, step: 0.1, defaultValue: 1.2 },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <TunedMaterialScene />
      </DemoCanvas>
    </Demo>
  );
}
