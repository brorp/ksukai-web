"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Flag,
  Home,
  RefreshCw,
  XCircle,
  ChevronLeft,
  Clock,
  Calendar,
  ChevronRight,
  AlertCircle,
  LayoutGrid,
  ArrowLeft,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  examApi,
  type ExamResultQuestion,
  type ExamResultResponse,
  type ExamSessionSummary,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromQuery = Number(searchParams.get("sessionId") ?? 0);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ExamSessionSummary[]>([]);
  const [result, setResult] = useState<ExamResultResponse | null>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportingQuestion, setReportingQuestion] =
    useState<ExamResultQuestion | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "user")) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  const activeSessionId = useMemo(
    () => (sessionIdFromQuery > 0 ? sessionIdFromQuery : 0),
    [sessionIdFromQuery],
  );

  useEffect(() => {
    if (!mounted || !token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const sessionRows = await examApi.sessions(token);
        setSessions(sessionRows);

        if (activeSessionId > 0) {
          const response = await examApi.result(token, activeSessionId);
          setResult(response);
        } else {
          setResult(null);
        }
      } catch (loadError) {
        toast.error("Gagal Memuat Data", {
          description:
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat hasil ujian.",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [mounted, token, activeSessionId]);

  const handleOpenReport = (question: ExamResultQuestion) => {
    setReportingQuestion(question);
    setReportText("");
    setReportOpen(true);
  };
  const handleSubmitReport = async () => {
    if (!token || !result || !reportingQuestion || !reportText.trim()) return;
    setSubmittingReport(true);

    const promise = examApi.reportQuestion(token, {
      question_id: reportingQuestion.questionId,
      session_id: result.sessionId,
      report_text: reportText.trim(),
    });

    toast.promise(promise, {
      loading: "Mengirim laporan...",
      success: (response) => {
        setReportOpen(false);
        setReportText("");
        return response.message ?? "Laporan soal berhasil dikirim.";
      },
      error: "Gagal mengirim laporan.",
      finally: () => setSubmittingReport(false),
    });
  };

  if (!mounted || !isAuthenticated || user?.role !== "user") return null;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Menyiapkan Hasil...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6 animate-in fade-in duration-500">
      {activeSessionId > 0 && result ? (
        <ResultDetail result={result} onOpenReport={handleOpenReport} />
      ) : (
        <SessionList sessions={sessions} />
      )}

      {/* Report Modal */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md rounded-4xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Flag size={20} className="text-rose-400" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Report Masalah
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
              Soal ID: {reportingQuestion?.questionId}
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">
                Isi Soal:
              </p>
              <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-3">
                "{reportingQuestion?.questionText}"
              </p>
            </div>
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Jelaskan detail masalah (typo, kunci salah, dll)..."
              className="min-h-32 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary"
            />
          </div>
          <DialogFooter className="p-6 pt-0 flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl font-bold text-xs uppercase"
              onClick={() => setReportOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-900 shadow-lg shadow-slate-200"
              onClick={() => void handleSubmitReport()}
              disabled={submittingReport || !reportText.trim()}
            >
              {submittingReport ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResultDetail({
  result,
  onOpenReport,
}: {
  result: ExamResultResponse;
  onOpenReport: (q: ExamResultQuestion) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const passed = result.score >= 60;
  const currentQuestion = result.questions[activeIdx];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      <div className="flex items-center">
        <Link
          href="/apoteker/results"
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-slate-300 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Kembali ke Daftar Hasil
        </Link>
      </div>

      {/* Top Header: Statistik Ringkas */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">
            {result.package_name || "Hasil Try Out Apoteker"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />{" "}
              {new Date(result.startedAt ?? "").toLocaleDateString("id-ID")}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {result.totalQuestions} Soal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Skor Akhir
            </p>
            <p
              className={cn(
                "text-3xl font-semibold",
                passed ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {result.score}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kiri: Detail Soal & Pembahasan */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">
                Pertanyaan Ke-{activeIdx + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-2"
                onClick={() => onOpenReport(currentQuestion)}
              >
                <Flag size={14} />{" "}
                <span className="text-xs font-bold uppercase">
                  Laporkan Soal
                </span>
              </Button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="text-slate-800 font-medium leading-relaxed">
                {currentQuestion.questionText}
              </div>

              <div className="grid gap-3">
                {(["a", "b", "c", "d", "e"] as const).map((key) => {
                  const isCorrect = currentQuestion.correctAnswer === key;
                  const isSelected = currentQuestion.selectedOption === key;

                  return (
                    <div
                      key={key}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50"
                          : isSelected
                            ? "border-rose-500 bg-rose-50"
                            : "border-slate-100 bg-white",
                      )}
                    >
                      <div
                        className={cn(
                          "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold uppercase",
                          isCorrect
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : isSelected
                              ? "bg-rose-500 border-rose-500 text-white"
                              : "border-slate-200 text-slate-400",
                        )}
                      >
                        {key}
                      </div>
                      <div
                        className={cn(
                          "pt-1.5 text-sm",
                          isCorrect
                            ? "text-emerald-900 font-semibold"
                            : isSelected
                              ? "text-rose-900 font-semibold"
                              : "text-slate-600",
                        )}
                      >
                        {currentQuestion.options[key]}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-xl border-2 border-dashed border-slate-200 p-6 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <LayoutGrid size={16} className="text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Pembahasan & Analisis
                  </h4>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {currentQuestion.explanation ||
                    "Pembahasan untuk soal ini sedang dalam proses update oleh tim ahli."}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx((prev) => prev - 1)}
                className="font-bold border-slate-300 text-slate-600"
              >
                <ChevronLeft size={16} className="mr-1" /> SEBELUMNYA
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={activeIdx === result.questions.length - 1}
                onClick={() => setActiveIdx((prev) => prev + 1)}
                className="font-bold border-slate-300 text-slate-600"
              >
                SELANJUTNYA <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4 sticky top-6">
          <Card className="border-slate-200 shadow-sm p-5 pb-1 bg-white">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Navigasi Nomor
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {result.questions.length} Soal
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-2 max-h-50 overflow-y-auto pr-2 pt-2 no-scrollbar">
              {result.questions.slice(0, 100).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveIdx(idx);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "aspect-square cursor-pointer w-full rounded-md border-2 text-xs font-bold transition-all flex items-center justify-center",
                    activeIdx === idx
                      ? "border-primary-700 bg-primary-700 text-white shadow-md scale-105 z-10"
                      : q.isCorrect
                        ? "border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-300"
                        : "border-rose-100 bg-rose-50 text-rose-600 hover:border-rose-300",
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="py-2 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-xs text-slate-500">
                  Benar: <b>{result.correctAnswers}</b>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-xs text-slate-500">
                  Salah: <b>{result.totalQuestions - result.correctAnswers}</b>
                </span>
              </div>
            </div>
          </Card>

          <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-sky-700 uppercase mb-2">
              Tips
            </h4>
            <p className="text-xs text-sky-600 leading-relaxed italic">
              "Fokuslah pada pembahasan soal yang salah. Biasanya pola soal UKAI
              sering muncul pada materi Farmakoterapi dan Manajerial."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionList({ sessions }: { sessions: ExamSessionSummary[] }) {
  if (sessions.length === 0) {
    return (
      <Card className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center bg-slate-50/50">
        <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm">
          <BarChart3 size={40} />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          Belum Ada Riwayat Ujian
        </CardTitle>
        <CardDescription className="max-w-xs mx-auto mt-3 text-slate-500 font-medium">
          Data hasil try out Anda akan muncul di sini setelah Anda menyelesaikan
          minimal satu sesi ujian.
        </CardDescription>
        <div className="mt-8">
          <Link href="/apoteker/dashboard">
            <Button className="rounded-xl h-12 px-10 font-bold text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-lg transition-all active:scale-95">
              Mulai Sesi Pertama
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Trophy size={14} /> Performance Tracking
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Riwayat Test
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Review kembali jawaban dan pelajari pembahasan di setiap sesi.
          </p>
        </div>
        <Link href="/apoteker/dashboard">
          <Button
            variant="outline"
            className="rounded-xl h-11 border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:text-primary hover:bg-sky-50 transition-all"
          >
            <RefreshCw size={14} className="mr-2" /> Latihan lagi
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => {
          const isPassed = session.score >= 60;
          const isCompleted = session.status?.toLowerCase() === "completed";

          return (
            <div
              key={session.session_id}
              className={cn(
                "group relative bg-white rounded-2xl border p-5 md:p-6 transition-all duration-200",
                isCompleted
                  ? "border-slate-200 hover:border-slate-400 hover:shadow-md"
                  : "border-slate-100 opacity-80",
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-6 items-center">
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 transition-transform",
                        !isCompleted
                          ? "bg-slate-50 border-slate-200 text-slate-400"
                          : isPassed
                            ? "bg-emerald-50 border-emerald-500/20 text-emerald-600 group-hover:scale-105"
                            : "bg-rose-50 border-rose-500/20 text-rose-600 group-hover:scale-105",
                      )}
                    >
                      <span className="text-2xl font-black leading-none">
                        {isCompleted ? session.score : "—"}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest mt-1">
                        {isCompleted ? "Score" : "N/A"}
                      </span>
                    </div>

                    {isCompleted &&
                      (isPassed ? (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-4 border-white">
                          <CheckCircle2 size={12} />
                        </div>
                      ) : (
                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 border-4 border-white">
                          <AlertCircle size={12} />
                        </div>
                      ))}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors leading-tight">
                      {session.package_name ||
                        `Simulasi Paket #${session.session_id}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Calendar size={12} className="text-slate-400" />{" "}
                        {session.start_time
                          ? new Date(session.start_time).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" },
                            )
                          : "-"}
                      </span>

                      <span
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md border",
                          isCompleted
                            ? "bg-slate-50 border-slate-100 text-slate-500"
                            : "bg-amber-50 border-amber-100 text-amber-600 animate-pulse",
                        )}
                      >
                        <Clock size={12} /> {session.status?.toUpperCase()}
                      </span>

                      <Badge
                        variant="secondary"
                        className="bg-slate-900 text-white rounded-md h-5 px-2 text-[9px]"
                      >
                        ATTEMPT {session.attempt_number}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  {isCompleted ? (
                    <Link
                      href={`/apoteker/results?sessionId=${session.session_id}`}
                      className="w-full md:w-auto"
                    >
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full md:w-auto rounded-xl h-11 px-8 font-black text-[10px] uppercase tracking-widest transition-all duration-300",
                          "bg-white border-2 border-slate-200 text-slate-600 shadow-sm",
                          "hover:border-primary hover:text-primary hover:bg-primary/5 hover:-translate-y-0.5 active:scale-95",
                          "group/btn",
                        )}
                      >
                        Review Pembahasan
                        <ChevronRight
                          size={14}
                          className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                        />
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2 w-full md:w-auto text-right">
                      <Button
                        disabled
                        className="w-full md:w-auto rounded-xl h-11 px-8 font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                      >
                        Belum Selesai
                      </Button>
                      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-tight">
                        Selesaikan ujian untuk melihat hasil
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
