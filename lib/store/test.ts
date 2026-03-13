import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { OptionKey, Question, QuestionFlagStatus, TestAnswer } from "@/lib/types";

interface ExamSessionSnapshot {
  sessionId: number;
  startTime: string;
  durationMinutes: number;
  gracePeriodMinutes: number;
  questions: Question[];
}

interface TestStore {
  sessionId: number | null;
  currentQuestionIndex: number;
  answers: TestAnswer[];
  startTime: number | null;
  durationMinutes: number;
  gracePeriodMinutes: number;
  shuffledQuestions: Question[];
  submittedSessionId: number | null;

  setCurrentQuestion: (index: number) => void;
  setAnswer: (
    questionId: number,
    answer: OptionKey | null,
    status: QuestionFlagStatus,
  ) => void;
  setAnswerStatus: (questionId: number, status: QuestionFlagStatus) => void;
  toggleDoubtful: (questionId: number) => void;
  getAnswer: (questionId: number) => TestAnswer | undefined;
  getAnswersArray: () => TestAnswer[];
  initializeSession: (session: ExamSessionSnapshot) => void;
  getElapsedTime: () => number;
  getRemainingSeconds: () => number;
  setSubmittedSessionId: (sessionId: number | null) => void;
  resetTest: () => void;
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      sessionId: null,
      currentQuestionIndex: 0,
      answers: [],
      startTime: null,
      durationMinutes: 200,
      gracePeriodMinutes: 1,
      shuffledQuestions: [],
      submittedSessionId: null,

      setCurrentQuestion: (index) => {
        const maxIndex = Math.max(get().shuffledQuestions.length - 1, 0);
        set({
          currentQuestionIndex: Math.min(Math.max(index, 0), maxIndex),
        });
      },

      setAnswer: (questionId, answer, status) => {
        const { answers, shuffledQuestions } = get();
        const index = shuffledQuestions.findIndex((q) => q.id === questionId);
        const answerIndex = answers.findIndex((item) => item.questionId === questionId);

        const payload: TestAnswer = {
          questionId,
          answer,
          status,
          index: index >= 0 ? index : 0,
        };

        if (answerIndex >= 0) {
          const copy = [...answers];
          copy[answerIndex] = payload;
          set({ answers: copy });
          return;
        }

        set({ answers: [...answers, payload] });
      },

      setAnswerStatus: (questionId, status) => {
        const existing = get().getAnswer(questionId);
        get().setAnswer(questionId, existing?.answer ?? null, status);
      },

      toggleDoubtful: (questionId) => {
        const existing = get().getAnswer(questionId);
        if (!existing) {
          get().setAnswer(questionId, null, "doubtful");
          return;
        }

        const nextStatus = existing.status === "doubtful" ? "answered" : "doubtful";
        get().setAnswer(questionId, existing.answer, nextStatus);
      },

      getAnswer: (questionId) =>
        get().answers.find((answer) => answer.questionId === questionId),

      getAnswersArray: () => get().answers,

      initializeSession: (session) => {
        const sameSession =
          get().sessionId === session.sessionId && get().answers.length > 0;

        set({
          sessionId: session.sessionId,
          startTime: new Date(session.startTime).getTime(),
          durationMinutes: session.durationMinutes,
          gracePeriodMinutes: session.gracePeriodMinutes,
          shuffledQuestions: session.questions,
          answers: sameSession ? get().answers : [],
          currentQuestionIndex: sameSession ? get().currentQuestionIndex : 0,
        });
      },

      getElapsedTime: () => {
        const start = get().startTime;
        if (!start) return 0;
        return Math.floor((Date.now() - start) / 1000);
      },

      getRemainingSeconds: () => {
        const start = get().startTime;
        if (!start) return 0;

        const allowedSeconds =
          (get().durationMinutes + get().gracePeriodMinutes) * 60;
        const elapsed = Math.floor((Date.now() - start) / 1000);
        return Math.max(0, allowedSeconds - elapsed);
      },

      setSubmittedSessionId: (sessionId) => set({ submittedSessionId: sessionId }),

      resetTest: () =>
        set({
          sessionId: null,
          currentQuestionIndex: 0,
          answers: [],
          startTime: null,
          durationMinutes: 200,
          gracePeriodMinutes: 1,
          shuffledQuestions: [],
        }),
    }),
    {
      name: "test-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        startTime: state.startTime,
        durationMinutes: state.durationMinutes,
        gracePeriodMinutes: state.gracePeriodMinutes,
        shuffledQuestions: state.shuffledQuestions,
        submittedSessionId: state.submittedSessionId,
      }),
    },
  ),
);
