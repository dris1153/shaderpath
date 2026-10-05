import { useLayoutEffect, useRef, useState, type ReactNode, type SVGProps } from "react";
import { flushSync } from "react-dom";
import { cancelRender, continueRender, delayRender } from "remotion";
import { FONTS_READY } from "./fonts";
import { usePalette } from "./palette";
import { parseVec, vecPlain } from "./vec-marker";

// `ink` is how far the marked letters rise above the baseline. A radical also needs the box of its √ character.
type Mark =
  | { kind: "arrow"; x1: number; x2: number; ink: number }
  | { kind: "root"; x0: number; x1: number; r1: number; ink: number };

export type RunProps = SVGProps<SVGTextElement> & { x: number; y: number; fontSize: number };

// The fonts have no combining arrow (U+20D7) and no radical bar, so marked letters are measured in the live text
// and the mark is drawn over their real ink. Each render waits for the measurement, so no frame shows a bare letter.
export function MarkedText({ text, ...props }: RunProps & { text: string }) {
  const pal = usePalette();
  const ref = useRef<SVGTextElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const runs = parseVec(text);

  useLayoutEffect(() => {
    const handle = delayRender(`vector marks for "${text}"`);
    let live = true;
    FONTS_READY.then(() => {
      const el = ref.current;
      if (!live || !el) return;
      const found: Mark[] = [];
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `${props.fontWeight ?? 400} ${props.fontSize}px ${props.fontFamily}`;
      let at = 0;
      for (const run of parseVec(text)) {
        if (run.kind !== "plain") {
          const first = el.getExtentOfChar(at);
          const last = el.getExtentOfChar(at + run.text.length - 1);
          const ink = ctx.measureText(run.text).actualBoundingBoxAscent;
          if (run.kind === "arrow") found.push({ kind: "arrow", x1: first.x, x2: last.x + last.width, ink });
          else {
            const sign = el.getExtentOfChar(at - 1);
            found.push({ kind: "root", x0: sign.x, x1: sign.x + sign.width, r1: last.x + last.width, ink });
          }
        }
        at += run.text.length;
      }
      flushSync(() => setMarks(found));
    })
      .catch(cancelRender)
      .finally(() => continueRender(handle));
    return () => {
      live = false;
    };
  }, [text, props.x, props.y, props.fontSize, props.fontFamily, props.fontWeight, props.textAnchor]);

  // The √ in front of a radicand keeps its place in the line but is drawn by `radicalPath`. Only those characters
  // split the text, so the rest stays one string and lays out exactly as without a marker.
  const plain = vecPlain(text);
  const signs: number[] = [];
  let at = 0;
  runs.forEach((run, i) => {
    at += run.text.length;
    if (run.kind === "plain" && runs[i + 1]?.kind === "root") signs.push(at - 1);
  });
  const children: ReactNode[] = [];
  let from = 0;
  for (const sign of signs) {
    children.push(plain.slice(from, sign), <tspan key={sign} fill="none" stroke="none">√</tspan>);
    from = sign + 1;
  }
  children.push(plain.slice(from));

  const { fontSize: size, y, fill, stroke } = props;
  const sw = Math.max(2.5, size * 0.07);
  // Halos go under the text so they never cover a letter. A radical's stroke goes over it: the text's own halo
  // would cut the radical where it meets the first letter.
  return (
    <g>
      {marks.map((m, i) => {
        const d = m.kind === "arrow" ? arrowPath(m, y, size, sw) : radicalPath(m, y, size, sw);
        return (
          <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {stroke ? <path d={d} stroke={stroke} strokeWidth={sw + size / 6} /> : null}
            {m.kind === "arrow" ? <path d={d} stroke={fill ?? pal.text} strokeWidth={sw} /> : null}
          </g>
        );
      })}
      <text ref={ref} {...props}>
        {children}
      </text>
      {marks.map((m, i) =>
        m.kind === "root" ? (
          <path key={i} d={radicalPath(m, y, size, sw)} fill="none" stroke={fill ?? pal.text} strokeWidth={sw}
            strokeLinecap="round" strokeLinejoin="round" />
        ) : null,
      )}
    </g>
  );
}

// The head's lower tip clears the ink.
function arrowPath(a: Extract<Mark, { kind: "arrow" }>, y: number, size: number, sw: number): string {
  const head = size * 0.13;
  const ay = y - a.ink - head - sw / 2 - size * 0.05;
  const x1 = a.x1 + size * 0.04;
  const x2 = a.x2 - size * 0.02;
  return `M ${x1} ${ay} L ${x2} ${ay} M ${x2 - head} ${ay - head} L ${x2} ${ay} L ${x2 - head} ${ay + head}`;
}

// Hook, descending stroke to a vertex just below the baseline, then up to the bar that spans the radicand.
function radicalPath(r: Extract<Mark, { kind: "root" }>, y: number, size: number, sw: number): string {
  const bar = y - r.ink - size * 0.1 - sw / 2;
  const vertex = y + size * 0.1;
  const h = vertex - bar;
  const w = r.x1 - r.x0;
  const hook = `${r.x0 + w * 0.05} ${bar + h * 0.55} L ${r.x0 + w * 0.28} ${bar + h * 0.45}`;
  return `M ${hook} L ${r.x0 + w * 0.55} ${vertex} L ${r.x1} ${bar} L ${r.r1 + size * 0.03} ${bar}`;
}
