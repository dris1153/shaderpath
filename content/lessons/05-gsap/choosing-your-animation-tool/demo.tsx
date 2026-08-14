"use client";

import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import { CssCard, GsapCard, WaapiCard } from "./demo-card-implementations";
import { CARD_LABELS, SOURCE_CSS, SOURCE_GSAP, SOURCE_WAAPI } from "./demo-sources";

const LABELS = {
  vi: {
    title: "Cùng một thẻ, ba cách hiện thực",
    tool: "Cơ chế",
    css: "CSS (class-driven)",
    waapi: "Hand-rolled WAAPI spring",
    gsap: "GSAP",
    hint: "Rê chuột / nhấn giữ / bấm nút trên thẻ bên trái. Panel bên phải chỉ hiện source rút gọn của cơ chế đang chọn — thẻ luôn thật, luôn chạy.",
  },
  en: {
    title: "Same Card, Three Implementations",
    tool: "Mechanism",
    css: "CSS (class-driven)",
    waapi: "Hand-rolled WAAPI spring",
    gsap: "GSAP",
    hint: "Hover / press / click the card on the left. The right panel only shows a condensed source of the selected mechanism — the card is always real, always running.",
  },
} as const;

type ToolKind = "css" | "waapi" | "gsap";

const SOURCES: Record<ToolKind, string> = {
  css: SOURCE_CSS,
  waapi: SOURCE_WAAPI,
  gsap: SOURCE_GSAP,
};

function ToolStage() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const loc: "vi" | "en" = locale === "en" ? "en" : "vi";
  const L = LABELS[loc];
  const tool = stringOf(values, "tool", "css") as ToolKind;
  const cardLabels = CARD_LABELS[loc];

  return (
    <div className="flex size-full flex-col md:flex-row">
      <div className="flex h-1/2 w-full items-center justify-center p-6 md:h-full md:w-1/2">
        {tool === "css" && <CssCard L={cardLabels} />}
        {tool === "waapi" && <WaapiCard L={cardLabels} />}
        {tool === "gsap" && <GsapCard L={cardLabels} />}
      </div>
      <div className="bg-background/60 h-1/2 w-full overflow-auto border-t p-3 md:h-full md:w-1/2 md:border-t-0 md:border-l">
        <p className="text-muted-foreground mb-2 text-[11px] italic">{L.hint}</p>
        <pre className="overflow-x-auto text-[11px] leading-4 whitespace-pre">
          <code>{SOURCES[tool]}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ChoosingYourAnimationToolDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "tool",
          label: L.tool,
          defaultValue: "css",
          options: [
            { value: "css", label: L.css },
            { value: "waapi", label: L.waapi },
            { value: "gsap", label: L.gsap },
          ],
        },
      ]}
    >
      <ToolStage />
    </Demo>
  );
}
