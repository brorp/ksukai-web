export type UserRole = "admin" | "user";
export type OptionKey = "a" | "b" | "c" | "d" | "e";
export type QuestionFlagStatus = "answered" | "doubtful" | "empty";
export type ExamPurpose =
  | "persiapan_ukai"
  | "persiapan_masuk_apoteker"
  | "lainnya";
export type UserAccountStatus = "active" | "inactive";
export type UserAuthProvider = "email" | "google" | "both";

export interface User {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  education: string;
  schoolOrigin: string;
  examPurpose: ExamPurpose;
  address: string;
  phone: string;
  targetScore: number;
  isPremium: boolean;
  accountStatus: UserAccountStatus;
  statusNote?: string | null;
  authProvider?: UserAuthProvider;
}

export interface Question {
  id: number;
  order: number;
  question: string;
  options: Record<OptionKey, string>;
  imageUrl?: string | null;
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
