import type { FC } from "react";
import { AbsoluteFill, Html5Audio, Series, staticFile } from "remotion";
import { SceneContext, TimingContext } from "./cue";
import type { Timing } from "./timing";

export type LessonModule = { scenes: Record<string, FC> };

// The slug is not a prop: it is fixed per composition, so the Studio props
// panel can't pair one lesson's timing with another lesson's audio.
export type LessonProps = {
  locale: string;
  timing?: Timing;
};

export function generatedPath(slug: string, locale: string, file: string) {
  return staticFile(`generated/${slug}/${locale}/${file}`);
}

export function LessonVideo({
  lesson,
  slug,
  locale,
  timing,
}: LessonProps & { lesson: LessonModule; slug: string }) {
  if (!timing) throw new Error(`no timing loaded for ${slug}/${locale}`);
  return (
    <TimingContext.Provider value={timing}>
      <AbsoluteFill style={{ backgroundColor: "#fdf8ef" }}>
        <Series>
          {timing.scenes.map((scene) => {
            const Scene = lesson.scenes[scene.id];
            if (!Scene) throw new Error(`${slug}: no component for scene "${scene.id}"`);
            return (
              <Series.Sequence
                key={scene.id}
                durationInFrames={scene.durationInFrames}
                name={scene.id}
              >
                <SceneContext.Provider value={{ id: scene.id, from: scene.from }}>
                  <Scene />
                </SceneContext.Provider>
              </Series.Sequence>
            );
          })}
        </Series>
        {timing.audio ? <Html5Audio src={generatedPath(slug, locale, timing.audio)} /> : null}
      </AbsoluteFill>
    </TimingContext.Provider>
  );
}
