import { progress } from "../../kit/easing";
import { FadeOut, Pop } from "../../kit/motion";
import { Stage } from "../../kit/stage";
import { useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { BellButton, LikeButton, pressAmount, ringAngle, SubscribeButton } from "./buttons";

// Free regions for YouTube's end screen ("1 video + subscribe"), in stage px.
// Nothing is drawn inside them from the `next` cue on, so the elements placed
// in Studio over the last seconds land on empty paper. Kept in sync with the
// "End screen" section that `pnpm youtube` writes into metadata.md.
export const END_SCREEN = {
  video: { x: 100, y: 150, w: 520, h: 292 },
  subscribe: { cx: 800, cy: 296, r: 88 },
} as const;

const LIKE = { x: 790, y: 270 };
const SUB = { x: 860, y: 452 };
const BELL = { x: 1112, y: 452 };
const INKO_A = { x: 360, y: 380 };
const INKO_B = { x: 1050, y: 430 };
// The tentacle presses the subscribe button's left cap, so it never crosses the label.
const SUB_AIM = { x: SUB.x - 118, y: SUB.y + 6 };
// Pointing at the subscribe region stops at its rim: Studio's element covers the inside.
const RIM = (() => {
  const { cx, cy, r } = END_SCREEN.subscribe;
  const dx = INKO_B.x - cx;
  const dy = INKO_B.y - cy;
  const k = (r + 16) / Math.hypot(dx, dy);
  return { x: cx + dx * k, y: cy + dy * k };
})();

// Re-aiming relaxes the tentacle and reaches again, so a new target never snaps.
function aim(t: number): number {
  return t < 0 ? 1 : t < 8 ? 1 - progress(t, 8) : progress(t - 8, 14);
}

// Shared like/subscribe outro clip: rendered once as the `outro` fixture, joined after lessons whose script sets `outro: true`.
// Beats: {like} Inko presses the like button; {sub} the subscribe button and the
// bell; {next} the buttons leave and Inko points at the end-screen regions.
export function Outro() {
  const like = useCue("like");
  const sub = useCue("sub");
  const next = useCue("next");
  const subscribe = useString("outro.subscribe");
  const subscribed = useString("outro.subscribed");

  const move = progress(next, 26);
  const at = { x: INKO_A.x + (INKO_B.x - INKO_A.x) * move, y: INKO_A.y + (INKO_B.y - INKO_A.y) * move };
  const target = next >= 8 ? RIM : sub >= 8 ? SUB_AIM : LIKE;

  const buttons = (
    <>
      <Pop t={like} x={LIKE.x} y={LIKE.y}>
        <LikeButton x={LIKE.x} y={LIKE.y} press={pressAmount(like - 14)} liked={like >= 19} />
      </Pop>
      <Pop t={sub} x={SUB.x} y={SUB.y}>
        <SubscribeButton x={SUB.x} y={SUB.y} press={pressAmount(sub - 22)} subscribed={sub >= 27} label={sub >= 27 ? subscribed : subscribe} />
      </Pop>
      <Pop t={sub} delay={6} x={BELL.x} y={BELL.y}>
        <BellButton x={BELL.x} y={BELL.y} press={pressAmount(sub - 32)} angle={ringAngle(sub - 36)} />
      </Pop>
    </>
  );

  return (
    <Stage>
      {next < 0 ? buttons : <FadeOut t={next} duration={12}>{buttons}</FadeOut>}
      <Inko
        x={at.x}
        y={at.y}
        scale={0.95 - 0.17 * move}
        pose={like >= 0 ? "point" : "idle"}
        pointAt={target}
        reach={progress(like, 12) * aim(sub) * aim(next)}
        lookAt={target}
      />
    </Stage>
  );
}
