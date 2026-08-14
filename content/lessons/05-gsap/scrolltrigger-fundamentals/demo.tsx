"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";

gsap.registerPlugin(ScrollTrigger);

const LABELS = {
  vi: {
    title: "Sân chơi ScrollTrigger: scrub, pin & toggleActions",
    smoothing: "Độ mượt (s)",
    markers: "Markers debug",
    snap: "Snap từng bước",
    scrollHint: "Cuộn bên trong khung này ↓",
    s1Title: "Trigger 1 — scrub",
    s1Body:
      "Thanh tiến trình phía trên bám sát % cuộn của toàn bộ khối nội dung này (start: top top, end: bottom bottom).",
    pinTitle: "Trigger 2 — pin + scrub",
    pinBody: "Panel này bị ghim đứng yên — chỉ hình vuông xoay theo % cuộn.",
    s3Title: "Trigger 3 — toggleActions",
    s3Body:
      "Thẻ này KHÔNG scrub — nó chỉ play/reverse theo 4 verb onEnter/onLeave/onEnterBack/onLeaveBack.",
  },
  en: {
    title: "ScrollTrigger Playground: scrub, pin & toggleActions",
    smoothing: "Smoothing (s)",
    markers: "Debug markers",
    snap: "Snap to steps",
    scrollHint: "Scroll inside this frame ↓",
    s1Title: "Trigger 1 — scrub",
    s1Body:
      "The bar above tracks this entire content block's scroll % 1:1 (start: top top, end: bottom bottom).",
    pinTitle: "Trigger 2 — pin + scrub",
    pinBody: "This panel is pinned in place — only the square rotates with scroll %.",
    s3Title: "Trigger 3 — toggleActions",
    s3Body:
      "This card is NOT scrubbed — it only plays/reverses via the 4 onEnter/onLeave/onEnterBack/onLeaveBack verbs.",
  },
} as const;

// Spec: one-trigger-one-job — each of the 3 ScrollTriggers below owns
// exactly one visual behavior (progress bar / pin+rotate / toggle fade),
// matching the theory section on trigger discipline.
function ScrollTriggerPlayground() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const { values } = useDemoContext();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const pinPanelRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const toggleBoxRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef({ smoothing: 0.3, markers: false, snap: false });

  useEffect(() => {
    paramsRef.current = {
      smoothing: numberOf(values, "smoothing", 0.3),
      markers: booleanOf(values, "markers", false),
      snap: booleanOf(values, "snap", false),
    };
  }, [values]);

  // Rebuild all 3 ScrollTriggers whenever a control changes. gsap.context's
  // revert() (run by useGsapContext on cleanup) kills every ScrollTrigger
  // created inside setup(), so each control flip is a clean rebuild instead
  // of stale scrub/markers/snap config leaking onto old trigger instances.
  useGsapContext(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    const progressBar = progressBarRef.current;
    const pinPanel = pinPanelRef.current;
    const shape = shapeRef.current;
    const toggleBox = toggleBoxRef.current;
    if (!scroller || !content || !progressBar || !pinPanel || !shape || !toggleBox) {
      return;
    }

    const { smoothing, markers, snap } = paramsRef.current;
    const scrub = smoothing > 0 ? smoothing : true;

    // Trigger 1: scrub-bound progress bar. The trigger is the tall CONTENT
    // wrapper (not the scroller viewport itself) so "top top" -> "bottom
    // bottom" spans exactly 0%-100% of the scrollable range.
    gsap.fromTo(
      progressBar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          scroller,
          trigger: content,
          start: "top top",
          end: "bottom bottom",
          scrub,
          markers,
        },
      },
    );

    // Trigger 2: pinned panel, scrubbed rotation over a fixed 320px range.
    gsap.to(shape, {
      rotate: 360,
      ease: "none",
      scrollTrigger: {
        scroller,
        trigger: pinPanel,
        start: "top top",
        end: "+=320",
        scrub,
        pin: true,
        pinSpacing: true,
        snap: snap ? { snapTo: 0.25, duration: 0.3 } : undefined,
        markers,
      },
    });

    // Trigger 3: toggleActions fade — NOT scrubbed, driven by the 4 verbs.
    gsap.set(toggleBox, { autoAlpha: 0, y: 24 });
    gsap.to(toggleBox, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      paused: true,
      scrollTrigger: {
        scroller,
        trigger: toggleBox,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
        markers,
      },
    });

    // Layout may still be settling (fonts, card width) right after mount.
    ScrollTrigger.refresh();
  }, [values]);

  return (
    <div className="relative flex size-full flex-col">
      <div className="bg-background/90 text-muted-foreground absolute inset-x-0 top-0 z-20 px-3 py-1 text-center text-xs">
        {L.scrollHint}
      </div>
      <div
        ref={scrollerRef}
        className="relative size-full overflow-y-auto"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="sticky top-0 z-10 h-1.5 w-full bg-black/10">
          <div
            ref={progressBarRef}
            className="bg-primary h-full w-full origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div ref={contentRef}>
          <div className="flex h-[420px] flex-col items-center justify-center gap-1 px-8 text-center">
            <p className="text-sm font-medium">{L.s1Title}</p>
            <p className="text-muted-foreground text-sm">{L.s1Body}</p>
          </div>

          <div
            ref={pinPanelRef}
            className="flex h-[220px] items-center justify-center gap-4 border-y bg-muted/40 px-8"
          >
            <div ref={shapeRef} className="bg-primary size-10 shrink-0 rounded-md" />
            <div className="max-w-xs text-sm">
              <p className="font-medium">{L.pinTitle}</p>
              <p className="text-muted-foreground">{L.pinBody}</p>
            </div>
          </div>

          <div className="flex h-[520px] items-center justify-center px-8">
            <div
              ref={toggleBoxRef}
              className="bg-background max-w-xs rounded-lg border p-4 text-center text-sm shadow-sm"
            >
              <p className="font-medium">{L.s3Title}</p>
              <p className="text-muted-foreground">{L.s3Body}</p>
            </div>
          </div>

          <div className="h-[240px]" />
        </div>
      </div>
    </div>
  );
}

export default function ScrollTriggerFundamentalsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={4 / 3}
      controls={[
        {
          kind: "number",
          key: "smoothing",
          label: L.smoothing,
          min: 0,
          max: 1.2,
          step: 0.1,
          defaultValue: 0.3,
        },
        { kind: "boolean", key: "markers", label: L.markers, defaultValue: false },
        { kind: "boolean", key: "snap", label: L.snap, defaultValue: false },
      ]}
    >
      <ScrollTriggerPlayground />
    </Demo>
  );
}
