import { progress } from "../../kit/easing";
import { Pop, SlideIn } from "../../kit/motion";
import { Stage } from "../../kit/stage";
import { Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import type { LessonModule } from "../../scene/LessonVideo";

// Pipeline fixture: proves cue-driven motion and the word-driven mouth end to
// end. Not a real lesson.
function Hello() {
  const t = useCue("hello");
  return (
    <Stage>
      <Pop t={t} x={640} y={380}>
        <Inko x={640} y={380} scale={1.3} pose="idle" lookAt={{ x: 640, y: 600 }} />
      </Pop>
    </Stage>
  );
}

function Wave() {
  const t = useCue("wave");
  return (
    <Stage>
      <Inko x={380} y={400} scale={1.1} pose="cheer" reach={progress(t, 14)} lookAt={{ x: 900, y: 300 }} />
      <SlideIn t={t} from="right">
        <Title x={880} y={320} size={80}>
          {useString("title")}
        </Title>
      </SlideIn>
    </Stage>
  );
}

export const lesson: LessonModule = { scenes: { hello: Hello, wave: Wave } };
