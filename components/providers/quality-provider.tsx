"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { detect, DEFAULT_TIER, TIER_CONFIG, type QualityTier } from "@/lib/quality";
import { setQualityTier } from "@/lib/settings";

interface QualityContextValue {
  tier: QualityTier;
  dpr: [number, number];
  effectBudget: number;
  setTier: (tier: QualityTier) => void;
}

const QualityContext = createContext<QualityContextValue | null>(null);

// Detection runs once, only when nothing was persisted yet — a manual
// override (or a prior detection) always wins over re-running the heuristic.
export function QualityProvider({
  initialTier,
  children,
}: {
  initialTier: QualityTier | null;
  children: ReactNode;
}) {
  const [tier, setTierState] = useState<QualityTier>(initialTier ?? DEFAULT_TIER);
  const alreadyResolved = useRef(initialTier !== null);

  useEffect(() => {
    if (alreadyResolved.current) return;
    alreadyResolved.current = true;
    let cancelled = false;
    detect().then((detected) => {
      if (cancelled) return;
      setTierState(detected);
      setQualityTier(detected).catch(() => {
        // Persist failure is non-fatal — the detected tier still applies this session.
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function setTier(next: QualityTier) {
    setTierState(next);
    setQualityTier(next).catch(() => {
      // Manual override still applies this session even if persistence fails.
    });
  }

  const config = TIER_CONFIG[tier];

  return (
    <QualityContext.Provider
      value={{ tier, dpr: config.dpr, effectBudget: config.effectBudget, setTier }}
    >
      {children}
    </QualityContext.Provider>
  );
}

export function useQuality(): QualityContextValue {
  const ctx = useContext(QualityContext);
  if (!ctx) throw new Error("useQuality must be used within QualityProvider");
  return ctx;
}
