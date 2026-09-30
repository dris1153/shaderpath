import { createContext, useContext, type ReactNode } from "react";
import { FONT } from "./fonts";
import { usePalette } from "./palette";

// On-screen words come from strings.<locale>.json, never from scene code, so a
// translation swaps this map and nothing else.
export const StringsContext = createContext<Record<string, string>>({});

export function useString(key: string): string {
  const strings = useContext(StringsContext);
  const value = strings[key];
  if (value === undefined) throw new Error(`missing string "${key}"`);
  return value;
}

type TextProps = {
  x: number;
  y: number;
  size?: number;
  anchor?: "start" | "middle" | "end";
  color?: string;
  weight?: number;
  // Halo colour: whatever sits behind the text (the page by default).
  halo?: string;
  children: ReactNode;
};

// Display type: Fredoka, with a paper-coloured halo so it reads over lines.
export function Title({ x, y, size = 64, anchor = "middle", color, weight = 650, halo, children }: TextProps) {
  const pal = usePalette();
  return (
    <text
      x={x}
      y={y}
      fontFamily={FONT.display}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fill={color ?? pal.text}
      stroke={halo ?? pal.bg}
      strokeWidth={size / 7}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

export function Label({ x, y, size = 30, anchor = "middle", color, weight = 800, halo, children }: TextProps) {
  const pal = usePalette();
  return (
    <text
      x={x}
      y={y}
      fontFamily={FONT.body}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fill={color ?? pal.text}
      stroke={halo ?? pal.bg}
      strokeWidth={size / 6}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

export function Code({ x, y, size = 28, anchor = "start", color, weight = 600, children }: TextProps) {
  const pal = usePalette();
  return (
    <text
      x={x}
      y={y}
      fontFamily={FONT.mono}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fill={color ?? pal.text}
    >
      {children}
    </text>
  );
}
