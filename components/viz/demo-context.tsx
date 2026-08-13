"use client";

import { createContext, useContext, type RefObject } from "react";
import type { ControlValues } from "./control-schema";

interface DemoContextValue {
  values: ControlValues;
  containerRef: RefObject<HTMLDivElement | null>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export const DemoContextProvider = DemoContext.Provider;

export function useDemoContext(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemoContext must be used inside <Demo>");
  }
  return ctx;
}
