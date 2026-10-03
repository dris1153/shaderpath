import { Stage } from "../../kit/stage";
import { Inko } from "../../mascot/Inko";

// ponytail: placeholder for scenes not built yet, so the full render and QC run.
export function Pending() {
  return (
    <Stage>
      <Inko x={640} y={330} scale={0.8} seed={3} />
    </Stage>
  );
}
