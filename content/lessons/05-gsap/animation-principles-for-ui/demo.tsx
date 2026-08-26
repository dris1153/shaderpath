"use client";

import { pick } from "@/content/types";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { PrincipleStage } from "./principle-stage";
import { PRINCIPLE_OPTIONS, type PrincipleKind } from "./principle-labels";

const LABELS = {
  vi: {
    hint: "Xem panel 'chưa áp dụng' trước rồi mới xem panel kia: cùng một quãng đường, cùng một thời lượng — khác biệt nằm hết ở phần đầu và cuối chuyển động.",
    title: "Sân khấu nguyên tắc animation",
    principle: "Nguyên tắc",
  },
  en: {
    hint: "Watch the unapplied panel first, then the other: same distance, same duration — the whole difference lives in how the motion starts and stops.",
    title: "Animation Principle Stage",
    principle: "Principle",
  },
} as const;

export default function AnimationPrinciplesForUiDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const loc: "vi" | "en" = locale === "en" ? "en" : "vi";
  const options = pick(PRINCIPLE_OPTIONS, loc);
  const keys = Object.keys(options) as PrincipleKind[];

  return (
    <Demo
      title={L.title}
      hint={L.hint}
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
