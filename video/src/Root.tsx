import type { FC } from "react";
import { Composition } from "remotion";
import { LESSONS } from "./lessons";
import { generatedPath, LessonVideo, type LessonProps } from "./scene/LessonVideo";
import { totalFrames, validateStrings, validateTiming, type Timing } from "./scene/timing";
import { Thumbnail, type ThumbnailProps } from "./thumbnail/Thumbnail";

// Built once at module load so each composition keeps a stable component.
const COMPONENTS: Record<string, FC<LessonProps>> = Object.fromEntries(
  Object.entries(LESSONS).map(([slug, lesson]) => [
    slug,
    (props: LessonProps) => <LessonVideo {...props} lesson={lesson} slug={slug} />,
  ]),
);

export function Root() {
  return (
    <>
      <Composition
        id="thumbnail"
        component={Thumbnail}
        width={1280}
        height={720}
        fps={30}
        durationInFrames={1}
        defaultProps={{ lines: ["TITLE"] } as ThumbnailProps}
      />
      {Object.keys(LESSONS).map((slug) => (
        <Composition
          key={slug}
          id={slug}
          component={COMPONENTS[slug]!}
          defaultProps={{ locale: "en" } as LessonProps}
          // No placeholder dimensions: if this ever stops returning them,
          // Remotion throws instead of rendering a 1-frame video.
          calculateMetadata={async ({ props, abortSignal }) => {
            const res = await fetch(generatedPath(slug, props.locale, "timing.json"), {
              signal: abortSignal,
            });
            if (!res.ok) {
              throw new Error(`${slug}/${props.locale}: timing.json not found — run tts first`);
            }
            const timing = (await res.json()) as Timing;
            validateTiming(timing);
            // Always written by the voice step ({} when a lesson shows no words).
            const stringsRes = await fetch(generatedPath(slug, props.locale, "strings.json"), {
              signal: abortSignal,
            });
            if (!stringsRes.ok) {
              throw new Error(`${slug}/${props.locale}: strings.json not found — run tts first`);
            }
            const strings = validateStrings(await stringsRes.json());
            return {
              durationInFrames: totalFrames(timing),
              fps: timing.fps,
              width: timing.width,
              height: timing.height,
              props: { ...props, timing, strings },
            };
          }}
        />
      ))}
    </>
  );
}
