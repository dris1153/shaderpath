import { useLayoutEffect, useRef, useState, type SVGProps } from "react";
import { flushSync } from "react-dom";
import { cancelRender, continueRender, delayRender } from "remotion";
import { FONTS_READY } from "./fonts";
import { usePalette } from "./palette";
import { parseVec, vecPlain } from "./vec-marker";

// `ink` is how far the letters rise above the baseline.
type Arrow = { x1: number; x2: number; ink: number };

export type RunProps = SVGProps<SVGTextElement> & { x: number; y: number; fontSize: number };

// The fonts have no combining arrow (U+20D7), so a marked letter is measured in the live text and the arrow is
// drawn above its real ink. Each render waits for the measurement, so no frame shows a bare letter.
export function MarkedText({ text, ...props }: RunProps & { text: string }) {
  const pal = usePalette();
  const ref = useRef<SVGTextElement>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const plain = vecPlain(text);

  useLayoutEffect(() => {
    const handle = delayRender(`vector arrows for "${text}"`);
    let live = true;
    FONTS_READY.then(() => {
      const el = ref.current;
      if (!live || !el) return;
      const found: Arrow[] = [];
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `${props.fontWeight ?? 400} ${props.fontSize}px ${props.fontFamily}`;
      let at = 0;
      for (const run of parseVec(text)) {
        if (run.arrow) {
          const first = el.getExtentOfChar(at);
          const last = el.getExtentOfChar(at + run.text.length - 1);
          found.push({ x1: first.x, x2: last.x + last.width, ink: ctx.measureText(run.text).actualBoundingBoxAscent });
        }
        at += run.text.length;
      }
      flushSync(() => setArrows(found));
    })
      .catch(cancelRender)
      .finally(() => continueRender(handle));
    return () => {
      live = false;
    };
  }, [text, props.x, props.y, props.fontSize, props.fontFamily, props.fontWeight, props.textAnchor]);

  const { fontSize: size, y, fill, stroke } = props;
  const sw = Math.max(2.5, size * 0.07);
  const head = size * 0.13;
  // Arrows go under the text so their halo never covers a letter; the head's lower tip clears the ink.
  return (
    <g>
      {arrows.map((a, i) => {
        const ay = y - a.ink - head - sw / 2 - size * 0.05;
        const x1 = a.x1 + size * 0.04;
        const x2 = a.x2 - size * 0.02;
        const d = `M ${x1} ${ay} L ${x2} ${ay} M ${x2 - head} ${ay - head} L ${x2} ${ay} L ${x2 - head} ${ay + head}`;
        return (
          <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {stroke ? <path d={d} stroke={stroke} strokeWidth={sw + size / 6} /> : null}
            <path d={d} stroke={fill ?? pal.text} strokeWidth={sw} />
          </g>
        );
      })}
      <text ref={ref} {...props}>
        {plain}
      </text>
    </g>
  );
}
