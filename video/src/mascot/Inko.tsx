import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { usePalette } from "../kit/palette";
import { SceneContext, TimingContext } from "../scene/cue";
import { blinkAmount, mouthOpen } from "./face";
import { assignTargets, centerline, outlinePath, suckers, type TentacleSpec, type Vec } from "./tentacles";

export type Pose = "idle" | "point" | "think" | "cheer" | "surprised" | "threads";

type Props = {
  x: number;
  y: number;
  scale?: number;
  pose?: Pose;
  lookAt?: Vec; // scene coordinates
  pointAt?: Vec; // scene coordinates, for pose "point"
  threads?: Vec[]; // up to 8 scene-coordinate targets, for pose "threads"
  // 0 = tentacles idle, 1 = fully in the pose. Drive it from a cue with
  // progress() so pose changes blend instead of snapping in one frame.
  reach?: number;
  seed?: number;
};

// Inko-local layout: head centred on (0, -6); tentacle roots hidden under it.
const FRONT_X = [-62, -22, 22, 62];
const BACK_X = [-84, -44, 44, 84];

function spec(x: number, front: boolean, i: number): TentacleSpec {
  const side = Math.sign(x);
  return {
    base: { x, y: front ? 40 : 30 },
    angle: Math.PI / 2 - (x / 70) * (front ? 0.55 : 0.95),
    length: front ? 150 : 128,
    curl: -side * (Math.abs(x) > 40 ? 1.7 : 0.9),
    phase: i * 1.37 + (front ? 0 : 0.6),
    width: front ? [32, 9] : [26, 8],
  };
}

const FRONT = FRONT_X.map((x, i) => spec(x, true, i));
const BACK = BACK_X.map((x, i) => spec(x, false, i + 4));

// Per-pose targets in Inko-local space, keyed by tentacle (0–3 back, 4–7 front).
function poseTargets(pose: Pose, time: number, local: (p: Vec) => Vec, props: Props): (Vec | undefined)[] {
  const t: (Vec | undefined)[] = Array(8).fill(undefined);
  if (pose === "point" && props.pointAt) {
    const target = local(props.pointAt);
    t[target.x >= 0 ? 7 : 4] = target;
  } else if (pose === "cheer") {
    const wave = Math.sin(time * 2) * 18;
    t[4] = { x: -150, y: -120 + wave };
    t[7] = { x: 150, y: -120 - wave };
  } else if (pose === "think") {
    // Scratching the side of the head: outside the head so it isn't hidden.
    t[4] = { x: -118, y: -52 + Math.sin(time * 3) * 4 };
  } else if (pose === "surprised") {
    const angles = [205, 225, 315, 335, 190, 245, 295, 350];
    angles.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      t[i] = { x: Math.cos(a) * 200, y: Math.sin(a) * 170 + 110 };
    });
  } else if (pose === "threads" && props.threads) {
    return assignTargets(
      [...BACK, ...FRONT].map((s) => s.base),
      props.threads.map(local),
    );
  }
  return t;
}

function useSpokenWords() {
  const timing = useContext(TimingContext);
  const scene = useContext(SceneContext);
  if (!timing || !scene) return { words: [], from: 0 };
  return { words: timing.words.filter((w) => w.scene === scene.id), from: scene.from };
}

export function Inko({ x, y, scale = 1, pose = "idle", lookAt, pointAt, threads, reach = 1, seed = 1 }: Props) {
  const pal = usePalette();
  const localFrame = useCurrentFrame();
  const { words, from } = useSpokenWords();
  // Ambient motion runs on the absolute frame so Inko doesn't jump at cuts.
  const frame = from + localFrame;
  const time = (frame * 2 * Math.PI) / 72;

  const bob = Math.sin(time) * 5;
  const squash = 1 + Math.sin(time) * 0.015;
  const sx = scale * (2 - squash);
  const sy = scale * squash;
  // Exact inverse of the group transform below, so targets land where asked.
  const local = (p: Vec): Vec => ({ x: (p.x - x) / sx, y: (p.y - y - bob * scale) / sy });

  const r = Math.max(0, Math.min(1, reach));
  const targets = poseTargets(pose, time, local, { x, y, pointAt, threads });
  const posedAmp = pose === "threads" || pose === "surprised" ? 0.12 : 0.28;
  const amp = 0.28 + (posedAmp - 0.28) * r;

  const blink = pose === "cheer" ? 0 : blinkAmount(frame, seed);
  const talk = mouthOpen(frame, words);

  let look: Vec = { x: 0, y: 0 };
  if (pose === "think") look = { x: -6, y: -8 };
  else if (lookAt) {
    const l = local(lookAt);
    const len = Math.hypot(l.x, l.y + 10) || 1;
    const k = Math.min(1, len / 60) * 8;
    look = { x: (l.x / len) * k, y: ((l.y + 10) / len) * k };
  }

  const tips: Vec[] = [];
  const renderTentacle = (s: TentacleSpec, i: number, front: boolean) => {
    const pts = centerline(s, { time, amp, target: targets[i], reach: targets[i] ? r : 0 });
    if (pose === "threads" && targets[i]) tips.push(pts[pts.length - 1]!);
    return (
      <g key={i}>
        <path
          d={outlinePath(s, pts)}
          fill={front ? pal.inko : pal.inkoShade}
          stroke={pal.outline}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {front
          ? suckers(s, pts).map((c, j) => (
              <circle key={j} cx={c.x} cy={c.y} r={c.r} fill={pal.inkoLight} />
            ))
          : null}
      </g>
    );
  };

  const eye = (cx: number, mirror: 1 | -1) => {
    if (pose === "cheer") {
      return (
        <path
          d={`M ${cx - 18} ${-6} Q ${cx} ${-30} ${cx + 18} ${-6}`}
          fill="none"
          stroke={pal.outline}
          strokeWidth={7}
          strokeLinecap="round"
        />
      );
    }
    const wide = pose === "surprised";
    const rx = wide ? 29 : 25;
    const ry = (wide ? 35 : 30) * (1 - 0.9 * blink);
    const pr = wide ? 9 : 13;
    return (
      <g>
        <ellipse cx={cx} cy={-10} rx={rx} ry={Math.max(2, ry)} fill="#FFFFFF" stroke={pal.outline} strokeWidth={6} />
        {blink < 0.6 ? (
          <g>
            <circle cx={cx + look.x} cy={-6 + look.y} r={pr} fill={pal.outline} />
            <circle cx={cx + look.x - pr * 0.35} cy={-6 + look.y - pr * 0.4} r={pr * 0.36} fill="#FFFFFF" />
          </g>
        ) : null}
        {pose === "think" && mirror === -1 ? (
          <path d={`M ${cx - 20} -52 Q ${cx} -64 ${cx + 20} -54`} fill="none" stroke={pal.outline} strokeWidth={6} strokeLinecap="round" />
        ) : null}
        {wide ? (
          <path d={`M ${cx - 18} -58 Q ${cx} -70 ${cx + 18} -58`} fill="none" stroke={pal.outline} strokeWidth={6} strokeLinecap="round" />
        ) : null}
      </g>
    );
  };

  const mouth = () => {
    if (pose === "surprised") {
      return <ellipse cx={0} cy={40} rx={9} ry={12} fill={pal.outline} />;
    }
    const open = pose === "cheer" ? 0.9 : talk;
    if (open < 0.08) {
      if (pose === "think") {
        return <path d="M -10 38 Q -2 33 9 38" fill="none" stroke={pal.outline} strokeWidth={6} strokeLinecap="round" />;
      }
      return <path d="M -16 32 Q 0 44 16 32" fill="none" stroke={pal.outline} strokeWidth={6} strokeLinecap="round" />;
    }
    const depth = 10 + open * 26;
    return (
      <g>
        <path
          d={`M -18 31 Q 0 37 18 31 Q 0 ${31 + depth * 1.7} -18 31 Z`}
          fill={pal.outline}
          stroke={pal.outline}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {open > 0.35 ? <ellipse cx={0} cy={31 + depth * 0.62} rx={9} ry={depth * 0.22} fill={pal.cheek} /> : null}
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y + bob * scale}) scale(${sx} ${sy})`}>
      {BACK.map((s, i) => renderTentacle(s, i, false))}
      {FRONT.map((s, i) => renderTentacle(s, i + 4, true))}
      {/* Brush tips go on top of every tentacle so none hides another's. */}
      {r > 0.9
        ? tips.map((tip, i) => (
            <circle key={i} cx={tip.x} cy={tip.y} r={9} fill={pal.accent} stroke={pal.outline} strokeWidth={4} />
          ))
        : null}
      <ellipse cx={0} cy={-6} rx={92} ry={96} fill={pal.inko} stroke={pal.outline} strokeWidth={7} />
      <circle cx={-30} cy={-72} r={9} fill={pal.inkoLight} />
      <circle cx={22} cy={-80} r={6} fill={pal.inkoLight} />
      <circle cx={50} cy={-58} r={5} fill={pal.inkoLight} />
      <path d="M -66 -38 Q -62 -72 -30 -88" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
      <ellipse cx={-60} cy={24} rx={15} ry={9} fill={pal.cheek} opacity={0.85} />
      <ellipse cx={60} cy={24} rx={15} ry={9} fill={pal.cheek} opacity={0.85} />
      {eye(-36, -1)}
      {eye(36, 1)}
      {mouth()}
    </g>
  );
}
