import { create } from 'zustand';
import { TestResult } from '../types';

interface ScoresStore {
  results: TestResult[];
  loadResults: () => void;
  addResult: (result: TestResult) => void;
  getUserResults: (userId: string) => TestResult[];
  getAllResults: () => TestResult[];
  deleteResult: (resultId: string) => void;
  getAverageScore: () => number;
}

export const useScoresStore = create<ScoresStore>((set, get) => ({
  results: [],

  loadResults: () => {
    const resultsJson = localStorage.getItem('test-results');
    const results = resultsJson ? JSON.parse(resultsJson) : [];
    set({
      results: results.map((r: any) => ({
        ...r,
        completedAt: new Date(r.completedAt),
      })),
    });
  },

  addResult: (result: TestResult) => {
    const results = [...get().results, result];
    localStorage.setItem('test-results', JSON.stringify(results));
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
    localStorage.setItem('test-results', JSON.stringify(results));
    set({ results });
  },

  getAverageScore: () => {
    const results = get().results;
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + r.score, 0);
    return Math.round(sum / results.length);
  },
}));
