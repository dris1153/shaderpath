export type VecRun = { text: string; arrow: boolean };

export function hasVecMarker(text: string): boolean {
  return text.includes("{");
}

// "{a} · {b}" → [a (arrow)] [" · "] [b (arrow)]. Braces mark vector letters in math; code stays plain.
export function parseVec(text: string): VecRun[] {
  const runs: VecRun[] = [];
  let plain = "";
  let i = 0;
  const fail = (why: string): never => {
    throw new Error(`vector marker in "${text}": ${why}`);
  };
  while (i < text.length) {
    const ch = text[i]!;
    if (ch === "}") fail("unmatched }");
    if (ch !== "{") {
      plain += ch;
      i++;
      continue;
    }
    const end = text.indexOf("}", i);
    if (end === -1) fail("unclosed {");
    const inner = text.slice(i + 1, end);
    if (inner === "") fail("empty {}");
    if (inner.includes("{")) fail("nested {");
    if (plain) runs.push({ text: plain, arrow: false });
    plain = "";
    runs.push({ text: inner, arrow: true });
    i = end + 1;
  }
  if (plain) runs.push({ text: plain, arrow: false });
  return runs;
}

// What the viewer reads: the string without its markers. Use it wherever a width is guessed from a length.
export function vecPlain(text: string): string {
  return parseVec(text).map((r) => r.text).join("");
}
