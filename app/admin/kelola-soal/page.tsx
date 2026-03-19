"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileUp,
  ShieldCheck,
  Plus,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  adminApi,
  type AdminQuestion,
  type AdminQuestionPayload,
  type ExamPackage,
  getServerAssetUrl,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import type { OptionKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const createDefaultQuestionDraft = (examId = 0): AdminQuestionPayload => ({
  exam_id: examId,
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  option_e: "",
  correct_answer: "a",
  explanation: "",
  is_active: false,
});

export default function AdminKelolaSoalPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [questionDraft, setQuestionDraft] = useState<AdminQuestionPayload>(
    createDefaultQuestionDraft(),
  );
  const [batchInput, setBatchInput] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileInputKey, setImportFileInputKey] = useState(0);
  const [importAsActive, setImportAsActive] = useState(false);
  const [importExamId, setImportExamId] = useState(0);
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const examOptions = useMemo(
    () =>
      packages.flatMap((pkg) =>
        (pkg.exams ?? []).map((exam) => ({
          ...exam,
          package_name: pkg.name,
        })),
      ),
    [packages],
  );

  const questionImagePreviewUrl = useMemo(
    () => (questionImageFile ? URL.createObjectURL(questionImageFile) : null),
    [questionImageFile],
  );

  useEffect(() => {
    return () => {
      if (questionImagePreviewUrl) {
        URL.revokeObjectURL(questionImagePreviewUrl);
      }
    };
  }, [questionImagePreviewUrl]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [questionRows, packageRows] = await Promise.all([
        adminApi.questions(token),
        adminApi.packages(),
      ]);
      setQuestions(questionRows);
      setPackages(packageRows);
      const firstExamId =
        packageRows.flatMap((pkg) => pkg.exams ?? [])[0]?.id ?? 0;
      setQuestionDraft((prev) =>
        prev.exam_id > 0
          ? prev
          : createDefaultQuestionDraft(firstExamId),
      );
      setImportExamId((prev) => prev || firstExamId);
    } catch (err) {
      toast.error("Gagal Memuat Data", {
        description:
          err instanceof Error ? err.message : "Terjadi kesalahan koneksi.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQuestionDraft(createDefaultQuestionDraft(examOptions[0]?.id ?? 0));
    setQuestionImageFile(null);
    setCurrentImageUrl(null);
    setRemoveCurrentImage(false);
  };

  const handleEditQuestion = (questionId: number) => {
    const selected = questions.find((item) => item.id === questionId);
    if (!selected) return;

    setEditingQuestionId(selected.id);
    setQuestionDraft({
      exam_id: selected.exam_id ?? examOptions[0]?.id ?? 0,
      question_text: selected.question_text,
      option_a: selected.option_a,
      option_b: selected.option_b,
      option_c: selected.option_c,
      option_d: selected.option_d,
      option_e: selected.option_e,
      correct_answer: selected.correct_answer,
      explanation: selected.explanation,
      is_active: selected.is_active,
    });
    setQuestionImageFile(null);
    setCurrentImageUrl(selected.image_url ?? null);
    setRemoveCurrentImage(false);
    toast.info("Mode Edit Aktif", {
      description: `Mengedit soal #${selected.id}`,
    });
  };

  const handleSaveQuestion = async () => {
    if (!token) return;

    if (
      !Number.isInteger(questionDraft.exam_id) ||
      questionDraft.exam_id <= 0
    ) {
      toast.warning("Ujian tujuan wajib dipilih.");
      return;
    }

    setActionLoading(true);
    try {
      if (editingQuestionId) {
        await adminApi.updateQuestion(token, editingQuestionId, {
          ...questionDraft,
          imageFile: questionImageFile,
          remove_image: removeCurrentImage,
        });
        toast.success("Berhasil", { description: "Soal berhasil diperbarui." });
      } else {
        await adminApi.createQuestion(token, {
          ...questionDraft,
          imageFile: questionImageFile,
        });
        toast.success("Berhasil", {
          description: "Soal baru telah ditambahkan.",
        });
      }
      resetQuestionForm();
      await loadData();
    } catch (err) {
      toast.error("Gagal menyimpan soal", {
        description: err instanceof Error ? err.message : "Silakan coba lagi.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportQuestions = async () => {
    if (!token || !importFile) return;
    if (!Number.isInteger(importExamId) || importExamId <= 0) {
      toast.warning("Pilih ujian tujuan untuk hasil import.");
      return;
    }

    setActionLoading(true);
    const promise = adminApi.importQuestions(token, importFile, {
      examId: importExamId,
      isActive: importAsActive,
    });

    toast.promise(promise, {
      loading: "Sedang mengimpor file .docx...",
      success: (result) => {
        setImportFile(null);
        setImportFileInputKey((prev) => prev + 1);
        loadData();
        const selectedExam = examOptions.find((exam) => exam.id === importExamId);
        return `${result.imported_count ?? 0} soal berhasil diimpor ke ${selectedExam?.package_name ?? "paket"} • ${selectedExam?.name ?? "ujian"}.`;
      },
      error: "Gagal import soal. Periksa kembali format template.",
      finally: () => setActionLoading(false),
    });
  };

  const handleSelectBatch = async () => {
    if (!token) return;
    const ids = batchInput
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item) && item > 0);

    if (ids.length === 0) {
      toast.warning("Input tidak valid", {
        description: "Masukkan daftar ID soal dipisahkan koma.",
      });
      return;
    }

    setActionLoading(true);
    const promise = adminApi.selectBatch(token, ids);

    toast.promise(promise, {
      loading: "Memperbarui batch soal aktif...",
      success: () => {
        setBatchInput("");
        loadData();
        return "Batch soal aktif berhasil diperbarui.";
      },
      error: "Gagal memilih batch soal.",
      finally: () => setActionLoading(false),
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <AdminPageHeader
        title="Bank & Kelola Soal"
        description="Pusat kendali bank soal: edit manual, import massal, dan aktivasi batch."
        icon={<ShieldCheck className="text-primary-600" size={24} />}
        actionLabel="Refresh Data"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Kolom Kiri & Tengah: Form Editor */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader
              className={cn(
                "border-b transition-colors",
                editingQuestionId ? "bg-amber-50/50" : "bg-slate-50/50",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      editingQuestionId
                        ? "bg-amber-100 text-amber-600"
                        : "bg-primary-100 text-primary-600",
                    )}
                  >
                    {editingQuestionId ? (
                      <Pencil size={20} />
                    ) : (
                      <Plus size={20} />
                    )}
                  </div>
                  <div>
                    <CardTitle>
                      {editingQuestionId
                        ? `Edit Soal #${editingQuestionId}`
                        : "Buat Soal Baru"}
                    </CardTitle>
                    <CardDescription>
                      Isi detail pertanyaan dan pilihan jawaban secara manual.
                    </CardDescription>
                  </div>
                </div>
                {editingQuestionId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetQuestionForm}
                    className="text-amber-700 hover:bg-amber-100"
                  >
                    <RotateCcw size={14} className="mr-2" /> Batal Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Ujian Tujuan
                  </label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    value={questionDraft.exam_id}
                    onChange={(e) =>
                      setQuestionDraft((prev) => ({
                        ...prev,
                        exam_id: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={0}>Pilih ujian...</option>
                    {examOptions.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.package_name} • {exam.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Pilih Cepat (Edit)
                  </label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    value={editingQuestionId ?? ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      val ? handleEditQuestion(val) : resetQuestionForm();
                    }}
                  >
                    <option value="">-- Cari ID Soal untuk Diedit --</option>
                    {questions.slice(0, 50).map((q) => (
                      <option key={q.id} value={q.id}>
                        #{q.id} - {q.question_text.slice(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                  Pertanyaan
                </label>
                <TextareaCustom
                  placeholder="Tuliskan teks pertanyaan di sini..."
                  value={questionDraft.question_text}
                  onChange={(val) =>
                    setQuestionDraft((prev) => ({
                      ...prev,
                      question_text: val,
                    }))
                  }
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Gambar Soal
                    </p>
                    <p className="text-xs text-slate-500">
                      Khusus input manual, Anda bisa menambahkan satu gambar pendukung.
                    </p>
                  </div>
                  {(currentImageUrl || questionImageFile) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuestionImageFile(null);
                        setCurrentImageUrl(null);
                        setRemoveCurrentImage(true);
                      }}
                    >
                      Hapus Gambar
                    </Button>
                  )}
                </div>

                <Input
                  type="file"
                  accept="image/*"
                  className="rounded-xl h-auto py-2 bg-white"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setQuestionImageFile(file);
                    if (file) {
                      setRemoveCurrentImage(false);
                    }
                  }}
                />

                {(questionImageFile || currentImageUrl) && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                    <img
                        src={
                        questionImagePreviewUrl ??
                        getServerAssetUrl(currentImageUrl) ??
                        currentImageUrl ??
                        ""
                      }
                      alt="Preview gambar soal"
                      className="max-h-[320px] w-full rounded-xl object-contain bg-slate-50"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["a", "b", "c", "d", "e"] as const).map((key) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Opsi {key.toUpperCase()}
                      </label>
                      {questionDraft.correct_answer === key && (
                        <Badge
                          variant="outline"
                          className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200"
                        >
                          Kunci Jawaban
                        </Badge>
                      )}
                    </div>
                    <Input
                      className="rounded-xl h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                      placeholder={`Isi pilihan ${key.toUpperCase()}`}
                      value={
                        questionDraft[
                          `option_${key}` as keyof AdminQuestionPayload
                        ] as string
                      }
                      onChange={(e) =>
                        setQuestionDraft((prev) => ({
                          ...prev,
                          [`option_${key}`]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Kunci Jawaban & Status
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-primary-600 outline-none focus:ring-2 focus:ring-primary-500"
                      value={questionDraft.correct_answer}
                      onChange={(e) =>
                        setQuestionDraft((prev) => ({
                          ...prev,
                          correct_answer: e.target.value as OptionKey,
                        }))
                      }
                    >
                      {(["a", "b", "c", "d", "e"] as const).map((item) => (
                        <option key={item} value={item}>
                          KUNCI: {item.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="h-11 flex items-center gap-3 px-4 rounded-xl border border-slate-200 bg-white">
                      <Switch
                        checked={questionDraft.is_active}
                        onCheckedChange={(checked) =>
                          setQuestionDraft((prev) => ({
                            ...prev,
                            is_active: checked,
                          }))
                        }
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {questionDraft.is_active ? "Aktif" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Pembahasan (Eksplanasi)
                  </label>
                  <Input
                    className="h-11 rounded-xl border-slate-200"
                    placeholder="Kenapa jawaban tersebut benar?"
                    value={questionDraft.explanation}
                    onChange={(e) =>
                      setQuestionDraft((prev) => ({
                        ...prev,
                        explanation: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() => void handleSaveQuestion()}
                disabled={actionLoading}
                className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-100 font-bold"
              >
                {actionLoading ? (
                  "Memproses..."
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {editingQuestionId
                      ? "Update Data Soal"
                      : "Simpan ke Bank Soal"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Import & Batch */}
        <div className="space-y-8">
          <Card className="border-slate-200 shadow-sm overflow-hidden m-0 p-0">
            <CardHeader className="bg-primary-900 text-white">
              <div className="flex items-center gap-3 pt-3">
                <FileUp size={20} className="text-primary-400" />
                <div>
                  <CardTitle className="text-lg">Import Massal</CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload template .docx
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 text-[12px] leading-relaxed text-primary-900">
                <strong>💡 Info Template:</strong> Kolom Soal berisi teks + 5
                opsi. Baris Jawaban harus format <br />
                Jawaban: E.
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Target Ujian
                </label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none"
                  value={importExamId}
                  onChange={(e) => setImportExamId(Number(e.target.value))}
                >
                  <option value={0}>Pilih ujian import...</option>
                  {examOptions.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.package_name} • {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Pilih File .docx
                </label>
                <Input
                  key={importFileInputKey}
                  type="file"
                  className="rounded-lg h-auto py-2"
                  accept=".docx"
                  disabled={importExamId <= 0}
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer transition-all hover:bg-white">
                <Checkbox
                  checked={importAsActive}
                  onCheckedChange={(v) => setImportAsActive(Boolean(v))}
                />
                <span className="text-xs font-semibold text-slate-700">
                  Otomatis Aktifkan Hasil Import
                </span>
              </label>

              <Button
                variant="outline"
                className="w-full h-11 rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 font-bold"
                onClick={() => void handleImportQuestions()}
                disabled={!importFile || actionLoading || importExamId <= 0}
              >
                {actionLoading ? "Processing..." : "Jalankan Import"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center gap-3">
                <ListChecks size={20} className="text-emerald-600" />
                <div>
                  <CardTitle className="text-lg">Aktivasi Batch</CardTitle>
                  <CardDescription className="text-slate-500">
                    Pilih ID soal yang ingin diaktifkan.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Daftar ID (Koma)
                </label>
                <Input
                  placeholder="Contoh: 1, 2, 15, 20-50"
                  className="rounded-xl h-11"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                />
              </div>
              <Button
                onClick={() => void handleSelectBatch()}
                disabled={actionLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold"
              >
                Setel Sebagai Batch Aktif
              </Button>
              <p className="text-[11px] text-slate-400 text-center leading-tight">
                Hanya soal-soal di dalam batch ini yang akan muncul pada paket
                ujian user.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TextareaCustom({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-y"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
