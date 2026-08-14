"use client";

import { useLocale } from "next-intl";
import { Center, Html, OrbitControls, Text } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "drei essentials trực tiếp: Html, Text, Center",
    occlude: "Html: ẩn sau vật cản (occlude)",
    textSize: "Text: cỡ chữ (fontSize)",
    centered: "Center: tự căn giữa nhóm",
    on: "bật",
    off: "tắt",
    labelText: "phía sau quả cầu",
  },
  en: {
    title: "drei Essentials Live: Html, Text, Center",
    occlude: "Html: hide behind occluder",
    textSize: "Text: font size",
    centered: "Center: auto-center the group",
    on: "on",
    off: "off",
    labelText: "behind the sphere",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

// Off-center on purpose: the combined bounding box of these three boxes
// sits nowhere near the origin, so <Center> has something visible to fix.
const CLUSTER: { position: [number, number, number]; color: string }[] = [
  { position: [0, 0, 0], color: "#f97316" },
  { position: [1.3, 0.4, 0], color: "#3b82f6" },
  { position: [-0.5, 1.1, 0.3], color: "#22c55e" },
];

function ClusterBoxes() {
  return (
    <>
      {CLUSTER.map((box, i) => (
        <mesh key={i} position={box.position}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial color={box.color} />
        </mesh>
      ))}
    </>
  );
}

function EssentialsScene({
  occlude,
  textSize,
  centered,
  L,
}: {
  occlude: boolean;
  textSize: number;
  centered: boolean;
  L: Labels;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} />

      {/* OrbitControls: wraps three/examples/jsm's class, self-updates
          every frame and calls invalidate() for us under frameloop="demand". */}
      <OrbitControls />

      {/* Html: anchored behind the sphere along -z. With occlude on, drei
          raycasts camera→anchor each frame and hides the label whenever the
          sphere blocks the view — orbit around to see it appear/disappear. */}
      <group position={[-2.6, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <Html position={[0, 0, -1.2]} center occlude={occlude}>
          <div className="bg-background/90 rounded border px-2 py-1 text-[11px] whitespace-nowrap">
            {L.labelText}
          </div>
        </Html>
      </group>

      {/* Text: one SDF quad regardless of fontSize — no per-character mesh. */}
      <Text
        position={[0, 0, 0]}
        fontSize={textSize}
        color="#e5e7eb"
        anchorX="center"
        anchorY="middle"
      >
        drei
      </Text>

      {/* Center: only mounted while `centered` is on, so toggling shows the
          raw off-center cluster vs. the auto-centered one. */}
      <group position={[2.6, 0, 0]}>
        {centered ? (
          <Center>
            <ClusterBoxes />
          </Center>
        ) : (
          <ClusterBoxes />
        )}
      </group>
    </>
  );
}

function EssentialsDemoBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const occlude = booleanOf(values, "occlude", true);
  const textSize = numberOf(values, "textSize", 0.6);
  const centered = booleanOf(values, "centered", true);

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [0, 1.6, 7], fov: 50 }}>
        <EssentialsScene
          occlude={occlude}
          textSize={textSize}
          centered={centered}
          L={L}
        />
      </DemoCanvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2">
        <span className="bg-background/85 rounded border px-2 py-1 font-mono text-[11px] whitespace-nowrap">
          OrbitControls · Html ({occlude ? L.on : L.off}) · Text (
          {textSize.toFixed(2)}) · Center ({centered ? L.on : L.off})
        </span>
      </div>
    </div>
  );
}

export default function DreiEssentialsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={2}
      controls={[
        { kind: "boolean", key: "occlude", label: L.occlude, defaultValue: true },
        {
          kind: "number",
          key: "textSize",
          label: L.textSize,
          min: 0.25,
          max: 1.4,
          step: 0.05,
          defaultValue: 0.6,
        },
        { kind: "boolean", key: "centered", label: L.centered, defaultValue: true },
      ]}
    >
      <EssentialsDemoBody L={L} />
    </Demo>
  );
}
