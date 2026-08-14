"use client";

import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { PrincipleStage } from "./principle-stage";
import { PRINCIPLE_OPTIONS, type PrincipleKind } from "./principle-labels";

const LABELS = {
  vi: { title: "Sân khấu nguyên tắc animation", principle: "Nguyên tắc" },
  en: { title: "Animation Principle Stage", principle: "Principle" },
} as const;

export default function AnimationPrinciplesForUiDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const loc: "vi" | "en" = locale === "en" ? "en" : "vi";
  const options = PRINCIPLE_OPTIONS[loc];
  const keys = Object.keys(options) as PrincipleKind[];

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "principle",
          label: L.principle,
          defaultValue: "anticipation",
          options: keys.map((value) => ({ value, label: options[value] })),
        },
      ]}
    >
      <PrincipleStage />
    </Demo>
  );
}
