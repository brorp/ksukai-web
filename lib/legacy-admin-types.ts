import { OptionKey } from "./types";

// Compatibility types for the old localStorage-backed admin/demo modules.
// These are intentionally separate from API-backed app types.
export type LegacyUserRole = "admin" | "apoteker";

export interface LegacyManagedUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: LegacyUserRole;
  createdAt: Date | string;
}

export interface LegacyQuestion {
  id: number;
  question: string;
  options: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  category: string;
}

export interface LegacyTestResult {
  id: string;
  userId: string;
  username: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date | string;
  duration: number;
}
