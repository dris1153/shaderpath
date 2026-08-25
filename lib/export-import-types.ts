// JSON row shapes for export/import — dates are ISO strings (post JSON.parse),
// unlike the DB-native drizzle select types which use `Date` objects.

export interface LessonProgressJson {
  lessonSlug: string;
  status: "locked" | "not_started" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number;
  scrollPercent: number;
  confidence: number | null;
}

export interface ExerciseAttemptJson {
  lessonSlug: string;
  exerciseId: string;
  status: "not_started" | "attempted" | "completed" | "skipped";
  hintsRevealed: number;
  solutionRevealed: boolean;
  userCode: string | null;
  checklistState: boolean[] | null;
  updatedAt: string;
}

export interface NoteJson {
  lessonSlug: string;
  anchorId: string | null;
  selectedText: string | null;
  body: string;
  createdAt: string;
}

export interface BookmarkJson {
  lessonSlug: string;
  anchorId: string | null;
  label: string | null;
  createdAt: string;
}

export interface StudySessionJson {
  lessonSlug: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
}

export interface ReviewQueueJson {
  lessonSlug: string;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  reviewCount: number;
}

export interface SnippetJson {
  title: string;
  vertexShader: string | null;
  fragmentShader: string;
  uniformsJson: unknown;
  forkedFromLesson: string | null;
  createdAt: string;
}


export interface ImportTables {
  lessonProgress: LessonProgressJson[];
  exerciseAttempts: ExerciseAttemptJson[];
  notes: NoteJson[];
  bookmarks: BookmarkJson[];
  studySessions: StudySessionJson[];
  reviewQueue: ReviewQueueJson[];
  playgroundSnippets: SnippetJson[];
}

export interface ImportPayload {
  schemaVersion: number;
  exportedAt: string;
  tables: ImportTables;
}
