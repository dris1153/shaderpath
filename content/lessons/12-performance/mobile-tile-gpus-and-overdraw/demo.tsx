"use client";

import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { OverdrawStackPanel } from "./overdraw-stack";
import { ParticleQuadComparePanel } from "./particle-quad-compare";

const LABELS = {
  vi: {
    title: "Phòng thí nghiệm Overdraw",
    count: "Số lớp trong suốt",
    viz: "Overdraw visualization (additive-white)",
    quadMode: "Particle quad",
    tight: "Tight",
    loose: "Loose",
    caption:
      "Đo trên máy dev — desktop giấu đi cái mà một điện thoại tầm trung sẽ CẢM NHẬN thật (nhiệt, tụt khung hình, hao pin). Đây không phải benchmark mobile, chỉ là cách nhìn thấy cơ chế bằng mắt trên máy bạn đang có.",
  },
  en: {
    title: "Overdraw Laboratory",
    count: "Transparent layer count",
    viz: "Overdraw visualization (additive-white)",
    quadMode: "Particle quad",
    tight: "Tight",
    loose: "Loose",
    caption:
      "Measured on the dev machine — desktop hides what a mid-range phone would actually FEEL (heat, dropped frames, battery drain). This isn't a mobile benchmark, just a way to see the mechanism on the hardware you already have.",
  },
} as const;

export default function MobileTileGpusAndOverdrawDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={4 / 3}
      controls={[
        { kind: "number", key: "count", label: L.count, min: 1, max: 40, step: 1, defaultValue: 8 },
        { kind: "boolean", key: "viz", label: L.viz, defaultValue: false },
        {
          kind: "select",
          key: "quadMode",
          label: L.quadMode,
          defaultValue: "tight",
          options: [
            { value: "tight", label: L.tight },
            { value: "loose", label: L.loose },
          ],
        },
      ]}
    >
      <div className="flex h-full flex-col gap-2 p-2">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
          <OverdrawStackPanel />
          <ParticleQuadComparePanel />
        </div>
        <p className="text-muted-foreground shrink-0 px-1 text-[11px] leading-snug">{L.caption}</p>
      </div>
    </Demo>
  );
}
