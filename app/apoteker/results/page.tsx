"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, CheckCircle2, Home, RefreshCw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { examApi, type ExamResultResponse } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { useTestStore } from "@/lib/store/test";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromQuery = Number(searchParams.get("sessionId") ?? 0);
  const sessionIdFromStore = useTestStore((state) => state.submittedSessionId);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExamResultResponse | null>(null);

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
    if (sessionIdFromStore && sessionIdFromStore > 0) return sessionIdFromStore;
    return 0;
  }, [sessionIdFromQuery, sessionIdFromStore]);

  useEffect(() => {
    if (!mounted || !token || activeSessionId <= 0) {
      setLoading(false);
      return;
    }

    const loadResult = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await examApi.result(token, activeSessionId);
        setResult(response);
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

    void loadResult();
  }, [mounted, token, activeSessionId]);

  if (!mounted || !isAuthenticated || user?.role !== "user") return null;

  if (loading) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-4">Memuat hasil ujian...</p>
      </div>
    );
  }

  if (!result || activeSessionId <= 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hasil Belum Tersedia</CardTitle>
            <CardDescription>
              Selesaikan ujian terlebih dahulu untuk melihat skor dan pembahasan.
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
      </div>
    );
  }

  const passed = result.score >= 60;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Hasil Ujian
          </h1>
          <p className="text-slate-500">
            Session #{result.sessionId}
            {result.package_name ? ` • ${result.package_name}` : ""}
            {" • "}Status: {result.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/apoteker/dashboard">
            <Button className="bg-sky-600 hover:bg-sky-700">
              <RefreshCw size={16} className="mr-2" /> Pilih Paket Baru
            </Button>
          </Link>
          <Link href="/apoteker/dashboard">
            <Button variant="outline">
              <Home size={16} className="mr-2" /> Dashboard
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
            Menampilkan jawaban Anda, jawaban benar, dan pembahasan.
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
    </div>
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
