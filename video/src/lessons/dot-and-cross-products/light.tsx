import { useId } from "react";
import { interpolate } from "remotion";
import { polar } from "../../kit/angle";
import { progress } from "../../kit/easing";
import { ArrowPath } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// A ball lit by a far light in the picture plane. For that light, N · L across
// the ball is just the distance along L, so max(0, N · L) makes straight bands;
// the half past the terminator (N · L < 0) stays dark.
const C = { x: 420, y: 330 };
const R = 165;
const PHI = 35; // direction toward the light, degrees
const LAMP = polar(C, PHI, 380);
const CAM = { x: 120, y: C.y };
const CARD = { x: 800, y: 140, w: 400, h: 200 };
const METER = { x: CARD.x + 40, y: CARD.y + 150, w: CARD.w - 80, h: 22 };
const HOST = { x: 1130, y: 500 };
const BANDS: [lo: number, hi: number, alpha: number][] = [[0.75, 1, 1], [0.5, 0.75, 0.78], [0.25, 0.5, 0.56], [0, 0.25, 0.34]];
const FACETS = 8;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Ball({ opacity }: { opacity: number }) {
  const pal = usePalette();
  const clip = `ball-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={clip}><circle cx={C.x} cy={C.y} r={R} /></clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <circle cx={C.x} cy={C.y} r={R} fill={pal.textMuted} />
        <g transform={`rotate(${-PHI} ${C.x} ${C.y})`}>
          {BANDS.map(([lo, hi, alpha]) => (
            <rect key={lo} x={C.x + lo * R} y={C.y - R} width={(hi - lo) * R + 1} height={2 * R} fill={pal.accent} opacity={alpha} />
          ))}
        </g>
      </g>
      <circle cx={C.x} cy={C.y} r={R} fill="none" stroke={pal.outline} strokeWidth={5} />
    </g>
  );
}

function Lamp({ at }: { at: { x: number; y: number } }) {
  const pal = usePalette();
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => {
        const a = polar(at, i * 45, 34);
        const b = polar(at, i * 45, 48);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={pal.accent} strokeWidth={5} strokeLinecap="round" />;
      })}
      <circle cx={at.x} cy={at.y} r={24} fill={pal.accent} stroke={pal.outline} strokeWidth={5} />
    </g>
  );
}

function Camera({ at }: { at: { x: number; y: number } }) {
  const pal = usePalette();
  return (
    <g>
      <Box x={at.x - 46} y={at.y - 28} w={70} h={56} r={12} fill={pal.panel} />
      <path d={`M ${at.x + 24} ${at.y - 12} L ${at.x + 46} ${at.y - 24} L ${at.x + 46} ${at.y + 24} L ${at.x + 24} ${at.y + 12} Z`}
        fill={pal.panel} stroke={pal.outline} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={at.x - 11} cy={at.y} r={12} fill={pal.sky} stroke={pal.outline} strokeWidth={4} />
    </g>
  );
}

export function Light() {
  const pal = usePalette();
  const both = useCue("both");
  const sphere = useCue("sphere");
  const nl = useCue("nl");
  const lambert = useCue("lambert");
  const facing = useCue("facing");
  const edge = useCue("edge");
  const away = useCue("away");
  const clampCue = useCue("clamp");
  const cull = useCue("cull");
  const skip = useCue("skip");
  const s = {
    dot: useString("dotSymbol"), cross: useString("crossSymbol"), n: useString("N"), l: useString("L"),
    lambert: useString("lambert"), nl: useString("nDotL"), zero: useString("zero"), one: useString("one"),
    culling: useString("culling"),
  };

  // The point's angle on the rim: 50° off the light, then on it, edge-on, then 150° off
  // (round the bottom to the left side; N's label is held above the subtitle band).
  const theta =
    away >= 0 ? interpolate(away, [0, 24], [PHI - 90, PHI - 210], clamp)
    : edge >= 0 ? interpolate(edge, [0, 20], [PHI, PHI - 90], clamp)
    : interpolate(facing, [0, 20], [PHI - 50, PHI], clamp);
  const value = Math.cos(((theta - PHI) * Math.PI) / 180);
  const shown = Math.abs(value) < 0.005 ? 0 : value;
  const bright = Math.max(0, shown);
  const point = polar(C, theta, R);
  const nTip = polar(point, theta, 100);
  const lTip = polar(point, PHI, 100);
  const pointFade = 1 - progress(cull, 14);
  const toCam = 180; // the camera looks from the left
  const lookAt = skip >= 0 ? C : cull >= 0 ? CAM : lambert >= 0 ? { x: CARD.x + CARD.w / 2, y: CARD.y + 80 } : point;

  return (
    <Stage>
      <FadeOut t={sphere} duration={12}>
        <Pop t={both} x={520} y={150}>
          <Title x={440} y={170} size={70}>{s.dot}</Title>
          <Title x={640} y={170} size={70}>{s.cross}</Title>
        </Pop>
      </FadeOut>

      <Pop t={sphere} x={C.x} y={C.y}>
        <Ball opacity={1 - 0.45 * progress(cull, 14)} />
      </Pop>
      <Pop t={sphere} delay={8} x={LAMP.x} y={LAMP.y}>
        <g opacity={1 - 0.7 * progress(cull, 14)}><Lamp at={LAMP} /></g>
      </Pop>

      {/* Facets of the mesh: at {skip} the ones facing away from the camera drop out. */}
      {cull >= 0 ? (
        <g>
          {Array.from({ length: FACETS }, (_, i) => {
            const a = polar(C, (i * 360) / FACETS, R);
            const b = polar(C, ((i + 1) * 360) / FACETS, R);
            const mid = ((i + 0.5) * 360) / FACETS;
            const front = Math.cos(((mid - toCam) * Math.PI) / 180) > 0;
            const gone = front ? 0 : progress(skip - i * 3, 12);
            const m = polar(C, mid, R * Math.cos(Math.PI / FACETS));
            return (
              <g key={i} opacity={drawn(cull, 14, i * 2) * (1 - 0.8 * gone)}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={front && skip >= 0 ? pal.ok : pal.outline} strokeWidth={7}
                  strokeLinecap="round" strokeDasharray={gone > 0 ? "8 12" : undefined} />
                <ArrowPath a={m} b={polar(m, mid, 46)} stroke={front && skip >= 0 ? pal.ok : pal.textMuted} width={4} />
              </g>
            );
          })}
        </g>
      ) : null}
      <Pop t={cull} delay={6} x={CAM.x} y={CAM.y}>
        <Camera at={CAM} />
      </Pop>

      <g opacity={pointFade}>
        {nl >= 0 ? (
          <>
            <ArrowPath a={point} b={nTip} stroke={pal.hero} width={7} />
            <ArrowPath a={point} b={lTip} stroke={pal.sky} width={7} />
            <circle cx={point.x} cy={point.y} r={9} fill={pal.panel} stroke={pal.outline} strokeWidth={4} />
            {nl > 14 ? (
              <>
                {/* Labels lean to opposite sides, so they stay apart when N and L line up. */}
                <Title x={polar(nTip, theta - 40, 30).x} y={Math.min(polar(nTip, theta - 40, 30).y + 14, 600)} size={40}>{s.n}</Title>
                <Title x={polar(lTip, PHI + 40, 30).x} y={polar(lTip, PHI + 40, 30).y + 14} size={40}>{s.l}</Title>
              </>
            ) : null}
          </>
        ) : null}
      </g>

      <Pop t={lambert} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h / 2}>
        <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={22} fill={pal.panel} />
        <Title x={CARD.x + CARD.w / 2} y={CARD.y + 60} size={44} halo={pal.panel}>{s.lambert}</Title>
        <Code x={CARD.x + 40} y={CARD.y + 112} size={30} color={shown < 0 ? pal.warn : pal.text}>
          {`${s.nl} ${shown < 0 ? `−${(-shown).toFixed(2)}` : shown.toFixed(2)}`}
        </Code>
        {/* The brightness meter: max(0, N · L), so it empties at the terminator and stays empty past it. */}
        <rect x={METER.x} y={METER.y} width={METER.w} height={METER.h} rx={11} fill={pal.bg} stroke={pal.outline} strokeWidth={3} />
        <rect x={METER.x} y={METER.y} width={METER.w * bright} height={METER.h} rx={11} fill={pal.accent} />
        <Label x={METER.x - 18} y={METER.y + 18} size={22} halo={pal.panel}>{s.zero}</Label>
        <Label x={METER.x + METER.w + 18} y={METER.y + 18} size={22} halo={pal.panel}>{s.one}</Label>
        {clampCue >= 0 ? (
          <rect x={METER.x - 6} y={METER.y - 6} width={METER.h + 12} height={METER.h + 12} rx={14} fill="none" stroke={pal.warn}
            strokeWidth={4} opacity={progress(clampCue, 10) * (1 - progress(cull, 12))} />
        ) : null}
      </Pop>
      <Pop t={skip} delay={24} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h + 70}>
        <Box x={CARD.x + 40} y={CARD.y + CARD.h + 40} w={CARD.w - 80} h={60} r={20} fill={pal.panel} stroke={pal.ok} strokeWidth={5} />
        <Label x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h + 80} size={30} halo={pal.panel}>{s.culling}</Label>
      </Pop>

      <Pop t={both} delay={4} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={10} lookAt={lookAt} pose={skip >= 0 ? "cheer" : "idle"} reach={progress(skip - 24, 14)} />
      </Pop>
    </Stage>
  );
}
