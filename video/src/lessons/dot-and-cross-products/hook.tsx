import { polar, VisionCone } from "../../kit/angle";
import { progress } from "../../kit/easing";
import { ArrowPath, Grid, lerp, type GridSpace } from "../../kit/grid";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { Slime } from "../../mascot/Slime";
import { stride, Walker } from "../../mascot/Walker";
import { useCue } from "../../scene/cue";

// Top-down hallway: the guard looks right through a 60° cone; Inko sneaks past
// behind it, then walks into the cone and is spotted.
const FLOOR: GridSpace = { ox: 140, oy: 600, unit: 70 };
const GUARD = { x: 430, y: 410 };
const EYE = { x: 446, y: 362 };
const HALF = 30;
const RANGE = 420;
const BEHIND = { x: 190, y: 250 };
const GHOST = { x: BEHIND.x + 20, y: BEHIND.y - 60 };
const PAST = { x: 250, y: 560 };
// Inko's body sits ~15° below the guard's facing (tentacle tips ~26°): inside
// the 30° half-cone, but clearly not along f.
const FRONT = { x: 780, y: 525 };
const TITLE_Y = 120;

export function Hook() {
  const pal = usePalette();
  const t = useCue("in");
  const cone = useCue("cone");
  const sneak = useCue("sneak");
  const front = useCue("front");
  const spotted = useCue("spotted");
  const question = useCue("question");
  const answer = useCue("answer");
  const partner = useCue("partner");
  const s = {
    f: useString("f"), bang: useString("exclaim"), ask: useString("question"),
    dot: useString("dotSymbol"), cross: useString("crossSymbol"),
  };

  // Each walk ends by the next cue (cue gaps are constant), so a faster re-voice never jumps.
  const walk = front >= 0 ? stride(front, PAST, FRONT, Math.min(46, front - spotted)) : stride(sneak, BEHIND, PAST, Math.min(44, sneak - front));
  const head = { x: walk.at.x, y: walk.at.y - 70 };
  // The guard scans side to side, then freezes facing straight ahead once it spots Inko.
  const dir = Math.sin(cone / 34) * 10 * (1 - progress(spotted, 10));
  const seen = spotted >= 0;
  const facingTip = polar(EYE, dir, 190);
  // From {answer} the hallway steps back behind the two symbols.
  const dim = 1 - 0.6 * progress(answer, 14);

  return (
    <Stage>
      <g opacity={dim}>
      <Grid space={FLOOR} x={[0, 15]} y={[0, 7]} t={t} />
      <VisionCone at={EYE} dir={dir} half={HALF} range={RANGE} grow={drawn(cone, 24)} color={seen ? pal.hero : pal.accent} />

      {/* The question: facing f, the arrow to Inko, and a ghost Inko behind with its own arrow. */}
      {question >= 0 ? (
        <g>
          <g opacity={0.4 * progress(question, 12)}>
            <Inko x={BEHIND.x} y={BEHIND.y - 70} scale={0.4} seed={5} lookAt={GUARD} />
          </g>
          <ArrowPath a={EYE} b={lerp(EYE, facingTip, drawn(question, 16))} stroke={pal.accent} width={7} />
          <ArrowPath a={EYE} b={lerp(EYE, head, drawn(question, 18, 10))} stroke={pal.hero} width={7} />
          <ArrowPath a={EYE} b={lerp(EYE, GHOST, drawn(question, 18, 20))} stroke={pal.textMuted} width={6} dashed />
          {question > 14 ? <Title x={facingTip.x + 20} y={facingTip.y - 14} size={40}>{s.f}</Title> : null}
        </g>
      ) : null}

      <Pop t={t} x={GUARD.x} y={GUARD.y - 40}>
        <Slime at={GUARD} scale={0.8} face={1} />
      </Pop>
      <Pop t={spotted} x={GUARD.x} y={GUARD.y - 120}>
        <Title x={GUARD.x + 4} y={GUARD.y - 100} size={72} color={pal.hero}>{s.bang}</Title>
      </Pop>
      <Pop t={question} delay={30} x={640} y={250}>
        <Title x={640} y={272} size={80}>{s.ask}</Title>
      </Pop>
      </g>

      <Pop t={t} delay={10} x={BEHIND.x} y={BEHIND.y - 70}>
        <Walker at={walk.at} lean={walk.lean} seed={2} pose="surprised" reach={progress(spotted, 10) * (1 - progress(answer, 14))}
          lookAt={answer >= 0 ? { x: 640, y: TITLE_Y } : GUARD} />
      </Pop>

      <Pop t={answer} delay={6} x={partner >= 0 ? 520 : 640} y={TITLE_Y - 20}>
        <Title x={640 - 120 * progress(partner, 14)} y={TITLE_Y} size={76}>{s.dot}</Title>
      </Pop>
      <Pop t={partner} delay={4} x={780} y={TITLE_Y - 20}>
        <Title x={780} y={TITLE_Y} size={76} color={pal.textMuted}>{s.cross}</Title>
      </Pop>
    </Stage>
  );
}
