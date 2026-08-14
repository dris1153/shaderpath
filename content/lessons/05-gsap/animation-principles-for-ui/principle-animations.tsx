"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import type { PanelLabels } from "./principle-labels";

export interface SceneProps {
  playToken: number;
  reducedMotion: boolean;
  L: PanelLabels;
}

// prefers-reduced-motion doesn't hide the demo -- it shrinks amplitude/duration
// to near-instant, mirroring the "shrink, don't disable" rule from theory.
function durationScale(reducedMotion: boolean) {
  return (base: number) => (reducedMotion ? base * 0.05 : base);
}

function MiniPanel({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "bad" | "good";
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span
        className={
          tone === "bad"
            ? "text-destructive text-[10px] font-semibold tracking-wide uppercase"
            : "text-primary text-[10px] font-semibold tracking-wide uppercase"
        }
      >
        {label}
      </span>
      <div className="bg-muted/30 relative h-28 w-full overflow-hidden rounded-lg border">
        {children}
      </div>
    </div>
  );
}

// --- Anticipation: straight launch vs wind-up-then-launch -----------------
export function AnticipationScene({ playToken, reducedMotion, L }: SceneProps) {
  const badRef = useRef<HTMLDivElement>(null);
  const goodRef = useRef<HTMLDivElement>(null);

  useGsapContext(() => {
    const d = durationScale(reducedMotion);
    if (!badRef.current || !goodRef.current) return;
    gsap.set([badRef.current, goodRef.current], { y: 0 });
    gsap.to(badRef.current, { y: -56, duration: d(0.5), ease: "power2.out" });
    gsap
      .timeline()
      .to(goodRef.current, { y: 10, duration: d(0.12), ease: "power1.in" })
      .to(goodRef.current, { y: -56, duration: d(0.45), ease: "back.out(2.5)" });
  }, [playToken, reducedMotion]);

  return (
    <div className="flex size-full gap-3 p-3">
      <MiniPanel label={L.bad} tone="bad">
        <div ref={badRef} className="bg-destructive/70 absolute bottom-2 left-1/2 size-6 -translate-x-1/2 rounded" />
      </MiniPanel>
      <MiniPanel label={L.good} tone="good">
        <div ref={goodRef} className="bg-primary absolute bottom-2 left-1/2 size-6 -translate-x-1/2 rounded" />
      </MiniPanel>
    </div>
  );
}

// --- Overlap: identical stops vs staggered (overlapping) stops -----------
export function OverlapScene({ playToken, reducedMotion, L }: SceneProps) {
  const badRefs = useRef<HTMLDivElement[]>([]);
  const goodRefs = useRef<HTMLDivElement[]>([]);

  useGsapContext(() => {
    const d = durationScale(reducedMotion);
    const bad = badRefs.current.filter(Boolean);
    const good = goodRefs.current.filter(Boolean);
    gsap.set([...bad, ...good], { x: 0 });
    // bad: every bar starts AND stops at the same instant -- no overlap
    gsap.to(bad, { x: 64, duration: d(0.5), ease: "power2.out" });
    // good: stagger fans delay across bars -- the definition of overlap
    gsap.to(good, { x: 64, duration: d(0.5), ease: "power2.out", stagger: d(0.09) });
  }, [playToken, reducedMotion]);

  const bars = [0, 1, 2, 3];

  return (
    <div className="flex size-full gap-3 p-3">
      <MiniPanel label={L.bad} tone="bad">
        <div className="absolute inset-3 flex flex-col justify-between">
          {bars.map((i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) badRefs.current[i] = el;
              }}
              className="bg-destructive/70 h-2 w-6 rounded-full"
            />
          ))}
        </div>
      </MiniPanel>
      <MiniPanel label={L.good} tone="good">
        <div className="absolute inset-3 flex flex-col justify-between">
          {bars.map((i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) goodRefs.current[i] = el;
              }}
              className="bg-primary h-2 w-6 rounded-full"
            />
          ))}
        </div>
      </MiniPanel>
    </div>
  );
}

// --- Secondary motion: a trailing detail moving in lockstep vs late ------
export function SecondaryMotionScene({ playToken, reducedMotion, L }: SceneProps) {
  const badMain = useRef<HTMLDivElement>(null);
  const badDetail = useRef<HTMLDivElement>(null);
  const goodMain = useRef<HTMLDivElement>(null);
  const goodDetail = useRef<HTMLDivElement>(null);

  useGsapContext(() => {
    const d = durationScale(reducedMotion);
    gsap.set([badMain.current, badDetail.current, goodMain.current, goodDetail.current], { x: 0 });
    // bad: the detail moves in perfect lockstep with the main element
    gsap.to([badMain.current, badDetail.current], { x: 70, duration: d(0.5), ease: "power2.out" });
    // good: the main element leads, the detail follows late with a touch of overshoot
    gsap.to(goodMain.current, { x: 70, duration: d(0.5), ease: "power2.out" });
    gsap.to(goodDetail.current, { x: 70, duration: d(0.45), ease: "back.out(3)", delay: d(0.1) });
  }, [playToken, reducedMotion]);

  return (
    <div className="flex size-full gap-3 p-3">
      <MiniPanel label={L.bad} tone="bad">
        <div ref={badMain} className="bg-destructive/70 absolute top-3 left-3 size-8 rounded" />
        <div ref={badDetail} className="bg-destructive absolute bottom-3 left-3 size-3 rounded-full" />
      </MiniPanel>
      <MiniPanel label={L.good} tone="good">
        <div ref={goodMain} className="bg-primary absolute top-3 left-3 size-8 rounded" />
        <div ref={goodDetail} className="bg-primary/60 absolute bottom-3 left-3 size-3 rounded-full" />
      </MiniPanel>
    </div>
  );
}

// --- Squash & stretch: rigid landing vs a subtle squash-on-impact --------
export function SquashStretchScene({ playToken, reducedMotion, L }: SceneProps) {
  const badRef = useRef<HTMLDivElement>(null);
  const goodRef = useRef<HTMLDivElement>(null);

  useGsapContext(() => {
    const d = durationScale(reducedMotion);
    gsap.set([badRef.current, goodRef.current], { y: -40, scaleX: 1, scaleY: 1 });
    gsap.to(badRef.current, { y: 0, duration: d(0.4), ease: "power2.in" });

    gsap
      .timeline()
      .to(goodRef.current, { y: 0, duration: d(0.4), ease: "power2.in" })
      .to(goodRef.current, { scaleY: 0.6, scaleX: 1.25, duration: d(0.08), ease: "power1.out" })
      .to(goodRef.current, { scaleY: 1, scaleX: 1, duration: d(0.25), ease: "elastic.out(1, 0.5)" });
  }, [playToken, reducedMotion]);

  return (
    <div className="flex size-full gap-3 p-3">
      <MiniPanel label={L.bad} tone="bad">
        <div
          ref={badRef}
          style={{ transformOrigin: "50% 100%" }}
          className="bg-destructive/70 absolute bottom-2 left-1/2 size-7 -translate-x-1/2 rounded"
        />
      </MiniPanel>
      <MiniPanel label={L.good} tone="good">
        <div
          ref={goodRef}
          style={{ transformOrigin: "50% 100%" }}
          className="bg-primary absolute bottom-2 left-1/2 size-7 -translate-x-1/2 rounded"
        />
      </MiniPanel>
    </div>
  );
}

// --- Slow-in/slow-out: linear easing vs eased motion ----------------------
export function SlowInOutScene({ playToken, reducedMotion, L }: SceneProps) {
  const badRef = useRef<HTMLDivElement>(null);
  const goodRef = useRef<HTMLDivElement>(null);

  useGsapContext(() => {
    const d = durationScale(reducedMotion);
    gsap.set([badRef.current, goodRef.current], { x: 0 });
    gsap.to(badRef.current, { x: 96, duration: d(0.9), ease: "none" });
    gsap.to(goodRef.current, { x: 96, duration: d(0.9), ease: "power2.inOut" });
  }, [playToken, reducedMotion]);

  return (
    <div className="flex size-full flex-col gap-3 p-3">
      <MiniPanel label={L.bad} tone="bad">
        <div ref={badRef} className="bg-destructive/70 absolute top-1/2 left-2 size-5 -translate-y-1/2 rounded-full" />
      </MiniPanel>
      <MiniPanel label={L.good} tone="good">
        <div ref={goodRef} className="bg-primary absolute top-1/2 left-2 size-5 -translate-y-1/2 rounded-full" />
      </MiniPanel>
    </div>
  );
}
