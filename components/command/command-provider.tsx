"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Palette bundle (index JSON included) loads only on first open
const CommandPalette = dynamic(
  () => import("./command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

export function CommandProvider() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

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

  if (!everOpened) return null;
  return <CommandPalette open={open} onOpenChange={setOpen} />;
}
