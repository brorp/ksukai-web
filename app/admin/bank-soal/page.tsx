"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  RefreshCcw,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  Search,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

// UI Components
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API & Utils
import {
  adminApi,
  type AdminQuestion,
  type AdminQuestionPayload,
  type ExamPackage,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import type { OptionKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Table } from "@/components/data-table";
import { ModalPreview } from "@/components/preview-modal";
import { Badge } from "@/components/ui/badge";

// --- Helpers ---
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

  // 2. Column Definitions
  const columns = useMemo<ColumnDef<AdminQuestion>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => (
          <span className="text-xs text-slate-400">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "question_text",
        header: "Pertanyaan",
        cell: ({ row }) => (
          <div className="max-w-100">
            <p className="font-medium text-slate-900 leading-snug">
              {truncateText(row.original.question_text, 100)}
            </p>
            <div className="flex gap-2 mt-1 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-100 px-1.5 rounded">
                Kunci: {row.original.correct_answer.toUpperCase()}
              </span>
              <button
                onClick={() => setPreviewQuestion(row.original)}
                className="text-[10px] font-bold text-sky-600 hover:underline uppercase"
              >
                Detail Soal
              </button>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "package_name",
        header: "Kategori",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
            {row.original.package_name || "Uncategorized"}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Switch
            checked={row.original.is_active}
            onCheckedChange={async (checked) => {
              await adminApi.updateQuestion(token!, row.original.id, {
                is_active: checked,
              });
              setRows((prev) =>
                prev.map((r) =>
                  r.id === row.original.id ? { ...r, is_active: checked } : r,
                ),
              );
            }}
          />
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-sky-600"
              onClick={() => setPreviewQuestion(row.original)}
            >
              <Eye size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-amber-600"
              onClick={() => {
                setEditingQuestionId(row.original.id);
                setQuestionDraft({
                  package_id: row.original.package_id ?? 0,
                  question_text: row.original.question_text,
                  option_a: row.original.option_a,
                  option_b: row.original.option_b,
                  option_c: row.original.option_c,
                  option_d: row.original.option_d,
                  option_e: row.original.option_e,
                  correct_answer: row.original.correct_answer,
                  explanation: row.original.explanation,
                  is_active: row.original.is_active,
                });
                setFormOpen(true);
              }}
            >
              <Pencil size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-rose-600"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [token],
  );

  const handleBulkUpdate = async (selectedRows: AdminQuestion[]) => {
    if (!token) return;
    setActionLoading(true);
    try {
      // Contoh: Mengaktifkan semua yang terpilih
      await Promise.all(
        selectedRows.map((q) =>
          adminApi.updateQuestion(token, q.id, { is_active: true }),
        ),
      );
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return rows;
    return rows.filter((r) =>
      r.question_text.toLowerCase().includes(search.toLowerCase()),
    );
  }, [rows, search]);

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Bank Soal"
        description="Gunakan tabel di bawah untuk manajemen database soal secara masal."
        icon={<ShieldCheck size={20} />}
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

      <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/50 backdrop-blur-sm p-2 px-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center flex-1 gap-2 w-full">
          <div className="relative flex-1 group">
            <Input
              placeholder="Cari pertanyaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-slate-50/50 border-slate-100 rounded-xl text-xs focus:bg-white transition-all"
            />
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
            />
          </div>

          <div className="relative group">
            <select
              className="h-9 min-w-[140px] appearance-none rounded-xl border border-slate-100 bg-slate-50/50 pl-3 pr-8 text-[11px] font-semibold uppercase tracking-tight text-slate-600 outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all cursor-pointer"
              value={packageFilter}
              onChange={(e) => setPackageFilter(Number(e.target.value))}
            >
              <option value={0}>Semua Kategori</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-2">
          <Button
            size="sm"
            className="flex-1 sm:flex-none h-9 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
            onClick={() => {
              setEditingQuestionId(null);
              setQuestionDraft(createEmptyQuestionDraft(packages[0]?.id || 0));
              setFormOpen(true);
            }}
          >
            <Plus size={14} className="mr-1.5" />
            <span className="whitespace-nowrap">Tambah Soal</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:bg-primary-50 transition-all"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredData}
        onBulkUpdate={handleBulkUpdate}
      />

      <ModalPreview
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingQuestionId ? "Edit Detail Soal" : "Tambah Soal Baru"}
        description={
          editingQuestionId
            ? `Mengedit ID Soal #${editingQuestionId}`
            : "Lengkapi form di bawah untuk menambahkan soal baru ke bank soal."
        }
        maxWidth="5xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <p className="text-[10px] text-slate-400 font-medium italic">
              * Pastikan semua opsi jawaban dan kunci sudah benar.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setFormOpen(false)}
                className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={actionLoading}
                className="text-white rounded-xl px-6 font-bold shadow-lg shadow-sky-100 min-w-35"
              >
                {actionLoading ? "Menyimpan..." : "Simpan Soal"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Baris Pertama: Pengaturan Utama */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="md:col-span-8 space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 ml-1">
                Kategori / Paket Soal
              </label>
              <select
                className="w-full h-11 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-sm"
                value={questionDraft.package_id}
                onChange={(e) =>
                  setQuestionDraft((p) => ({
                    ...p,
                    package_id: Number(e.target.value),
                  }))
                }
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-sky-600 ml-1">
                Kunci Jawaban
              </label>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {["a", "b", "c", "d", "e"].map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() =>
                      setQuestionDraft((p) => ({
                        ...p,
                        correct_answer: o as any,
                      }))
                    }
                    className={cn(
                      "flex-1 h-9 rounded-lg text-xs font-semibold uppercase transition-all",
                      questionDraft.correct_answer === o
                        ? "bg-sky-600 text-white shadow-md shadow-sky-200 scale-105 z-10"
                        : "text-slate-400 hover:bg-slate-50",
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Pertanyaan */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 ml-1">
              Teks Pertanyaan
            </label>
            <Textarea
              placeholder="Tuliskan butir soal di sini..."
              value={questionDraft.question_text}
              onChange={(e) =>
                setQuestionDraft((p) => ({
                  ...p,
                  question_text: e.target.value,
                }))
              }
              className="min-h-30 rounded-2xl border-slate-200 focus:ring-sky-500 text-base leading-relaxed p-4"
            />
          </div>

          {/* Section: Opsi Jawaban Grid */}
          <div className="space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 ml-1">
              Pilihan Jawaban
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["a", "b", "c", "d", "e"] as const).map((key) => {
                const isCorrect = questionDraft.correct_answer === key;
                return (
                  <div key={key} className="relative group">
                    <div
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-semibold border transition-all",
                        isCorrect
                          ? "bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-100"
                          : "bg-slate-100 border-slate-200 text-slate-400 group-focus-within:border-sky-300",
                      )}
                    >
                      {key.toUpperCase()}
                    </div>
                    <Input
                      placeholder={`Isi opsi ${key.toUpperCase()}...`}
                      className={cn(
                        "pl-12 h-12 rounded-xl border-slate-200 transition-all",
                        isCorrect &&
                          "border-sky-300 bg-sky-50/30 ring-1 ring-sky-100",
                      )}
                      value={(questionDraft as any)[`option_${key}`]}
                      onChange={(e) =>
                        setQuestionDraft((p) => ({
                          ...p,
                          [`option_${key}`]: e.target.value,
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Pembahasan */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Penjelasan & Pembahasan
              </label>
            </div>
            <Textarea
              placeholder="Berikan alasan atau referensi jawaban yang benar..."
              value={questionDraft.explanation}
              onChange={(e) =>
                setQuestionDraft((p) => ({ ...p, explanation: e.target.value }))
              }
              className="min-h-25 bg-amber-50/30 border-amber-100 rounded-2xl focus:ring-amber-500 text-sm leading-relaxed p-4 italic"
            />
          </div>
        </div>
      </ModalPreview>

      <ModalPreview
        open={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        title="Preview Detail Soal"
        description={`ID: #${previewQuestion?.id}`}
        maxWidth="2xl"
        headerExtra={
          <Badge
            variant="outline"
            className="bg-white border-slate-200 text-slate-500 text-[10px] h-5"
          >
            {previewQuestion?.package_name || "Umum"}
          </Badge>
        }
        footer={
          <Button
            variant="ghost"
            onClick={() => setPreviewQuestion(null)}
            className="h-8 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100"
          >
            Tutup
          </Button>
        }
      >
        {previewQuestion && (
          <div className="space-y-6">
            <section className="space-y-2">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Pertanyaan
              </h4>
              <div className="text-xs font-medium text-slate-800 leading-snug border-l-2 border-sky-400 pl-3">
                {previewQuestion.question_text}
              </div>
            </section>
            <section className="space-y-2">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Pilihan Jawaban
              </h4>
              <div className="grid gap-2">
                {" "}
                {/* Gap antar opsi lebih rapat */}
                {(["a", "b", "c", "d", "e"] as const).map((key) => {
                  const isCorrect = previewQuestion.correct_answer === key;
                  return (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        isCorrect
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-white border-slate-100 shadow-sm",
                      )}
                    >
                      <div
                        className={cn(
                          "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                          isCorrect
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-50 text-slate-400 border border-slate-100",
                        )}
                      >
                        {key.toUpperCase()}
                      </div>
                      <p
                        className={cn(
                          "text-xs leading-tight flex-1",
                          isCorrect
                            ? "font-semibold text-emerald-900"
                            : "text-slate-600",
                        )}
                      >
                        {(previewQuestion as any)[`option_${key}`]}
                      </p>
                      {isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Section: Pembahasan */}
            {previewQuestion.explanation && (
              <section>
                <div className="rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100/50 border-b border-slate-100">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Pembahasan
                    </h4>
                  </div>
                  <div className="p-3 text-xs text-slate-600 leading-relaxed italic">
                    {previewQuestion.explanation}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </ModalPreview>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="p-0 overflow-hidden border-none shadow-2xl max-w-md rounded-3xl">
          {/* Header dengan Aksen Rose/Red yang Soft */}
          <div className="p-8 pb-4 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center animate-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
            </div>

            <div className="space-y-2">
              <AlertDialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
                Hapus Soal Permanen?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed max-w-70">
                {deleteTarget ? (
                  <>
                    Soal{" "}
                    <span className="text-rose-600 font-bold">
                      ID {deleteTarget.id}
                    </span>{" "}
                    akan dihapus dan tidak dapat dipulihkan kembali.
                  </>
                ) : (
                  "Data soal akan dihapus permanen dari sistem."
                )}
              </AlertDialogDescription>
            </div>
          </div>

          {/* Footer dengan Action yang Tegas */}
          <div className="p-6 pt-2 flex flex-col gap-2">
            <AlertDialogAction
              className="w-full h-12 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl font-semibold text-xs uppercase tracking-[0.15em] shadow-lg shadow-rose-200 transition-all active:scale-95 border-none"
              onClick={() => void handleDelete()}
              disabled={actionLoading}
            >
              {actionLoading ? "Menghapus..." : "Ya, Hapus Sekarang"}
            </AlertDialogAction>

            <AlertDialogCancel className="w-full h-12 border-none bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
              Batalkan
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
