import type { Exercise } from "../../types";

// D9: regular lesson ≥2 (one "concept" + one "code"); checkpoint ≥1 "build"
// with ≥3 checklist items. Prompts stay inside the PromptBody subset:
// paragraphs, `inline code`, $katex$, ```fences``` — no lists/links/headings.
// NOTE: adjust the relative path depth when copying (../../../types).
export const exercises: Exercise[] = [
  {
    id: "todo-concept",
    kind: "concept",
    prompt: { vi: "TODO", en: "TODO" },
    hints: [{ vi: "TODO", en: "TODO" }],
    checklist: [{ vi: "TODO", en: "TODO" }],
  },
];
