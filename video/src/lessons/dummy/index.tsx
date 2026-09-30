import { interpolate, spring, useVideoConfig } from "remotion";
import { useCue } from "../../scene/cue";
import type { LessonModule } from "../../scene/LessonVideo";

// Pipeline fixture: proves cue-driven motion end to end. Not a real lesson.
function Hello() {
  const t = useCue("hello");
  const { fps } = useVideoConfig();
  const scale = spring({ frame: t, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "#ff7a59",
          border: "8px solid #1d1b2f",
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}

function Wave() {
  const t = useCue("wave");
  const x = interpolate(t, [0, 20], [-400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 300,
        textAlign: "center",
        fontSize: 96,
        fontWeight: 800,
        fontFamily: "sans-serif",
        color: "#1d1b2f",
        transform: `translateX(${x}px)`,
      }}
    >
      Hello, Inko
    </div>
  );
}

export const lesson: LessonModule = { scenes: { hello: Hello, wave: Wave } };
