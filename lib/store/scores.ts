import { create } from "zustand";
import { LegacyTestResult } from "../legacy-admin-types";

interface ScoresStore {
  results: LegacyTestResult[];
  loadResults: () => void;
  addResult: (result: LegacyTestResult) => void;
  getUserResults: (userId: string) => LegacyTestResult[];
  getAllResults: () => LegacyTestResult[];
  deleteResult: (resultId: string) => void;
  getAverageScore: () => number;
}

export const useScoresStore = create<ScoresStore>((set, get) => ({
  results: [],

  loadResults: () => {
    const resultsJson = localStorage.getItem("test-results");
    const results = resultsJson ? JSON.parse(resultsJson) : [];
    set({
      results: results.map((result: LegacyTestResult) => ({
        ...result,
        completedAt: new Date(result.completedAt),
      })),
    });
  },

  addResult: (result: LegacyTestResult) => {
    const results = [...get().results, result];
    localStorage.setItem("test-results", JSON.stringify(results));
    set({ results });
  },

  getUserResults: (userId: string) => {
    return get().results.filter((r) => r.userId === userId);
  },

  getAllResults: () => {
    return get().results;
  },

  deleteResult: (resultId: string) => {
    const results = get().results.filter((r) => r.id !== resultId);
    localStorage.setItem("test-results", JSON.stringify(results));
    set({ results });
  },

  getAverageScore: () => {
    const results = get().results;
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + r.score, 0);
    return Math.round(sum / results.length);
  },
}));
