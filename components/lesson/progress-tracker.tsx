"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  closeStudySession,
  openStudySession,
  saveReadingProgress,
} from "@/lib/progress";

// Invisible island: scroll % + visible-time tracking with 5s debounced writes,
// pagehide beacon flush, and scroll restore on revisit (spec §6.1.3).
export function ProgressTracker({
  slug,
  initialScrollPercent,
}: {
  slug: string;
  initialScrollPercent: number;
}) {
  const { mutate: saveMutate } = useMutation({
    mutationFn: saveReadingProgress,
  });

  useEffect(() => {
    const s = {
      percent: 0,
      lastSavedPercent: -1,
      unsentSeconds: 0,
      sessionSeconds: 0,
      visibleSeconds: 0,
      engaged: false,
      userScrolled: false,
      sessionId: null as number | null,
    };

    openStudySession(slug)
      .then((id) => (s.sessionId = id))
      .catch(() => {});

    // Restore after layout settles (2 rAFs); skip if the user already scrolled
    // or position was preserved (e.g. locale switch with scroll:false).
    if (initialScrollPercent > 0.02 && window.scrollY < 50) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (s.userScrolled) return;
          const max =
            document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: initialScrollPercent * Math.max(0, max) });
        }),
      );
    }

    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      s.percent = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      if (s.percent >= 0.05) s.engaged = true;
    };
    const onScroll = () => {
      s.userScrolled = true;
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Time only accumulates while the tab is visible (spec §6.1.3)
    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      s.unsentSeconds += 1;
      s.sessionSeconds += 1;
      s.visibleSeconds += 1;
      if (s.visibleSeconds >= 5) s.engaged = true;
    }, 1000);

    // Debounced persistence: at most one write per 5s, only when dirty
    const flushTimer = setInterval(() => {
      if (!s.engaged) return;
      const percentDelta = Math.abs(s.percent - s.lastSavedPercent);
      if (s.unsentSeconds < 5 && percentDelta < 0.01) return;
      const deltaSeconds = s.unsentSeconds;
      s.unsentSeconds = 0;
      s.lastSavedPercent = s.percent;
      saveMutate({ slug, scrollPercent: s.percent, deltaSeconds });
    }, 5000);

    const beaconPayload = () =>
      new Blob(
        [
          JSON.stringify({
            slug,
            scrollPercent: s.percent,
            deltaSeconds: s.unsentSeconds,
            sessionId: s.sessionId ?? undefined,
            sessionSeconds: s.sessionSeconds,
          }),
        ],
        { type: "application/json" },
      );

    const onPageHide = () => {
      if (!s.engaged) return;
      navigator.sendBeacon("/api/progress/flush", beaconPayload());
      s.unsentSeconds = 0;
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      clearInterval(tick);
      clearInterval(flushTimer);
      if (raf) cancelAnimationFrame(raf);
      if (s.engaged) {
        // Route-change flush (keepalive survives navigation)
        fetch("/api/progress/flush", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            slug,
            scrollPercent: s.percent,
            deltaSeconds: s.unsentSeconds,
            sessionId: s.sessionId ?? undefined,
            sessionSeconds: s.sessionSeconds,
          }),
          keepalive: true,
        }).catch(() => {});
      } else if (s.sessionId) {
        closeStudySession(s.sessionId, s.sessionSeconds).catch(() => {});
      }
    };
    // saveMutate identity is stable in TanStack Query v5
  }, [slug, initialScrollPercent, saveMutate]);

  return null;
}
