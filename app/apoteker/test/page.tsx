"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calculator,
  ChevronLeft,
  Clock,
  LayoutGrid,
  ShieldAlert,
  X,
} from "lucide-react";

import TestQuestion from "@/components/apoteker/test-question";
import LabValuesModal from "@/components/apoteker/lab-values-modal";
import TestTimer from "@/components/apoteker/test-timer";
import QuestionNumberGrid from "@/components/apoteker/question-number-grid";
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
import { examApi, getServerAssetUrl } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { useTestStore } from "@/lib/store/test";
import type { OptionKey, Question, QuestionFlagStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import ScientificCalculator from "@/components/apoteker/scientific-calculator";
import KSUKAICalculator from "@/components/apoteker/scientific-calculator";

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-4">Menyiapkan sesi ujian...</p>
        </div>
      }
    >
      <TestContent />
    </Suspense>
  );
}

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const examId = Number(searchParams.get("examId") ?? 0);

  const [mounted, setMounted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [error, setError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [packageName, setPackageName] = useState("");
  const [examName, setExamName] = useState("");

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

      if (!Number.isInteger(examId) || examId <= 0) {
        setError("Pilih ujian dari dashboard terlebih dahulu.");
        setIsLoadingSession(false);
        return;
      }

      try {
        const response = await examApi.start(token, examId);
        const questions: Question[] = response.questions
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            id: item.questionId,
            order: item.order,
            question: item.questionText,
            imageUrl: getServerAssetUrl(item.imageUrl ?? null),
            options: item.options,
          }));

        setPackageName(response.packageName);
        setExamName(response.examName);
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
    examId,
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

  const emptyCount = useMemo(() => {
    return shuffledQuestions.length - (answeredCount + doubtfulCount);
  }, [shuffledQuestions.length, answeredCount, doubtfulCount]);

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
        <div className="h-10 w-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
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
      <header className="h-20 bg-white border-b px-6 flex items-center justify-between z-30 shrink-0 sticky top-0">
        {/* KIRI: Tetap kompak */}
        <div className="flex items-center gap-4 min-w-45">
          <Button
            variant="ghost"
            onClick={() => setShowExitDialog(true)}
            className="text-slate-500 hover:text-rose-600 font-bold gap-2 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
            <span className="hidden lg:inline">Keluar</span>
          </Button>
          <div className="hidden sm:block border-l pl-4 border-slate-100">
            <div className="flex-1 flex flex-col items-center px-4 overflow-hidden">
              {/* Judul Paket */}
              <h2 className="text-sm font-bold text-slate-800 truncate w-full text-center mb-1">
                {examName || "Ujian"}
              </h2>
              <p className="text-[11px] text-slate-400 text-center truncate w-full mb-1">
                {packageName || "Paket Ujian"}
              </p>

              <div className="flex items-center gap-3 bg-slate-50/50 px-3 py-1 rounded-full border border-slate-100">
                <div
                  className="flex items-center gap-1.5"
                  title="Sudah Dijawab"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                  <span className="text-[10px] font-bold text-slate-600">
                    {summary.answered}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" title="Ragu-Ragu">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                  <span className="text-[10px] font-bold text-slate-600">
                    {summary.doubtful}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" title="Belum Diisi">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.4)]" />
                  <span className="text-[10px] font-bold text-slate-600">
                    {summary.empty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 md:gap-3 min-w-87.5">
          {/* Timer dibuat lebih ramping */}
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-xl">
            <Clock className="h-4 w-4 text-primary-600" />
            <div className="font-bold text-sm tabular-nums text-primary-700">
              <TestTimer />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 rounded-xl shadow-lg shadow-emerald-100"
            >
              Selesai
            </Button>
          </div>
        </div>
      </header>

      {(syncError || error) && (
        <div className="px-6 py-2 border-b bg-amber-50 text-amber-700 text-xs font-medium">
          {syncError || error}
        </div>
      )}

      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] px-2 py-6 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Question) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
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
              
              {/* Right Column (Sidebar) */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-5">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <LayoutGrid size={14} /> Navigasi Nomor
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {shuffledQuestions.length} Soal
                    </span>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    <QuestionNumberGrid
                      totalQuestions={shuffledQuestions.length}
                      currentQuestionIndex={currentQuestionIndex}
                      onSelectQuestion={(idx) => setCurrentQuestion(idx)}
                    />
                  </div>
                </div>

                <div className="grid grid-flow-col auto-cols-auto gap-3">
                  <LabValuesModal />
                  <Button
                    variant="outline"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className={cn(
                      "h-10 font-bold rounded-xl transition-all w-full flex-1",
                      showCalculator
                        ? "bg-primary text-white border-primary"
                        : "text-slate-600 bg-white hover:bg-slate-50 border-slate-200 shadow-sm",
                    )}
                  >
                    <Calculator size={18} className="mr-2" />
                    Kalkulator
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {showCalculator && (
          <KSUKAICalculator
            showCalculator={showCalculator}
            setShowCalculator={setShowCalculator}
          />
        )}
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-white max-w-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">
              Selesaikan Ujian?
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-4">
              <div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                      Dijawab
                    </p>
                    <p className="text-2xl font-bold text-primary-700">
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
              </div>
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
        <AlertDialogContent className="bg-white rounded-4xl border-none shadow-2xl p-8 max-w-100">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon Warning yang Mencolok */}
            <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 animate-pulse">
              <ShieldAlert size={32} />
            </div>

            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                Peringatan Penting!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                Sesi ujian yang sedang berjalan{" "}
                <span className="text-rose-600 font-bold italic underline">
                  mungkin tidak dapat dilanjutkan
                </span>{" "}
                jika Anda meninggalkan halaman ini sekarang.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Status Sesi:
              </p>
              <p className="text-xs font-bold text-slate-600 italic">
                "Progress jawaban Anda tersimpan, namun akses masuk kembali
                bergantung pada kebijakan paket ujian."
              </p>
            </div>

            <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 w-full pt-4">
              <AlertDialogCancel className="flex-1 rounded-xl h-12 font-bold text-slate-400 border-none hover:text-slate-700 hover:bg-slate-50 transition-all">
                Lanjutkan Ujian
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push("/apoteker/dashboard")}
                className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                Tetap Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
