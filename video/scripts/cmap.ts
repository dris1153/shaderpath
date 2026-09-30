import fs from "node:fs";

// Minimal TrueType cmap reader (formats 4 and 12): which code points a font
// file actually has a glyph for. Enough to catch fallback-to-system-font bugs.
export function codePoints(file: string): Set<number> {
  const buf = fs.readFileSync(file);
  const numTables = buf.readUInt16BE(4);
  let cmapOffset = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (buf.toString("latin1", rec, rec + 4) === "cmap") cmapOffset = buf.readUInt32BE(rec + 8);
  }
  if (cmapOffset < 0) throw new Error(`${file}: no cmap table`);

  const out = new Set<number>();
  const subtables = buf.readUInt16BE(cmapOffset + 2);
  for (let i = 0; i < subtables; i++) {
    const rec = cmapOffset + 4 + i * 8;
    const platform = buf.readUInt16BE(rec);
    if (platform !== 0 && platform !== 3) continue; // Unicode / Windows only
    const sub = cmapOffset + buf.readUInt32BE(rec + 4);
    const format = buf.readUInt16BE(sub);
    if (format === 4) {
      const segX2 = buf.readUInt16BE(sub + 6);
      const ends = sub + 14;
      const starts = ends + segX2 + 2;
      for (let s = 0; s < segX2 / 2; s++) {
        const end = buf.readUInt16BE(ends + s * 2);
        const start = buf.readUInt16BE(starts + s * 2);
        for (let c = start; c <= end && c !== 0xffff; c++) out.add(c);
      }
    } else if (format === 12) {
      const groups = buf.readUInt32BE(sub + 12);
      for (let g = 0; g < groups; g++) {
        const at = sub + 16 + g * 12;
        const start = buf.readUInt32BE(at);
        const end = buf.readUInt32BE(at + 4);
        for (let c = start; c <= end; c++) out.add(c);
      }
    }
  }
  return out;
}

// The first font in `stack` that covers each character, or the characters
// no font in the stack covers at all.
export function uncovered(text: string, stack: Set<number>[]): string[] {
  const missing = new Set<string>();
  for (const ch of text) {
    if (/\s/.test(ch)) continue;
    const cp = ch.codePointAt(0)!;
    if (!stack.some((font) => font.has(cp))) missing.add(ch);
  }
  return [...missing];
}
