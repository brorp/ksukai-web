"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi, getServerAssetUrl } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import type { OptionKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PreviewQuestion {
  id: number;
  order: number;
  questionText: string;
  imageUrl?: string | null;
  explanation?: string;
  options: Record<OptionKey, string>;
}

export default function AdminExamPreviewPage() {
  const searchParams = useSearchParams();
  const examId = Number(searchParams.get("examId") ?? 0);
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [examName, setExamName] = useState("");
  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, OptionKey | null>>({});

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadPreview = async () => {
      if (!Number.isInteger(examId) || examId <= 0) {
        setError("Pilih ujian yang valid untuk preview.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [examRows, questionRows] = await Promise.all([
          adminApi.manageExams(token),
          adminApi.questions(token, { examId }),
        ]);

        const selectedExam = examRows.find((item) => item.id === examId);
        const mappedQuestions = questionRows
          .filter((item) => item.exam_id === examId)
          .sort((left, right) => left.id - right.id)
          .map((item, index) => ({
            id: item.id,
            order: index + 1,
            questionText: item.question_text,
            imageUrl: item.image_url ?? null,
            explanation: item.explanation,
            options: {
              a: item.option_a,
              b: item.option_b,
              c: item.option_c,
              d: item.option_d,
              e: item.option_e,
            },
          }));

        setExamName(selectedExam?.name ?? `Preview Ujian #${examId}`);
        setQuestions(mappedQuestions);
        setCurrentIndex(0);
        setAnswers({});
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Preview ujian gagal dimuat.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadPreview();
  }, [examId, token]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">
            Menyiapkan preview ujian...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-3xl rounded-3xl border border-slate-200 p-10 text-center">
        <p className="text-lg font-bold text-slate-900">Preview tidak tersedia</p>
        <p className="mt-3 text-sm text-slate-500">{error}</p>
        <div className="mt-6">
          <Link href="/admin/exams">
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
              Kembali ke Kelola Ujian
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="mx-auto max-w-3xl rounded-3xl border border-slate-200 p-10 text-center">
        <p className="text-lg font-bold text-slate-900">
          Belum ada soal di ujian ini
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Tambahkan soal lebih dulu dari Bank Soal atau Kelola Soal agar preview
          bisa ditampilkan.
        </p>
        <div className="mt-6">
          <Link href="/admin/exams">
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
              Kembali ke Kelola Ujian
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Kembali ke Kelola Ujian
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Preview {examName}
            </h1>
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
              Mode Lokal
            </Badge>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Interaksi di halaman ini hanya untuk cek tampilan simulasi. Tidak
            ada data jawaban atau attempt yang disimpan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            {questions.length} soal • {answeredCount} jawaban lokal
          </div>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setAnswers({});
              setCurrentIndex(0);
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Preview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Preview Soal
              </p>
              <h2 className="text-xl font-black text-slate-900">
                Nomor {currentQuestion.order}
              </h2>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-[10px] uppercase tracking-widest"
            >
              ID {currentQuestion.id}
            </Badge>
          </div>

          <div className="space-y-6 pt-6">
            <div className="whitespace-pre-line rounded-3xl border border-slate-200 bg-slate-50 p-6 text-base leading-relaxed text-slate-800">
              {currentQuestion.questionText}
            </div>

            {currentQuestion.imageUrl ? (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3">
                <img
                  src={
                    getServerAssetUrl(currentQuestion.imageUrl) ??
                    currentQuestion.imageUrl
                  }
                  alt={`Gambar soal ${currentQuestion.order}`}
                  className="max-h-[420px] w-full rounded-2xl object-contain bg-slate-50"
                />
              </div>
            ) : null}

            <div className="grid gap-3">
              {(["a", "b", "c", "d", "e"] as const).map((option) => {
                const isSelected = answers[currentQuestion.id] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [currentQuestion.id]:
                          current[currentQuestion.id] === option ? null : option,
                      }))
                    }
                    className={cn(
                      "flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {option}
                    </div>
                    <span className="whitespace-pre-line pt-1 text-sm font-medium text-slate-700">
                      {currentQuestion.options[option]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-2xl"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((value) => value - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              className="h-11 flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((value) => value + 1)}
            >
              Selanjutnya
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold text-slate-900">Navigasi Preview</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Klik nomor untuk loncat ke soal tertentu. Warna biru menandakan
              soal aktif, hijau menandakan jawaban lokal sudah dipilih.
            </p>

            <div className="mt-5 grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const isActive = index === currentIndex;
                const isAnswered = Boolean(answers[question.id]);

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-xl border text-xs font-black transition-all",
                      isActive
                        ? "border-primary bg-primary text-white"
                        : isAnswered
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                    )}
                  >
                    {question.order}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {answeredCount} soal telah dipilih secara lokal
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Preview ini hanya untuk validasi UI admin. Tidak ada submit,
                tidak ada timer, dan tidak membuat data sesi.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
