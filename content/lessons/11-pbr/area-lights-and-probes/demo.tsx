"use client";

import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { Showroom } from "./showroom-scene";
import { ProbeCorner } from "./probe-corner";

const LABELS = {
  vi: {
    title: "Showroom: RectAreaLight & Light Probe",
    lightWidth: "Bề rộng panel",
    lightHeight: "Chiều cao panel",
    lightIntensity: "Cường độ panel",
    floorRoughness: "Roughness sàn",
    useProbes: "Nội suy probe (tắt = ambient phẳng)",
  },
  en: {
    title: "Showroom: RectAreaLight & Light Probes",
    lightWidth: "Panel width",
    lightHeight: "Panel height",
    lightIntensity: "Panel intensity",
    floorRoughness: "Floor roughness",
    useProbes: "Probe interpolation (off = flat ambient)",
  },
} as const;

function ShowroomScene() {
  const { values } = useDemoContext();
  const lightWidth = numberOf(values, "lightWidth", 3);
  const lightHeight = numberOf(values, "lightHeight", 1.6);
  const lightIntensity = numberOf(values, "lightIntensity", 6);
  const floorRoughness = numberOf(values, "floorRoughness", 0.15);
  const useProbes = booleanOf(values, "useProbes", true);

  return (
    <>
      <Showroom
        lightWidth={lightWidth}
        lightHeight={lightHeight}
        lightIntensity={lightIntensity}
        floorRoughness={floorRoughness}
      />
      <ProbeCorner useProbes={useProbes} />
    </>
  );
}

export default function AreaLightsAndProbesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "number", key: "lightWidth", label: L.lightWidth, min: 0.6, max: 5, step: 0.1, defaultValue: 3 },
        { kind: "number", key: "lightHeight", label: L.lightHeight, min: 0.4, max: 3, step: 0.1, defaultValue: 1.6 },
        { kind: "number", key: "lightIntensity", label: L.lightIntensity, min: 1, max: 20, step: 0.5, defaultValue: 6 },
        { kind: "number", key: "floorRoughness", label: L.floorRoughness, min: 0.03, max: 0.6, step: 0.01, defaultValue: 0.15 },
        { kind: "boolean", key: "useProbes", label: L.useProbes, defaultValue: true },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 2.7, 6.6], fov: 48 }}>
        <ShowroomScene />
      </DemoCanvas>
    </Demo>
  );
}
