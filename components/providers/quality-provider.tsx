"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { detect, DEFAULT_TIER, TIER_CONFIG, type QualityTier } from "@/lib/quality";

interface QualityContextValue {
  tier: QualityTier;
  dpr: [number, number];
  effectBudget: number;
  setTier: (tier: QualityTier) => void;
}

const QualityContext = createContext<QualityContextValue | null>(null);

// Persisted in localStorage, not the database: the tier describes the GPU doing
// the rendering, so it belongs to the device rather than the account — the same
// reader on a phone and a desktop wants two different answers. Keeping it out
// of the DB also means the root layout reads nothing, which is what lets the
// 162 lesson pages stay static.
const STORAGE_KEY = "shaderpath:quality-tier";
const VALID: readonly QualityTier[] = ["low", "medium", "high"];

function readStored(): QualityTier | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && (VALID as readonly string[]).includes(value)
      ? (value as QualityTier)
      : null;
  } catch {
    // Private mode, blocked site data — fall back to detection.
    return null;
  }
}

function writeStored(tier: QualityTier) {
  try {
    localStorage.setItem(STORAGE_KEY, tier);
  } catch {
    // Non-fatal: the tier still applies for this session.
  }
}

// Nothing subscribes: the stored tier only changes through setTier below, which
// updates React state in the same call.
const noopSubscribe = () => () => {};

// Detection runs once, only when nothing was persisted yet — a manual
// override (or a prior detection) always wins over re-running the heuristic.
export function QualityProvider({ children }: { children: ReactNode }) {
  // localStorage is an external store, so read it as one: the server snapshot
  // is null, which keeps the first client render identical to the HTML.
  const stored = useSyncExternalStore(noopSubscribe, readStored, () => null);
  const [detected, setDetected] = useState<QualityTier | null>(null);
  const [override, setOverride] = useState<QualityTier | null>(null);

  const tier = override ?? stored ?? detected ?? DEFAULT_TIER;

  useEffect(() => {
    if (stored || detected) return;
    let cancelled = false;
    // setState inside .then, never synchronously in the effect body.
    detect().then((result) => {
      if (cancelled) return;
      setDetected(result);
      writeStored(result);
    });
    return () => {
      cancelled = true;
    };
  }, [stored, detected]);

  function setTier(next: QualityTier) {
    setOverride(next);
    writeStored(next);
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
