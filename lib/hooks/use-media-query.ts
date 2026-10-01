"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reactive matchMedia. False during SSR and hydration, then the real answer,
 * so a layout that depends on it renders the desktop shape first.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
