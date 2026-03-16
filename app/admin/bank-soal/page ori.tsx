"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import SimpleTable from "@/components/admin/simple-table";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminApi,
  type AdminQuestion,
  type AdminQuestionPayload,
  type ExamPackage,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import type { OptionKey } from "@/lib/types";

const createEmptyQuestionDraft = (packageId = 0): AdminQuestionPayload => ({
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

const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
};

const toDraft = (question: AdminQuestion): AdminQuestionPayload => ({
  package_id: question.package_id ?? 0,
  question_text: question.question_text,
  option_a: question.option_a,
  option_b: question.option_b,
  option_c: question.option_c,
  option_d: question.option_d,
  option_e: question.option_e,
  correct_answer: question.correct_answer,
  explanation: question.explanation,
  is_active: question.is_active,
});

export default function AdminBankSoalPage() {
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    "",
  );
  const [rows, setRows] = useState<AdminQuestion[]>([]);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState<AdminQuestion | null>(
    null,
  );
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [questionDraft, setQuestionDraft] = useState<AdminQuestionPayload>(
    createEmptyQuestionDraft(),
  );
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminQuestion | null>(null);
  const [inlineActionId, setInlineActionId] = useState<number | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [questionRows, packageRows] = await Promise.all([
        adminApi.questions(token, {
          packageId: packageFilter || undefined,
          isActive: statusFilter === "" ? undefined : statusFilter === "active",
        }),
        adminApi.packages(),
      ]);
      setRows(questionRows);
      setPackages(packageRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat bank soal.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token, packageFilter, statusFilter]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const query = search.toLowerCase();

    return rows.filter((item) => {
      const haystacks = [
        item.question_text,
        item.explanation,
        item.option_a,
        item.option_b,
        item.option_c,
        item.option_d,
        item.option_e,
        item.package_name ?? "",
      ];

      return haystacks.some((value) => value.toLowerCase().includes(query));
    });
  }, [rows, search]);

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionDraft(createEmptyQuestionDraft(packages[0]?.id ?? 0));
  };

  const handleCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleEdit = (question: AdminQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionDraft(toDraft(question));
    setFormOpen(true);
  };

  const handleInlineUpdate = async (
    questionId: number,
    payload: Partial<AdminQuestionPayload>,
    successMessage: string,
  ) => {
    if (!token) return;

    setInlineActionId(questionId);
    setError("");
    setMessage("");

    try {
      const updated = await adminApi.updateQuestion(token, questionId, payload);
      setRows((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      if (previewQuestion?.id === updated.id) {
        setPreviewQuestion(updated);
      }
      if (editingQuestionId === updated.id) {
        setQuestionDraft(toDraft(updated));
      }
      setMessage(successMessage);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal memperbarui soal.",
      );
    } finally {
      setInlineActionId(null);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    if (
      !Number.isInteger(questionDraft.package_id) ||
      questionDraft.package_id <= 0
    ) {
      setError("Kategori soal wajib dipilih.");
      return;
    }

    const hasEmptyField = [
      questionDraft.question_text,
      questionDraft.option_a,
      questionDraft.option_b,
      questionDraft.option_c,
      questionDraft.option_d,
      questionDraft.option_e,
      questionDraft.explanation,
    ].some((value) => !value.trim());

    if (hasEmptyField) {
      setError("Pertanyaan, semua opsi, dan pembahasan wajib diisi.");
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

      setFormOpen(false);
      resetForm();
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

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;

    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      await adminApi.deleteQuestion(token, deleteTarget.id);
      setMessage(`Soal #${deleteTarget.id} berhasil dihapus.`);
      setDeleteTarget(null);
      if (previewQuestion?.id === deleteTarget.id) {
        setPreviewQuestion(null);
      }
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal menghapus soal.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Bank Soal"
        description="Lihat pembahasan dan kelola setiap soal langsung dari daftar."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Bank Soal"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari pertanyaan, opsi, atau pembahasan..."
            className="bg-white"
          />
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={packageFilter}
            onChange={(event) => setPackageFilter(Number(event.target.value))}
          >
            <option value={0}>Semua kategori</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | "active" | "inactive")
            }
          >
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" />
            Tambah Soal
          </Button>
          <Link href="/admin/kelola-soal">
            <Button variant="outline">Import / Batch Soal</Button>
          </Link>
        </div>
      </div>

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
        <CardContent className="p-6">
          <SimpleTable
            loading={loading}
            headers={[
              "ID",
              "Pertanyaan",
              "Kategori",
              "Pembahasan",
              "Kunci",
              "Status",
              "Aksi",
            ]}
            rows={filteredRows.map((item) => [
              String(item.id),
              <div key={`question-${item.id}`} className="space-y-1">
                <p className="font-medium text-slate-900">
                  {truncateText(item.question_text, 180)}
                </p>
                <p className="text-xs text-slate-500">Opsi: A, B, C, D, E</p>
              </div>,
              <div key={`package-${item.id}`} className="min-w-56 space-y-2">
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={item.package_id ?? ""}
                  disabled={inlineActionId === item.id || packages.length === 0}
                  onChange={(event) => {
                    const nextPackageId = Number(event.target.value);
                    if (!nextPackageId || nextPackageId === item.package_id) {
                      return;
                    }

                    void handleInlineUpdate(
                      item.id,
                      { package_id: nextPackageId },
                      `Kategori soal #${item.id} berhasil diperbarui.`,
                    );
                  }}
                >
                  <option value="">Pilih kategori</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  {item.package_name ?? "Belum ada kategori"}
                </p>
              </div>,
              <div key={`explanation-${item.id}`} className="space-y-1">
                <p className="text-slate-700">
                  {truncateText(item.explanation, 160)}
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                  onClick={() => setPreviewQuestion(item)}
                >
                  Lihat pembahasan lengkap
                </button>
              </div>,
              item.correct_answer.toUpperCase(),
              <div key={`active-${item.id}`} className="min-w-36 space-y-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={item.is_active}
                    disabled={inlineActionId === item.id}
                    onCheckedChange={(checked) =>
                      void handleInlineUpdate(
                        item.id,
                        { is_active: checked },
                        `Soal #${item.id} ${checked ? "diaktifkan" : "dinonaktifkan"}.`,
                      )
                    }
                  />
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                {inlineActionId === item.id && (
                  <p className="text-xs text-slate-500">
                    Menyimpan perubahan...
                  </p>
                )}
              </div>,
              <div key={`actions-${item.id}`} className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewQuestion(item)}
                >
                  <Eye size={14} className="mr-1" />
                  Lihat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={actionLoading}
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 size={14} className="mr-1" />
                  Hapus
                </Button>
              </div>,
            ])}
            emptyText="Belum ada data bank soal."
          />
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionId
                ? `Edit Soal #${editingQuestionId}`
                : "Tambah Soal Baru"}
            </DialogTitle>
            <DialogDescription>
              Pembahasan ikut disimpan dan akan tampil langsung di bank soal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Kategori Soal
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
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
              <label className="text-sm font-medium text-slate-700">
                Pertanyaan
              </label>
              <Textarea
                value={questionDraft.question_text}
                onChange={(event) =>
                  setQuestionDraft((prev) => ({
                    ...prev,
                    question_text: event.target.value,
                  }))
                }
                placeholder="Masukkan isi pertanyaan"
                className="min-h-28 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputField
                label="Opsi A"
                value={questionDraft.option_a}
                onChange={(value) =>
                  setQuestionDraft((prev) => ({ ...prev, option_a: value }))
                }
              />
              <InputField
                label="Opsi B"
                value={questionDraft.option_b}
                onChange={(value) =>
                  setQuestionDraft((prev) => ({ ...prev, option_b: value }))
                }
              />
              <InputField
                label="Opsi C"
                value={questionDraft.option_c}
                onChange={(value) =>
                  setQuestionDraft((prev) => ({ ...prev, option_c: value }))
                }
              />
              <InputField
                label="Opsi D"
                value={questionDraft.option_d}
                onChange={(value) =>
                  setQuestionDraft((prev) => ({ ...prev, option_d: value }))
                }
              />
              <div className="md:col-span-2">
                <InputField
                  label="Opsi E"
                  value={questionDraft.option_e}
                  onChange={(value) =>
                    setQuestionDraft((prev) => ({ ...prev, option_e: value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Kunci Jawaban
                </label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
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
                      {item.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
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
                  <span>
                    {questionDraft.is_active ? "Soal aktif" : "Soal nonaktif"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Pembahasan
              </label>
              <Textarea
                value={questionDraft.explanation}
                onChange={(event) =>
                  setQuestionDraft((prev) => ({
                    ...prev,
                    explanation: event.target.value,
                  }))
                }
                placeholder="Masukkan pembahasan lengkap"
                className="min-h-32 bg-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button onClick={() => void handleSave()} disabled={actionLoading}>
              {actionLoading
                ? "Menyimpan..."
                : editingQuestionId
                  ? "Update Soal"
                  : "Tambah Soal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewQuestion !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewQuestion(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewQuestion
                ? `Detail Soal #${previewQuestion.id}`
                : "Detail Soal"}
            </DialogTitle>
            <DialogDescription>
              Tampilkan soal lengkap, opsi jawaban, dan pembahasan.
            </DialogDescription>
          </DialogHeader>

          {previewQuestion && (
            <div className="space-y-5">
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kategori
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {previewQuestion.package_name ?? "Belum ada kategori"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {previewQuestion.is_active ? "Aktif" : "Nonaktif"}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Pertanyaan
                </h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 whitespace-pre-wrap text-sm text-slate-800">
                  {previewQuestion.question_text}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Opsi Jawaban
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {(
                    [
                      ["A", previewQuestion.option_a],
                      ["B", previewQuestion.option_b],
                      ["C", previewQuestion.option_c],
                      ["D", previewQuestion.option_d],
                      ["E", previewQuestion.option_e],
                    ] as const
                  ).map(([label, value]) => {
                    const isCorrect =
                      previewQuestion.correct_answer.toUpperCase() === label;

                    return (
                      <div
                        key={label}
                        className={`rounded-lg border px-4 py-3 text-sm ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-700">
                            {label}
                          </span>
                          {isCorrect && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                              Kunci Jawaban
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Pembahasan
                </h3>
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 whitespace-pre-wrap text-sm text-slate-800">
                  {previewQuestion.explanation}
                </div>
              </section>
            </div>
          )}

          <DialogFooter>
            {previewQuestion && (
              <Button
                variant="outline"
                onClick={() => {
                  handleEdit(previewQuestion);
                  setPreviewQuestion(null);
                }}
              >
                <Pencil size={14} className="mr-2" />
                Edit Soal Ini
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewQuestion(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus soal ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Soal #${deleteTarget.id} akan dihapus permanen dari bank soal.`
                : "Data soal akan dihapus permanen."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => void handleDelete()}
            >
              {actionLoading ? "Menghapus..." : "Hapus Soal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Masukkan ${label.toLowerCase()}`}
        className="bg-white"
      />
    </div>
  );
}
