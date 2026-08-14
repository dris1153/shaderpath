"use client";

import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf, type ControlValues } from "@/components/viz/control-schema";
import { PlasticScene, type PlasticToggles } from "./plastic-scene";

const LABELS = {
  vi: {
    title: "Chẩn đoán cảnh 'nhựa'",
    preset: "Preset",
    presetCustom: "Tuỳ chỉnh (theo từng toggle)",
    presetBad: "Toàn bộ lỗi (bad)",
    presetFixed: "Sửa hết (fixed)",
    roughnessFix: "1. Roughness variation",
    albedoFix: "2. Albedo đúng giá trị",
    metalnessFix: "3. Metalness/Fresnel đúng",
    iblFix: "4. Bật IBL",
    aoFix: "5. Contact shadow/AO",
    normalFix: "6. Normal map",
    tonemapFix: "7. Tone mapping",
  },
  en: {
    title: "Diagnose the 'Plastic' Scene",
    preset: "Preset",
    presetCustom: "Custom (per toggle)",
    presetBad: "All broken (bad)",
    presetFixed: "Fix everything (fixed)",
    roughnessFix: "1. Roughness variation",
    albedoFix: "2. Correct albedo",
    metalnessFix: "3. Correct metalness/Fresnel",
    iblFix: "4. Enable IBL",
    aoFix: "5. Contact shadow/AO",
    normalFix: "6. Normal map",
    tonemapFix: "7. Tone mapping",
  },
} as const;

const ALL_BROKEN: PlasticToggles = {
  roughnessFix: false,
  albedoFix: false,
  metalnessFix: false,
  iblFix: false,
  aoFix: false,
  normalFix: false,
  tonemapFix: false,
};

const ALL_FIXED: PlasticToggles = {
  roughnessFix: true,
  albedoFix: true,
  metalnessFix: true,
  iblFix: true,
  aoFix: true,
  normalFix: true,
  tonemapFix: true,
};

function resolveToggles(values: ControlValues): PlasticToggles {
  const preset = stringOf(values, "preset", "custom");
  if (preset === "bad") return ALL_BROKEN;
  if (preset === "fixed") return ALL_FIXED;
  return {
    roughnessFix: booleanOf(values, "roughnessFix", false),
    albedoFix: booleanOf(values, "albedoFix", false),
    metalnessFix: booleanOf(values, "metalnessFix", false),
    iblFix: booleanOf(values, "iblFix", false),
    aoFix: booleanOf(values, "aoFix", false),
    normalFix: booleanOf(values, "normalFix", false),
    tonemapFix: booleanOf(values, "tonemapFix", false),
  };
}

function DiagnosticScene() {
  const { values } = useDemoContext();
  const toggles = resolveToggles(values);
  return <PlasticScene toggles={toggles} />;
}

export default function WhyAssetsLookLikePlasticDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "preset",
          label: L.preset,
          defaultValue: "custom",
          options: [
            { value: "custom", label: L.presetCustom },
            { value: "bad", label: L.presetBad },
            { value: "fixed", label: L.presetFixed },
          ],
        },
        { kind: "boolean", key: "roughnessFix", label: L.roughnessFix, defaultValue: false },
        { kind: "boolean", key: "albedoFix", label: L.albedoFix, defaultValue: false },
        { kind: "boolean", key: "metalnessFix", label: L.metalnessFix, defaultValue: false },
        { kind: "boolean", key: "iblFix", label: L.iblFix, defaultValue: false },
        { kind: "boolean", key: "aoFix", label: L.aoFix, defaultValue: false },
        { kind: "boolean", key: "normalFix", label: L.normalFix, defaultValue: false },
        { kind: "boolean", key: "tonemapFix", label: L.tonemapFix, defaultValue: false },
      ]}
    >
      <DemoCanvas camera={{ position: [2.1, 1.5, 3.4], fov: 42 }}>
        <DiagnosticScene />
      </DemoCanvas>
    </Demo>
  );
}
