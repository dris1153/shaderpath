export interface ExerciseVM {
  id: string;
  kind: "concept" | "code" | "shader" | "build";
  hints: string[];
  checklist: string[];
  starterCode?: string;
  referenceImage?: string;
}

export type AttemptStatus =
  | "not_started"
  | "attempted"
  | "completed"
  | "skipped";

export interface AttemptVM {
  status: AttemptStatus;
  hintsRevealed: number;
  solutionRevealed: boolean;
  userCode: string | null;
  checklistState: boolean[] | null;
}

export const EMPTY_ATTEMPT: AttemptVM = {
  status: "not_started",
  hintsRevealed: 0,
  solutionRevealed: false,
  userCode: null,
  checklistState: null,
};
