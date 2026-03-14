"use client";

import { useEffect, useState } from "react";
import { FileUp, ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  adminApi,
  type AdminQuestion,
  type AdminQuestionPayload,
  type ExamPackage,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import type { OptionKey } from "@/lib/types";

const createDefaultQuestionDraft = (packageId = 0): AdminQuestionPayload => ({
  package_id: packageId,
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [questionDraft, setQuestionDraft] =
    useState<AdminQuestionPayload>(createDefaultQuestionDraft());
  const [batchInput, setBatchInput] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileInputKey, setImportFileInputKey] = useState(0);
  const [importAsActive, setImportAsActive] = useState(false);
  const [importPackageId, setImportPackageId] = useState(0);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [questionRows, packageRows] = await Promise.all([
        adminApi.questions(token),
        adminApi.packages(),
      ]);
      setQuestions(questionRows);
      setPackages(packageRows);
      setQuestionDraft((prev) =>
        prev.package_id > 0
          ? prev
          : createDefaultQuestionDraft(packageRows[0]?.id ?? 0),
      );
      setImportPackageId((prev) => prev || packageRows[0]?.id || 0);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data soal.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQuestionDraft(createDefaultQuestionDraft(packages[0]?.id ?? 0));
  };

  const handleEditQuestion = (questionId: number) => {
    const selected = questions.find((item) => item.id === questionId);
    if (!selected) return;

    setEditingQuestionId(selected.id);
    setQuestionDraft({
      package_id: selected.package_id ?? packages[0]?.id ?? 0,
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
  };

  const handleSaveQuestion = async () => {
    if (!token) return;

    if (!Number.isInteger(questionDraft.package_id) || questionDraft.package_id <= 0) {
      setError("Kategori soal wajib dipilih.");
      return;
    }

    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      if (editingQuestionId) {
        await adminApi.updateQuestion(token, editingQuestionId, questionDraft);
        setMessage("Soal berhasil diperbarui.");
      } else {
        await adminApi.createQuestion(token, questionDraft);
        setMessage("Soal berhasil ditambahkan.");
      }

      resetQuestionForm();
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal menyimpan soal.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportQuestions = async () => {
    if (!token || !importFile) return;
    if (!Number.isInteger(importPackageId) || importPackageId <= 0) {
      setError("Pilih kategori package untuk hasil import.");
      return;
    }
    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await adminApi.importQuestions(token, importFile, {
        packageId: importPackageId,
        isActive: importAsActive,
      });
      const importedCountText =
        typeof result.imported_count === "number"
          ? ` ${result.imported_count} soal berhasil diimpor.`
          : "";
      setMessage((result.message ?? "Import soal selesai.") + importedCountText);
      setImportFile(null);
      setImportFileInputKey((prev) => prev + 1);
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal import soal.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectBatch = async () => {
    if (!token) return;
    const ids = batchInput
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item) && item > 0);

    if (ids.length === 0) {
      setError("Masukkan daftar ID soal dipisahkan koma.");
      return;
    }

    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await adminApi.selectBatch(token, ids);
      setMessage(result.message ?? "Batch soal aktif berhasil diperbarui.");
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal memilih batch soal.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Kelola Soal"
        description="Tambah, ubah, import template Word, dan pilih batch soal aktif."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Soal"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

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

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>{editingQuestionId ? "Edit Soal" : "Tambah Soal"}</CardTitle>
          <CardDescription>
            Gunakan form ini untuk menambah atau memperbarui bank soal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kategori Soal</label>
              <select
                className="h-10 w-full border border-slate-200 rounded-md px-3 text-sm bg-white"
                value={questionDraft.package_id}
                onChange={(event) =>
                  setQuestionDraft((prev) => ({
                    ...prev,
                    package_id: Number(event.target.value),
                  }))
                }
              >
                <option value={0}>Pilih kategori soal</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pilih Soal</label>
              <select
                className="h-10 w-full border border-slate-200 rounded-md px-3 text-sm bg-white"
                value={editingQuestionId ?? ""}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (!value) {
                    resetQuestionForm();
                    return;
                  }
                  handleEditQuestion(value);
                }}
              >
                <option value="">Pilih soal untuk diedit (opsional)</option>
                {questions.map((question) => (
                  <option key={question.id} value={question.id}>
                    #{question.id} - {question.question_text.slice(0, 80)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            placeholder="Pertanyaan"
            value={questionDraft.question_text}
            onChange={(event) =>
              setQuestionDraft((prev) => ({
                ...prev,
                question_text: event.target.value,
              }))
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Option A"
              value={questionDraft.option_a}
              onChange={(event) =>
                setQuestionDraft((prev) => ({ ...prev, option_a: event.target.value }))
              }
            />
            <Input
              placeholder="Option B"
              value={questionDraft.option_b}
              onChange={(event) =>
                setQuestionDraft((prev) => ({ ...prev, option_b: event.target.value }))
              }
            />
            <Input
              placeholder="Option C"
              value={questionDraft.option_c}
              onChange={(event) =>
                setQuestionDraft((prev) => ({ ...prev, option_c: event.target.value }))
              }
            />
            <Input
              placeholder="Option D"
              value={questionDraft.option_d}
              onChange={(event) =>
                setQuestionDraft((prev) => ({ ...prev, option_d: event.target.value }))
              }
            />
          </div>
          <Input
            placeholder="Option E"
            value={questionDraft.option_e}
            onChange={(event) =>
              setQuestionDraft((prev) => ({ ...prev, option_e: event.target.value }))
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="h-10 border border-slate-200 rounded-md px-3 text-sm bg-white"
              value={questionDraft.correct_answer}
              onChange={(event) =>
                setQuestionDraft((prev) => ({
                  ...prev,
                  correct_answer: event.target.value as OptionKey,
                }))
              }
            >
              {(["a", "b", "c", "d", "e"] as const).map((item) => (
                <option key={item} value={item}>
                  Kunci Jawaban: {item.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              <Switch
                checked={questionDraft.is_active}
                onCheckedChange={(checked) =>
                  setQuestionDraft((prev) => ({
                    ...prev,
                    is_active: checked,
                  }))
                }
              />
              <span>{questionDraft.is_active ? "Soal aktif" : "Soal nonaktif"}</span>
            </div>
          </div>

          <Input
            placeholder="Pembahasan"
            value={questionDraft.explanation}
            onChange={(event) =>
              setQuestionDraft((prev) => ({
                ...prev,
                explanation: event.target.value,
              }))
            }
          />

          <div className="flex gap-2">
            <Button onClick={() => void handleSaveQuestion()} disabled={actionLoading}>
              {actionLoading
                ? "Menyimpan..."
                : editingQuestionId
                  ? "Update Soal"
                  : "Tambah Soal"}
            </Button>
            {editingQuestionId && (
              <Button variant="outline" onClick={resetQuestionForm}>
                Batal Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Import `.docx` dan Select Batch</CardTitle>
          <CardDescription>
            Pilih kategori/package terlebih dahulu, lalu upload template Word agar seluruh soal
            hasil import otomatis masuk ke kategori tersebut.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <FileUp className="size-4" />
              Format template import
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>File harus berformat `.docx`.</li>
              <li>Kolom `No` hanya nomor urut dan tidak disimpan.</li>
              <li>Kolom `Soal` berisi teks soal lalu 5 opsi berurutan untuk A sampai E.</li>
              <li>Kolom `Jawaban` dimulai dengan format `Jawaban: E`.</li>
              <li>Baris setelah `Jawaban: X` akan disimpan sebagai pembahasan.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kategori Import</label>
                <select
                  className="h-10 w-full border border-slate-200 rounded-md px-3 text-sm bg-white"
                  value={importPackageId}
                  onChange={(event) => setImportPackageId(Number(event.target.value))}
                >
                  <option value={0}>Pilih kategori import</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">File Template `.docx`</label>
                <Input
                  key={importFileInputKey}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={importPackageId <= 0}
                  onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => void handleImportQuestions()}
              disabled={!importFile || actionLoading || importPackageId <= 0}
            >
              {actionLoading ? "Mengimpor..." : "Import Bank Soal"}
            </Button>
          </div>

          <p className="text-sm text-slate-600">
            Semua soal yang dibaca dari file `.docx` akan otomatis memakai kategori yang dipilih
            di form import ini.
          </p>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm">
            <Checkbox
              checked={importAsActive}
              onCheckedChange={(checked) => setImportAsActive(Boolean(checked))}
              className="mt-0.5"
            />
            <span className="space-y-1">
              <span className="block font-medium text-slate-900">
                Aktifkan semua soal hasil import
              </span>
              <span className="block text-slate-600">
                Jika dinonaktifkan, soal tetap masuk ke bank soal tetapi belum dipakai untuk sesi
                ujian sampai kamu memilih batch aktif.
              </span>
            </span>
          </label>

          <div className="space-y-2">
            <Input
              placeholder="ID soal, contoh: 1,2,3,...,200"
              value={batchInput}
              onChange={(event) => setBatchInput(event.target.value)}
            />
            <Button onClick={() => void handleSelectBatch()} disabled={actionLoading}>
              Simpan Batch Aktif
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
