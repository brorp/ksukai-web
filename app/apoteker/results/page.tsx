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
import {
  examApi,
  type ExamResultQuestion,
  type ExamResultResponse,
  type ExamSessionSummary,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromQuery = Number(searchParams.get("sessionId") ?? 0);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState<ExamSessionSummary[]>([]);
  const [result, setResult] = useState<ExamResultResponse | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportingQuestion, setReportingQuestion] = useState<ExamResultQuestion | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "user")) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  const activeSessionId = useMemo(() => {
    if (sessionIdFromQuery > 0) return sessionIdFromQuery;
    return 0;
  }, [sessionIdFromQuery]);

  useEffect(() => {
    if (!mounted || !token) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");
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
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat hasil ujian.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [mounted, token, activeSessionId]);

  const handleOpenReport = (question: ExamResultQuestion) => {
    setReportingQuestion(question);
    setReportText("");
    setMessage("");
    setReportOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!token || !result || !reportingQuestion || !reportText.trim()) {
      return;
    }

    setSubmittingReport(true);
    setError("");
    try {
      const response = await examApi.reportQuestion(token, {
        question_id: reportingQuestion.questionId,
        session_id: result.sessionId,
        report_text: reportText.trim(),
      });
      setMessage(response.message ?? "Report soal berhasil dikirim.");
      setReportOpen(false);
      setReportText("");
      setReportingQuestion(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal mengirim report soal.",
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  if (!mounted || !isAuthenticated || user?.role !== "user") return null;

  if (loading) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-4">Memuat hasil ujian...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}

      {activeSessionId > 0 && result ? (
        <ResultDetail
          result={result}
          onOpenReport={handleOpenReport}
        />
      ) : (
        <SessionList sessions={sessions} />
      )}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Soal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Jelaskan masalah pada soal ini agar admin bisa meninjau dengan tepat.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {reportingQuestion?.questionText ?? "-"}
            </div>
            <Textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              placeholder="Contoh: opsi jawaban tidak sesuai, pembahasan kurang tepat, atau ada typo penting."
              className="min-h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => void handleSubmitReport()}
              disabled={submittingReport || !reportText.trim()}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {submittingReport ? "Mengirim..." : "Kirim Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionList({ sessions }: { sessions: ExamSessionSummary[] }) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Belum Ada Riwayat Ujian</CardTitle>
          <CardDescription>
            Selesaikan ujian terlebih dahulu untuk melihat histori per sesi.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href="/apoteker/dashboard">
            <Button className="bg-sky-600 hover:bg-sky-700">
              <RefreshCw size={16} className="mr-2" /> Pilih Paket Ujian
            </Button>
          </Link>
          <Link href="/apoteker/dashboard">
            <Button variant="outline">
              <Home size={16} className="mr-2" /> Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Hasil Ujian
          </h1>
          <p className="text-slate-500">
            Riwayat hasil ujian Anda tersimpan per sesi/attempt.
          </p>
        </div>
        <Link href="/apoteker/dashboard">
          <Button className="bg-sky-600 hover:bg-sky-700">
            <RefreshCw size={16} className="mr-2" /> Ujian Baru
          </Button>
        </Link>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Daftar Sesi Ujian</CardTitle>
          <CardDescription>
            Klik salah satu sesi untuk melihat detail hasil dan pembahasan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.session_id} className="border border-slate-200">
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Sesi #{session.session_id}
                    {session.package_name ? ` • ${session.package_name}` : ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    Attempt #{session.attempt_number} • Status: {session.status}
                  </p>
                  <p className="text-xs text-slate-400">
                    Mulai:{" "}
                    {session.start_time
                      ? new Date(session.start_time).toLocaleString("id-ID")
                      : "-"}
                    {" • "}
                    Submit:{" "}
                    {session.end_time
                      ? new Date(session.end_time).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Skor</p>
                    <p className="text-2xl font-bold text-slate-900">{session.score}</p>
                  </div>
                  <Link href={`/apoteker/results?sessionId=${session.session_id}`}>
                    <Button variant="outline">Lihat Detail</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultDetail({
  result,
  onOpenReport,
}: {
  result: ExamResultResponse;
  onOpenReport: (question: ExamResultQuestion) => void;
}) {
  const passed = result.score >= 60;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Detail Hasil Ujian
          </h1>
          <p className="text-slate-500">
            Session #{result.sessionId}
            {result.package_name ? ` • ${result.package_name}` : ""}
            {" • "}Attempt #{result.attempt_number ?? 1}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/apoteker/results">
            <Button variant="outline">Kembali ke Daftar Sesi</Button>
          </Link>
          <Link href="/apoteker/dashboard">
            <Button className="bg-sky-600 hover:bg-sky-700">
              <RefreshCw size={16} className="mr-2" /> Ujian Baru
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-none shadow-xl overflow-hidden bg-white">
          <div
            className={cn(
              "h-2 w-full",
              passed ? "bg-emerald-500" : "bg-rose-500",
            )}
          />
          <CardHeader>
            <CardTitle>Ringkasan Skor</CardTitle>
            <CardDescription>
              Hasil dihitung dari mapping opsi acak pada sesi ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                Skor Akhir
              </span>
              <div
                className={cn(
                  "text-8xl font-semibold tracking-tighter",
                  passed ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {result.score}
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {passed ? "Lulus" : "Belum Lulus"} • Target minimum 60
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<CheckCircle2 className="text-emerald-600" />}
                label="Jawaban Benar"
                value={String(result.correctAnswers)}
              />
              <StatCard
                icon={<XCircle className="text-rose-600" />}
                label="Jawaban Salah"
                value={String(result.totalQuestions - result.correctAnswers)}
              />
              <StatCard
                icon={<BarChart3 className="text-sky-600" />}
                label="Total Soal"
                value={String(result.totalQuestions)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-lg bg-sky-600 text-white">
          <CardHeader>
            <CardTitle>Analisis Cepat</CardTitle>
            <CardDescription className="text-sky-100">
              Pembahasan soal tersedia setelah sesi selesai.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-sky-50">
              {passed
                ? "Performa Anda sudah melampaui ambang batas. Lanjutkan latihan untuk menjaga konsistensi."
                : "Tinjau kembali pembahasan tiap soal untuk memperbaiki area yang belum optimal."}
            </p>
            <p className="text-xs text-sky-100">
              Mulai: {result.startedAt ? new Date(result.startedAt).toLocaleString("id-ID") : "-"}
            </p>
            <p className="text-xs text-sky-100">
              Submit: {result.submittedAt ? new Date(result.submittedAt).toLocaleString("id-ID") : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Review Soal</CardTitle>
          <CardDescription>
            Menampilkan jawaban Anda, jawaban benar, pembahasan, dan tombol report soal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.questions.length === 0 ? (
            <p className="text-sm text-slate-500">Detail soal tidak tersedia.</p>
          ) : (
            result.questions.map((question, index) => (
              <div
                key={`${question.questionId}-${index}`}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {index + 1}. {question.questionText}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                        question.isCorrect
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700",
                      )}
                    >
                      {question.isCorrect ? "Benar" : "Salah"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenReport(question)}
                    >
                      <Flag size={14} className="mr-2" />
                      Report Soal
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {(["a", "b", "c", "d", "e"] as const).map((key) => {
                    const isSelected = question.selectedOption === key;
                    const isCorrect = question.correctAnswer === key;

                    return (
                      <div
                        key={key}
                        className={cn(
                          "rounded-md border px-3 py-2",
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50"
                            : isSelected
                              ? "border-rose-200 bg-rose-50"
                              : "border-slate-200 bg-slate-50",
                        )}
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {key}
                        </p>
                        <p className="text-slate-700">{question.options[key]}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 rounded-md p-3">
                  <span className="font-semibold">Pembahasan: </span>
                  {question.explanation || "Tidak tersedia."}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">{icon}</div>
      <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
