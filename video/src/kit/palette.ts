import { createContext, useContext } from "react";

// Colour roles, not raw colours: scenes ask for "hero" or "outline" so a
// palette swap never touches scene code.
export type Palette = {
  name: string;
  bg: string;
  bgDots: string;
  panel: string;
  outline: string;
  text: string;
  textMuted: string;
  hero: string; // the one thing to look at
  accent: string; // a second, supporting emphasis
  ok: string;
  warn: string;
  sky: string;
  inko: string;
  inkoShade: string;
  inkoLight: string;
  cheek: string;
  slime: string; // the enemy only
  slimeShade: string;
};

export const PAPER: Palette = {
  name: "paper",
  bg: "#FBF5E9",
  bgDots: "#EFE4CD",
  panel: "#FFFFFF",
  outline: "#26213A",
  text: "#26213A",
  textMuted: "#6B6480",
  hero: "#FF6B57",
  accent: "#FFC23D",
  ok: "#3CCFB4",
  warn: "#FF6B57",
  sky: "#4DA3FF",
  inko: "#9C7BFF",
  inkoShade: "#7A5BE0",
  inkoLight: "#C7B6FF",
  cheek: "#FF93B5",
  slime: "#9BE15D",
  slimeShade: "#6DBA3A",
};

export const NIGHT: Palette = {
  name: "night",
  bg: "#1C1F3A",
  bgDots: "#272B50",
  panel: "#2A2F57",
  outline: "#0E0F22",
  text: "#F7F2E8",
  textMuted: "#A9A6C4",
  hero: "#FF7A66",
  accent: "#FFCB52",
  ok: "#4FE0C3",
  warn: "#FF7A66",
  sky: "#63B0FF",
  inko: "#A688FF",
  inkoShade: "#7C5DE6",
  inkoLight: "#CDBEFF",
  cheek: "#FF9CBC",
  slime: "#A6E86A",
  slimeShade: "#76C442",
};

export const ThemeContext = createContext<Palette>(PAPER);

export function usePalette(): Palette {
  return useContext(ThemeContext);
}
