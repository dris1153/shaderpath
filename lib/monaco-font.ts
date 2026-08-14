// Monaco does not inherit --font-mono from the page: it writes font-family
// into its own DOM and caches character metrics from it. Both editors share
// this family, and both must remeasure once the webfont actually swaps in
// (display: swap) or the cursor sits off by a fraction of a character.
export const MONACO_FONT_FAMILY =
  "var(--font-google-sans-code), ui-monospace, monospace";

type MonacoRemeasure = { editor: { remeasureFonts: () => void } };

export function remeasureOnFontReady(monaco: MonacoRemeasure) {
  void document.fonts.ready.then(() => monaco.editor.remeasureFonts());
}
