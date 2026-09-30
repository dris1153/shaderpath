import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Bundled OFL variable fonts (public/fonts, licences alongside), so there is no
// network at render time. Each stack ends in bundled faces only: symbols a face
// lacks (→, θ, ≤ …) fall back to JetBrains Mono, never to a system font.
// scripts/cmap.test.ts checks the coverage.
export const FONT = {
  display: "'Baloo 2', Nunito, 'JetBrains Mono'",
  body: "Nunito, 'JetBrains Mono'",
  mono: "'JetBrains Mono'",
} as const;

const FILES: [family: string, file: string, weight: string][] = [
  ["Baloo 2", "fonts/Baloo2.ttf", "400 800"],
  ["Nunito", "fonts/Nunito.ttf", "200 1000"],
  ["JetBrains Mono", "fonts/JetBrainsMono.ttf", "100 800"],
];

for (const [family, file, weight] of FILES) {
  loadFont({ family, url: staticFile(file), weight });
}
