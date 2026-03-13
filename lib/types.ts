export type UserRole = "admin" | "user";
export type OptionKey = "a" | "b" | "c" | "d" | "e";
export type QuestionFlagStatus = "answered" | "doubtful" | "empty";

export interface User {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  education: string;
  schoolOrigin: string;
  examPurpose: string;
  address: string;
  phone: string;
  targetScore: number;
  isPremium: boolean;
}

export interface Question {
  id: number;
  order: number;
  question: string;
  options: Record<OptionKey, string>;
}

export interface TestAnswer {
  questionId: number;
  answer: OptionKey | null;
  status: QuestionFlagStatus;
  index: number;
}

export interface TestResult {
  sessionId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: string;
  startedAt?: string;
  submittedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
