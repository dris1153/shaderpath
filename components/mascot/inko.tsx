import { cn } from "@/lib/utils";
import { INKO_POSES, INKO_VIEWBOX } from "./inko-poses.generated";

export type InkoPose = keyof typeof INKO_POSES;

// Same colours as the video mascot (video/src/kit/palette.ts), in both themes.
const BODY = "#9C7BFF";
const SHADE = "#7A5BE0";
const LIGHT = "#C7B6FF";
const CHEEK = "#FF93B5";
const OUTLINE = "#26213A";

type Props = {
  pose?: InkoPose;
  /** Rendered width in px; height follows the artwork. */
  size?: number;
  /** Accessible name. Without it Inko is decorative and hidden from AT. */
  label?: string;
  className?: string;
};

function Eye({ cx, pose }: { cx: number; pose: InkoPose }) {
  if (pose === "cheer" || pose === "sleep") {
    const d =
      pose === "cheer"
        ? `M ${cx - 18} -6 Q ${cx} -30 ${cx + 18} -6`
        : `M ${cx - 18} -12 Q ${cx} 4 ${cx + 18} -12`;
    return <path d={d} fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />;
  }
  const wide = pose === "surprised";
  const look = pose === "think" ? { x: -6, y: -8 } : { x: 0, y: 0 };
  const pupil = wide ? 9 : 13;
  return (
    <g>
      <g className="origin-center [transform-box:fill-box] motion-safe:animate-inko-blink">
        <ellipse cx={cx} cy={-10} rx={wide ? 29 : 25} ry={wide ? 35 : 30} fill="#FFFFFF" stroke={OUTLINE} strokeWidth={6} />
        <circle cx={cx + look.x} cy={-6 + look.y} r={pupil} fill={OUTLINE} />
        <circle cx={cx + look.x - pupil * 0.35} cy={-6 + look.y - pupil * 0.4} r={pupil * 0.36} fill="#FFFFFF" />
      </g>
      {wide ? (
        <path d={`M ${cx - 18} -58 Q ${cx} -70 ${cx + 18} -58`} fill="none" stroke={OUTLINE} strokeWidth={6} strokeLinecap="round" />
      ) : null}
      {pose === "think" && cx < 0 ? (
        <path d={`M ${cx - 20} -52 Q ${cx} -64 ${cx + 20} -54`} fill="none" stroke={OUTLINE} strokeWidth={6} strokeLinecap="round" />
      ) : null}
    </g>
  );
}

function Mouth({ pose }: { pose: InkoPose }) {
  const line = (d: string) => (
    <path d={d} fill="none" stroke={OUTLINE} strokeWidth={6} strokeLinecap="round" />
  );
  if (pose === "surprised") return <ellipse cx={0} cy={40} rx={9} ry={12} fill={OUTLINE} />;
  if (pose === "think") return line("M -10 38 Q -2 33 9 38");
  if (pose === "sleep") return line("M -8 36 Q 0 41 8 36");
  if (pose === "idle") return line("M -16 32 Q 0 44 16 32");
  // Open smile: cheer is wide open, wave half open (video mouth at 0.9 / 0.5).
  const [bottom, tongueY, tongueRy] = pose === "cheer" ? [87.8, 51.7, 7.3] : [70.1, 45.3, 5.1];
  return (
    <g>
      <path d={`M -18 31 Q 0 37 18 31 Q 0 ${bottom} -18 31 Z`} fill={OUTLINE} stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={0} cy={tongueY} rx={9} ry={tongueRy} fill={CHEEK} />
    </g>
  );
}

export function Inko({ pose = "idle", size = 96, label, className }: Props) {
  const shape = INKO_POSES[pose];
  const [, , w, h] = INKO_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
  const tentacle = (d: string, i: number, fill: string) => (
    <path key={i} d={d} fill={fill} stroke={OUTLINE} strokeWidth={6} strokeLinejoin="round" />
  );

  return (
    <svg
      viewBox={INKO_VIEWBOX}
      width={size}
      height={Math.round((size * h) / w)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0 overflow-visible motion-safe:animate-inko-bob", className)}
    >
      {shape.back.map((d, i) => tentacle(d, i, SHADE))}
      {shape.front.map((d, i) =>
        // The raised front-right tentacle waves from its root.
        pose === "wave" && i === 3 ? (
          <g key={i} className="motion-safe:animate-inko-wave" style={{ transformOrigin: "62px 40px" }}>
            {tentacle(d, i, BODY)}
          </g>
        ) : (
          tentacle(d, i, BODY)
        ),
      )}
      {shape.suckers.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={LIGHT} />
      ))}
      <ellipse cx={0} cy={-6} rx={92} ry={96} fill={BODY} stroke={OUTLINE} strokeWidth={7} />
      <circle cx={-30} cy={-72} r={9} fill={LIGHT} />
      <circle cx={22} cy={-80} r={6} fill={LIGHT} />
      <circle cx={50} cy={-58} r={5} fill={LIGHT} />
      <path d="M -66 -38 Q -62 -72 -30 -88" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
      <ellipse cx={-60} cy={24} rx={15} ry={9} fill={CHEEK} opacity={0.85} />
      <ellipse cx={60} cy={24} rx={15} ry={9} fill={CHEEK} opacity={0.85} />
      <Eye cx={-36} pose={pose} />
      <Eye cx={36} pose={pose} />
      <Mouth pose={pose} />
      {pose === "sleep" ? (
        <path d="M 96 -118 h 22 l -22 24 h 22 M 132 -146 h 15 l -15 16 h 15" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
    </svg>
  );
}
