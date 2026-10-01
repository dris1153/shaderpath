"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Palette bundle (index JSON included) loads only on first open
const CommandPalette = dynamic(
  () => import("./command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

const OpenPaletteContext = createContext<() => void>(() => {});

/** Opens the Ctrl+K palette from anywhere below the provider (search pill, mobile icon). */
export function useCommandPalette() {
  return { open: useContext(OpenPaletteContext) };
}

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const show = useCallback(() => {
    setEverOpened(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setEverOpened(true);
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <OpenPaletteContext value={show}>
      {children}
      {everOpened && <CommandPalette open={open} onOpenChange={setOpen} />}
    </OpenPaletteContext>
  );
}
