import { EXERCISES_REGISTRY } from "@/content/lesson-registry.generated";
import type { LessonSlug } from "@/content/slugs";
import type { Locale } from "@/content/types";
import { getAttemptsForLesson } from "@/lib/exercises-read";
import { highlightCode } from "@/lib/highlight";
import { ExerciseList } from "./exercise-list";
import { PromptBody } from "./prompt-body";
import type { AttemptVM, ExerciseVM } from "./types";

// RSC: loads the lesson's exercises + attempt rows, resolves the locale and
// pre-renders prompts/solutions server-side; the client list owns interaction.
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

  const attempts = new Map(
    getAttemptsForLesson(slug).map((a) => [a.exerciseId, a]),
  );

  const items = await Promise.all(
    exercises.map(async (ex) => {
      const row = attempts.get(ex.id);
      const initial: AttemptVM | null = row
        ? {
            status: row.status,
            hintsRevealed: row.hintsRevealed,
            solutionRevealed: row.solutionRevealed,
            userCode: row.userCode,
            checklistState: Array.isArray(row.checklistState)
              ? row.checklistState
              : null,
          }
        : null;

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
        initial,
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
