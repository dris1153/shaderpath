import { EXERCISES_REGISTRY } from "@/content/lesson-registry.generated";
import type { LessonSlug } from "@/content/slugs";
import type { Locale } from "@/content/types";
import { highlightCode } from "@/lib/highlight";
import { ExerciseList } from "./exercise-list";
import { PromptBody } from "./prompt-body";
import type { ExerciseVM } from "./types";

// RSC: loads the lesson's exercises, resolves the locale and pre-renders
// prompts/solutions server-side — all of it from content files, so it survives
// a database outage. Attempt rows are the client list's job now.
export async function ExerciseSection({
  slug,
  locale,
}: {
  slug: LessonSlug;
  locale: Locale;
}) {
  const loader = EXERCISES_REGISTRY[slug];
  if (!loader) return null;
  const { exercises } = await loader();
  if (exercises.length === 0) return null;

  const items = await Promise.all(
    exercises.map(async (ex) => {
      const vm: ExerciseVM = {
        id: ex.id,
        kind: ex.kind,
        hints: ex.hints.map((h) => h[locale]),
        checklist: ex.checklist.map((c) => c[locale]),
        starterCode: ex.starterCode,
        referenceImage: ex.referenceImage,
      };

      return {
        exercise: vm,
        prompt: <PromptBody text={ex.prompt[locale]} />,
        solutionNote: ex.solutionNote ? (
          <PromptBody text={ex.solutionNote[locale]} />
        ) : null,
        solutionHtml: ex.solutionCode
          ? await highlightCode(
              ex.solutionCode,
              ex.kind === "shader" ? "glsl" : "ts",
            )
          : null,
      };
    }),
  );

  return <ExerciseList lessonSlug={slug} items={items} />;
}
