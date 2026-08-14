"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";

// Registered once at module load (idempotent, safe under HMR) — the theory's
// own rule: create a CustomEase once, never inside a render.
gsap.registerPlugin(CustomEase);
const SIGNATURE_EASE = "shaderpathSignature";
// CSS cubic-bezier(0.34, 1.56, 0.64, 1) — easings.net's easeOutBack —
// rewritten as the single-segment SVG path CustomEase expects.
CustomEase.create(SIGNATURE_EASE, "M0,0 C0.34,1.56 0.64,1 1,1");

const DEFAULT_EASE = "power2.out";

const EASE_VALUES: { value: string; vi: string; en: string }[] = [
  { value: "none", vi: "Linear (không ease)", en: "Linear (no ease)" },
  { value: "power1.out", vi: "power1.out (dốc nhẹ)", en: "power1.out (gentle)" },
  { value: "power1.inOut", vi: "power1.inOut", en: "power1.inOut" },
  { value: "power2.out", vi: "power2.out", en: "power2.out" },
  { value: "power2.inOut", vi: "power2.inOut", en: "power2.inOut" },
  { value: "power3.out", vi: "power3.out", en: "power3.out" },
  { value: "power4.out", vi: "power4.out", en: "power4.out" },
  { value: "sine.inOut", vi: "sine.inOut (mượt)", en: "sine.inOut (smooth)" },
  { value: "expo.out", vi: "expo.out (kịch tính)", en: "expo.out (dramatic)" },
  { value: "back.out", vi: "back.out (vọt quá)", en: "back.out (overshoot)" },
  { value: "elastic.out", vi: "elastic.out (đàn hồi)", en: "elastic.out (springy)" },
  { value: "bounce.out", vi: "bounce.out (nảy)", en: "bounce.out (bouncy)" },
  { value: SIGNATURE_EASE, vi: "Tuỳ biến (signature)", en: "Custom (signature)" },
];

const LABELS = {
  vi: {
    title: "Ease explorer: đường cong, quả bóng, và so sánh với linear",
    easeLabel: "Ease",
    durationLabel: "Thời lượng (s)",
    compareLabel: "So sánh với linear",
    curveAria: "Đường cong ease đã chọn",
    trackLabel: "Ease đã chọn",
    linearLabel: "Linear (đối chứng)",
  },
  en: {
    title: "Ease explorer: the curve, the ball, and a linear compare",
    easeLabel: "Ease",
    durationLabel: "Duration (s)",
    compareLabel: "Compare with linear",
    curveAria: "Selected ease curve",
    trackLabel: "Selected ease",
    linearLabel: "Linear (reference)",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

// Sample gsap.parseEase at 100 points along t ∈ [0,1] — the exact technique
// GSAP's own Ease Visualizer uses to draw a curve without a closed-form plot.
const SAMPLE_COUNT = 100;

function sampleEase(name: string): number[] {
  const ease = gsap.parseEase(name);
  const samples: number[] = [];
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    samples.push(ease(i / SAMPLE_COUNT));
  }
  return samples;
}

const SVG_W = 300;
const SVG_H = 140;
const PAD = 10;

function valueToY(v: number, domainMin: number, domainMax: number): number {
  const span = Math.max(domainMax - domainMin, 1e-6);
  return SVG_H - PAD - ((v - domainMin) / span) * (SVG_H - PAD * 2);
}

function toPolylinePoints(
  samples: number[],
  domainMin: number,
  domainMax: number,
): string {
  return samples
    .map((v, i) => {
      const x = PAD + (i / (samples.length - 1)) * (SVG_W - PAD * 2);
      return `${x.toFixed(1)},${valueToY(v, domainMin, domainMax).toFixed(1)}`;
    })
    .join(" ");
}

// back/elastic overshoot past [0,1] — the plotted domain is derived from the
// ACTUAL sampled values (padded 10%) instead of a hardcoded range, so any
// ease (including a custom one) always fits the frame.
function EaseCurve({
  primary,
  reference,
  ariaLabel,
}: {
  primary: number[];
  reference: number[] | null;
  ariaLabel: string;
}) {
  const all = reference ? primary.concat(reference) : primary;
  const rawMin = Math.min(0, ...all);
  const rawMax = Math.max(1, ...all);
  const pad = (rawMax - rawMin) * 0.1 || 0.1;
  const domainMin = rawMin - pad;
  const domainMax = rawMax + pad;
  const zeroY = valueToY(0, domainMin, domainMax);
  const oneY = valueToY(1, domainMin, domainMax);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      role="img"
      aria-label={ariaLabel}
      className="bg-background h-32 w-full rounded-md border"
    >
      <line
        x1={PAD}
        x2={SVG_W - PAD}
        y1={zeroY}
        y2={zeroY}
        className="stroke-border"
        strokeDasharray="2 3"
      />
      <line
        x1={PAD}
        x2={SVG_W - PAD}
        y1={oneY}
        y2={oneY}
        className="stroke-border"
        strokeDasharray="2 3"
      />
      {reference && (
        <polyline
          points={toPolylinePoints(reference, domainMin, domainMax)}
          className="fill-none stroke-muted-foreground"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}
      <polyline
        points={toPolylinePoints(primary, domainMin, domainMax)}
        className="fill-none stroke-primary"
        strokeWidth={2}
      />
    </svg>
  );
}

function EaseTrack({
  label,
  trackRef,
  ballRef,
  ballClassName,
}: {
  label: string;
  trackRef: RefObject<HTMLDivElement | null>;
  ballRef: RefObject<HTMLDivElement | null>;
  ballClassName: string;
}) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <div ref={trackRef} className="bg-muted relative mt-1 h-8 rounded-full">
        <div
          ref={ballRef}
          className={`absolute top-1/2 left-0 size-6 -translate-y-1/2 rounded-full ${ballClassName}`}
        />
      </div>
    </div>
  );
}

function EaseExplorer({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const track1Ref = useRef<HTMLDivElement>(null);
  const ball1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);
  const ball2Ref = useRef<HTMLDivElement>(null);

  const easeName = stringOf(values, "ease", DEFAULT_EASE);
  const duration = numberOf(values, "duration", 1.2);
  const compare = booleanOf(values, "compare", false);

  const primarySamples = useMemo(() => sampleEase(easeName), [easeName]);
  const referenceSamples = useMemo(
    () => (compare ? sampleEase("none") : null),
    [compare],
  );

  // Duration only scales TIME, never the eased shape (progress() is still
  // sampled 0..1) — the curve above stays identical while the ball's speed
  // changes, which is the exact point this control is meant to demonstrate.
  useGsapContext(() => {
    const track1 = track1Ref.current;
    const ball1 = ball1Ref.current;
    if (!track1 || !ball1) return;

    const distance1 = Math.max(0, track1.clientWidth - ball1.clientWidth);
    gsap.to(ball1, {
      x: distance1,
      duration,
      ease: easeName,
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.35,
    });

    // Reference ball always runs "none" (linear) — the direct demonstration
    // of "linear is almost always wrong for UI:" watch it fight for
    // attention next to any real ease at the exact same duration.
    if (compare) {
      const track2 = track2Ref.current;
      const ball2 = ball2Ref.current;
      if (track2 && ball2) {
        const distance2 = Math.max(0, track2.clientWidth - ball2.clientWidth);
        gsap.to(ball2, {
          x: distance2,
          duration,
          ease: "none",
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.35,
        });
      }
    }
  }, [easeName, duration, compare]);

  return (
    <div className="flex size-full flex-col justify-center gap-4 p-4">
      <EaseCurve
        primary={primarySamples}
        reference={referenceSamples}
        ariaLabel={`${L.curveAria}: ${easeName}`}
      />
      <div className="flex flex-col gap-3">
        <EaseTrack
          label={`${L.trackLabel}: ${easeName}`}
          trackRef={track1Ref}
          ballRef={ball1Ref}
          ballClassName="bg-primary"
        />
        {compare && (
          <EaseTrack
            label={L.linearLabel}
            trackRef={track2Ref}
            ballRef={ball2Ref}
            ballClassName="bg-muted-foreground"
          />
        )}
      </div>
    </div>
  );
}

export default function EasingInDepthDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const loc: "vi" | "en" = locale === "en" ? "en" : "vi";

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "ease",
          label: L.easeLabel,
          defaultValue: DEFAULT_EASE,
          options: EASE_VALUES.map((e) => ({ value: e.value, label: e[loc] })),
        },
        {
          kind: "number",
          key: "duration",
          label: L.durationLabel,
          min: 0.4,
          max: 2.5,
          step: 0.1,
          defaultValue: 1.2,
        },
        {
          kind: "boolean",
          key: "compare",
          label: L.compareLabel,
          defaultValue: false,
        },
      ]}
    >
      <EaseExplorer L={L} />
    </Demo>
  );
}
