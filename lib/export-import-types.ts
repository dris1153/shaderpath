// JSON row shapes for export/import — dates are ISO strings (post JSON.parse),
// unlike the DB-native drizzle select types which use `Date` objects.

export interface LessonProgressJson {
  id: number;
  lessonSlug: string;
  status: "locked" | "not_started" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number;
  scrollPercent: number;
  confidence: number | null;
}

export interface ExerciseAttemptJson {
  id: number;
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
  id: number;
  lessonSlug: string;
  anchorId: string | null;
  selectedText: string | null;
  body: string;
  createdAt: string;
}

export interface BookmarkJson {
  id: number;
  lessonSlug: string;
  anchorId: string | null;
  label: string | null;
  createdAt: string;
}

export interface StudySessionJson {
  id: number;
  lessonSlug: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
}

export interface ReviewQueueJson {
  id: number;
  lessonSlug: string;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  reviewCount: number;
}

export interface SnippetJson {
  id: number;
  title: string;
  vertexShader: string | null;
  fragmentShader: string;
  uniformsJson: unknown;
  forkedFromLesson: string | null;
  createdAt: string;
}

export interface SettingJson {
  key: string;
  value: string;
}

export interface ImportTables {
  lessonProgress: LessonProgressJson[];
  exerciseAttempts: ExerciseAttemptJson[];
  notes: NoteJson[];
  bookmarks: BookmarkJson[];
  studySessions: StudySessionJson[];
  reviewQueue: ReviewQueueJson[];
  playgroundSnippets: SnippetJson[];
  settings: SettingJson[];
}

export interface ImportPayload {
  schemaVersion: number;
  exportedAt: string;
  tables: ImportTables;
}
