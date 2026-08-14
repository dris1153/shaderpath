"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import type { CardLabels } from "./demo-sources";

// The same micro-interaction (hover-lift + press feedback + toggle reveal)
// implemented three ways. All three render the identical markup/labels --
// only the animation mechanism differs.

// --- 1. CSS-class-driven: zero JS animation code at all ------------------
export function CssCard({ L }: { L: CardLabels }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-56 cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95 active:duration-75">
      <h4 className="text-sm font-semibold">{L.title}</h4>
      <p className="text-muted-foreground mt-1 text-xs">{L.body}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-primary mt-2 text-xs font-medium hover:underline"
      >
        {open ? L.hide : L.more}
      </button>
      {/* CSS-only auto-height reveal: grid-template-rows 0fr -> 1fr, no JS measurement */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground mt-2 text-xs">{L.detail}</p>
        </div>
      </div>
    </div>
  );
}

// --- 2. Hand-rolled WAAPI/Framer-style spring approximation ---------------
interface SpringState {
  x: number;
  v: number;
}

function stepSpring(
  s: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const accel = (target - s.x) * stiffness - s.v * damping;
  s.v += accel * dt;
  s.x += s.v * dt;
}

export function WaapiCard({ L }: { L: CardLabels }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const targets = useRef({ hovered: false, pressed: false });
  const [open, setOpen] = useState(false);

  // One rAF loop integrates two independent spring physics states and writes
  // the combined transform directly to the DOM -- no React re-render per
  // frame, matching how Motion drives whileHover/whileTap under the hood.
  useEffect(() => {
    const lift: SpringState = { x: 0, v: 0 };
    const scale: SpringState = { x: 1, v: 0 };
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = targets.current;
      stepSpring(lift, t.hovered ? -6 : 0, 210, 20, dt);
      stepSpring(scale, t.pressed ? 0.95 : 1, 300, 24, dt);
      const el = cardRef.current;
      if (el) {
        el.style.transform = `translateY(${lift.x.toFixed(2)}px) scale(${scale.x.toFixed(3)})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // WAAPI has no "auto" keyword -- measure scrollHeight, animate a real
  // pixel value, then commit + cancel so the base style stays authoritative.
  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const target = open ? el.scrollHeight : 0;
    const anim = el.animate(
      [{ height: `${el.offsetHeight}px` }, { height: `${target}px` }],
      { duration: 260, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "forwards" },
    );
    anim.onfinish = () => {
      el.style.height = `${target}px`;
      anim.cancel();
    };
    return () => anim.cancel();
  }, [open]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => {
        targets.current.hovered = true;
      }}
      onMouseLeave={() => {
        targets.current.hovered = false;
        targets.current.pressed = false;
      }}
      onMouseDown={() => {
        targets.current.pressed = true;
      }}
      onMouseUp={() => {
        targets.current.pressed = false;
      }}
      className="w-56 cursor-pointer rounded-xl border bg-card p-4 shadow-sm"
    >
      <h4 className="text-sm font-semibold">{L.title}</h4>
      <p className="text-muted-foreground mt-1 text-xs">{L.body}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-primary mt-2 text-xs font-medium hover:underline"
      >
        {open ? L.hide : L.more}
      </button>
      <div ref={detailsRef} className="overflow-hidden" style={{ height: 0 }}>
        <p className="text-muted-foreground mt-2 text-xs">{L.detail}</p>
      </div>
    </div>
  );
}

// --- 3. GSAP: gsap.context() scoping the imperative timeline API ---------
interface CardCtx extends gsap.Context {
  hoverIn?: () => void;
  hoverOut?: () => void;
  press?: () => void;
  release?: () => void;
  setOpen?: (open: boolean) => void;
}

export function GsapCard({ L }: { L: CardLabels }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CardCtx | null>(null);
  const [open, setOpen] = useState(false);

  useGsapContext((ctx) => {
    const cardCtx = ctx as CardCtx;
    cardCtx.add("hoverIn", () => {
      gsap.to(cardRef.current, { y: -6, duration: 0.25, ease: "back.out(2)", overwrite: "auto" });
    });
    cardCtx.add("hoverOut", () => {
      gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
    cardCtx.add("press", () => {
      gsap.to(cardRef.current, { scale: 0.95, duration: 0.12, ease: "power2.out", overwrite: "auto" });
    });
    cardCtx.add("release", () => {
      gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
    });
    cardCtx.add("setOpen", (isOpen: boolean) => {
      gsap.to(detailsRef.current, { height: isOpen ? "auto" : 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
    ctxRef.current = cardCtx;
  }, []);

  useEffect(() => {
    ctxRef.current?.setOpen?.(open);
  }, [open]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => ctxRef.current?.hoverIn?.()}
      onMouseLeave={() => {
        ctxRef.current?.hoverOut?.();
        ctxRef.current?.release?.();
      }}
      onMouseDown={() => ctxRef.current?.press?.()}
      onMouseUp={() => ctxRef.current?.release?.()}
      className="w-56 cursor-pointer rounded-xl border bg-card p-4 shadow-sm"
    >
      <h4 className="text-sm font-semibold">{L.title}</h4>
      <p className="text-muted-foreground mt-1 text-xs">{L.body}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-primary mt-2 text-xs font-medium hover:underline"
      >
        {open ? L.hide : L.more}
      </button>
      <div ref={detailsRef} className="overflow-hidden" style={{ height: 0 }}>
        <p className="text-muted-foreground mt-2 text-xs">{L.detail}</p>
      </div>
    </div>
  );
}
