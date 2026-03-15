"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calculator, ChevronLeft, Clock, LayoutGrid, X } from "lucide-react";

import TestQuestion from "@/components/apoteker/test-question";
import LabValuesModal from "@/components/apoteker/lab-values-modal";
import TestTimer from "@/components/apoteker/test-timer";
import QuestionNumberGrid from "@/components/apoteker/question-number-grid";
import ScientificCalculator from "@/components/apoteker/simple-calculator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { examApi } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { useTestStore } from "@/lib/store/test";
import type { OptionKey, Question, QuestionFlagStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function TestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const packageId = Number(searchParams.get("packageId") ?? 0);

  const [mounted, setMounted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [error, setError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [packageName, setPackageName] = useState("");

  const {
    sessionId,
    shuffledQuestions,
    currentQuestionIndex,
    setCurrentQuestion,
    getAnswersArray,
    initializeSession,
    getRemainingSeconds,
    resetTest,
    setSubmittedSessionId,
  } = useTestStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "user")) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !token || !isAuthenticated || user?.role !== "user") {
      return;
    }

    const loadSession = async () => {
      setIsLoadingSession(true);
      setError("");

      if (!Number.isInteger(packageId) || packageId <= 0) {
        setError("Pilih paket ujian dari dashboard terlebih dahulu.");
        setIsLoadingSession(false);
        return;
      }

      try {
        const response = await examApi.start(token, packageId);
        const questions: Question[] = response.questions
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            id: item.questionId,
            order: item.order,
            question: item.questionText,
            options: item.options,
          }));

        setPackageName(response.packageName);
        initializeSession({
          sessionId: response.sessionId,
          startTime: response.startTime,
          durationMinutes: response.durationMinutes,
          gracePeriodMinutes: response.gracePeriodMinutes,
          questions,
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memulai sesi ujian.",
        );
      } finally {
        setIsLoadingSession(false);
      }
    };

    void loadSession();
  }, [
    mounted,
    token,
    isAuthenticated,
    user?.role,
    packageId,
    initializeSession,
  ]);

  const handleSubmitTest = useCallback(async () => {
    if (!token || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const submitResult = await examApi.submit(token);
      const resolvedSessionId = Number(
        submitResult.sessionId ?? sessionId ?? 0,
      );
      if (resolvedSessionId > 0) {
        setSubmittedSessionId(resolvedSessionId);
      }
      resetTest();
      router.push(`/apoteker/results?sessionId=${resolvedSessionId}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal submit jawaban.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    token,
    isSubmitting,
    sessionId,
    setSubmittedSessionId,
    resetTest,
    router,
  ]);

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      if (getRemainingSeconds() <= 0) {
        void handleSubmitTest();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, getRemainingSeconds, handleSubmitTest]);

  const persistAnswer = async (
    questionId: number,
    option: OptionKey | null,
    status: QuestionFlagStatus,
  ) => {
    if (!token) return;

    setSyncError("");
    try {
      await examApi.answer(token, {
        question_id: questionId,
        mapped_selected_option: option,
        flag_status: status,
      });
    } catch {
      setSyncError(
        "Jawaban tersimpan lokal, sinkronisasi ke server akan diulang saat submit.",
      );
    }
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const answersArray = getAnswersArray();
  const answeredCount = answersArray.filter(
    (a) => a.status === "answered",
  ).length;
  const doubtfulCount = answersArray.filter(
    (a) => a.status === "doubtful",
  ).length;
  const emptyCount = Math.max(
    shuffledQuestions.length - answersArray.length,
    0,
  );

  const summary = useMemo(
    () => ({
      answered: answeredCount,
      doubtful: doubtfulCount,
      empty: emptyCount,
    }),
    [answeredCount, doubtfulCount, emptyCount],
  );

  if (!mounted || isLoadingSession) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-4">Menyiapkan sesi ujian...</p>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Sesi Ujian Gagal Dimuat
          </h2>
          <p className="text-slate-600">{error}</p>
          <Button onClick={() => router.push("/apoteker/dashboard")}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-slate-900">
      <header className="h-20 bg-white border-b px-6 flex items-center justify-between z-30 shrink-0">
        <div className="w-1/4 flex items-center justify-start overflow-hidden">
          <Button
            variant="ghost"
            onClick={() => setShowExitDialog(true)}
            className="text-slate-500 hover:text-rose-600 font-bold gap-2"
          >
            <ChevronLeft size={20} />
            <span className="hidden md:inline">Keluar</span>
          </Button>
        </div>

        <div className="w-1/2 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
              Sesi #{sessionId}
            </p>
            <p className="text-xs font-medium text-sky-700">
              {packageName || "Paket Ujian"}
            </p>
            <p className="text-xs text-slate-500">
              Jawab: {summary.answered} • Ragu: {summary.doubtful} • Kosong:{" "}
              {summary.empty}
            </p>
          </div>
        </div>

        <div className="w-1/4 flex items-center justify-end gap-3">
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-100 px-5 py-2 rounded-2xl shadow-sm">
            <Clock className="h-5 w-5 text-sky-600 animate-pulse" />
            <div className="font-semibold text-lg tabular-nums text-sky-700 min-w-20 text-center">
              <TestTimer />
            </div>
          </div>
          <LabValuesModal />
          <Button
            variant="outline"
            onClick={() => setShowCalculator(!showCalculator)}
            className={cn(
              "h-10 gap-2 border-slate-200 font-semibold",
              showCalculator && "bg-sky-600 text-white border-sky-600",
            )}
          >
            <Calculator size={18} />
            <span className="hidden xl:inline">Kalkulator</span>
          </Button>
          <Button
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 px-6 rounded-xl shadow-lg shadow-emerald-100 shrink-0"
          >
            {isSubmitting ? "Mengirim..." : "Selesai"}
          </Button>
        </div>
      </header>

      {(syncError || error) && (
        <div className="px-6 py-2 border-b bg-amber-50 text-amber-700 text-xs font-medium">
          {syncError || error}
        </div>
      )}

      <div className="bg-slate-50 border-b px-6 py-3 flex items-center gap-4 z-20 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid size={14} /> Navigasi
        </span>
        <QuestionNumberGrid
          totalQuestions={shuffledQuestions.length}
          currentQuestionIndex={currentQuestionIndex}
          onSelectQuestion={(idx) => setCurrentQuestion(idx)}
        />
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] px-2 py-2 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <TestQuestion
                question={currentQuestion}
                onPersistAnswer={persistAnswer}
                onNext={() => {
                  if (currentQuestionIndex === shuffledQuestions.length - 1) {
                    setShowSubmitDialog(true);
                    return;
                  }
                  setCurrentQuestion(currentQuestionIndex + 1);
                }}
                onPrevious={() => setCurrentQuestion(currentQuestionIndex - 1)}
                isFirstQuestion={currentQuestionIndex === 0}
                isLastQuestion={
                  currentQuestionIndex === shuffledQuestions.length - 1
                }
                questionNumber={currentQuestionIndex + 1}
              />
            </div>

            <div className="h-10" />
          </div>
        </main>

        {showCalculator && (
          <div className="absolute top-6 right-6 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
            <div className="relative bg-white rounded-4xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-200/60 overflow-hidden w-[320px]">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-2">
                    Calculator
                  </span>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  onClick={() => setShowCalculator(false)}
                >
                  <X size={16} strokeWidth={3} />
                </Button>
              </div>

              <div className="p-1 bg-white">
                <ScientificCalculator />
              </div>

              <div className="h-4 bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-1 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-white max-w-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">
              Selesaikan Ujian?
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Dijawab
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {summary.answered}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    Ragu
                  </p>
                  <p className="text-2xl font-bold text-amber-700">
                    {summary.doubtful}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                    Kosong
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    {summary.empty}
                  </p>
                </div>
              </div>

              {summary.empty > 0 && (
                <p className="mt-4 text-sm text-red-500 text-center font-medium bg-red-50 py-2 rounded-lg">
                  ⚠️ Masih ada {summary.empty} soal yang belum diisi!
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex gap-2 sm:gap-0">
            <AlertDialogCancel className="flex-1 mr-2 border-2 font-bold hover:bg-slate-50">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleSubmitTest()}
              className="flex-1 bg-emerald-600 ml-2 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200"
            >
              Ya, Kirim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Keluar halaman tidak akan menghapus sesi. Anda dapat lanjut dari
              menu ujian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/apoteker/dashboard")}
              className="bg-rose-600 text-white"
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
