// ===== USER PROFILE =====
export type UserProfile = {
  uid: string;
  email: string | null;
  createdAt: number;

  weeklyGoalMinutes: number;
  pomodoroFocusMin: number;
  pomodoroBreakMin: number;
};

// ===== REVIEW =====
export type ReviewStage = 0 | 1 | 2 | 3;

// ===== TASKS (Planner + Revisão Inteligente) =====
export type StudyTask = {
  id?: string;
  uid: string;

  title: string;
  subject: string;

  status: "todo" | "done";

  createdAt: number;
  updatedAt: number;

  reviewStage?: ReviewStage;
  nextReviewAt?: number | null;
  lastReviewedAt?: number | null;
};

// ===== SESSIONS (Pomodoro) =====
export type StudySession = {
  id?: string;
  uid: string;

  subject: string;

  startedAt: number;
  endedAt: number;

  durationMin: number;
};

// ===== SUBJECTS (Matérias) =====
export type Subject = {
  id?: string;
  uid: string;

  name: string;
  color?: string | null;

  createdAt: number;
  updatedAt: number;
};

// ===== TOPICS (Subpastas) =====
export type Topic = {
  id?: string;
  uid: string;

  subjectId: string;

  name: string;

  createdAt: number;
  updatedAt: number;
};

// ===== QUESTIONS (Modo Prova) =====
export type Question = {
  id?: string;
  uid: string;

  subject: string;

  statement: string;

  correctAnswer: "C" | "E";

  createdAt: number;
};

// ===== USER ANSWERS (Histórico + Estatística) =====
export type UserAnswer = {
  id?: string;
  uid: string;

  questionId: string;
  subject: string;

  userAnswer: "C" | "E";
  correctAnswer: "C" | "E";

  isCorrect: boolean;

  answeredAt: number;
};

