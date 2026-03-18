"use client";

import { useEffect, useMemo, useState } from "react";
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
  Layers,
  RefreshCw,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  adminApi,
  type AdminQuestion,
  type AdminQuestionPayload,
  type ExamPackage,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { Table } from "@/components/data-table";
import { ModalPreview } from "@/components/preview-modal";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    "",
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
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
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const selectedCount = Object.keys(rowSelection).length;

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
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
      toast.error("Gagal Memuat Data", {
        description:
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat bank soal.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token, packageFilter, statusFilter]);

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionDraft(createEmptyQuestionDraft(packages[0]?.id ?? 0));
  };

  const columns = useMemo<ColumnDef<AdminQuestion>[]>(
    () => [
      {
        id: "checkbox",
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
                className="text-[10px] font-bold text-primary-600 hover:underline uppercase"
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
        enableSorting: false,
        cell: ({ row }) => (
          <Switch
            checked={row.original.is_active}
            onCheckedChange={async (checked) => {
              const promise = adminApi.updateQuestion(token!, row.original.id, {
                is_active: checked,
              });

              toast.promise(promise, {
                loading: "Memperbarui status...",
                success: () => {
                  setRows((prev) =>
                    prev.map((r) =>
                      r.id === row.original.id
                        ? { ...r, is_active: checked }
                        : r,
                    ),
                  );
                  return `Soal berhasil ${checked ? "diaktifkan" : "dinonaktifkan"}.`;
                },
                error: "Gagal mengubah status soal.",
              });
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
              className="h-8 w-8 text-slate-400 hover:text-primary-600 hover:bg-white"
              onClick={() => setPreviewQuestion(row.original)}
            >
              <Eye size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-white"
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
              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-white"
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

  const handleSave = async () => {
    if (!token) return;

    if (
      !Number.isInteger(questionDraft.package_id) ||
      questionDraft.package_id <= 0
    ) {
      toast.error("Gagal", { description: "Kategori soal wajib dipilih." });
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
      toast.warning("Form Belum Lengkap", {
        description: "Pertanyaan, semua opsi, dan pembahasan wajib diisi.",
      });
      return;
    }

    setActionLoading(true);
    try {
      if (editingQuestionId) {
        await adminApi.updateQuestion(token, editingQuestionId, questionDraft);
        toast.success("Berhasil", { description: "Soal berhasil diperbarui." });
      } else {
        await adminApi.createQuestion(token, questionDraft);
        toast.success("Berhasil", {
          description: "Soal baru berhasil ditambahkan.",
        });
      }
      setFormOpen(false);
      resetForm();
      await loadData();
    } catch (err) {
      toast.error("Oops!", {
        description:
          err instanceof Error ? err.message : "Gagal menyimpan soal.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deleteQuestion(token, deleteTarget.id);
      toast.success("Terhapus", {
        description: `Soal #${deleteTarget.id} berhasil dihapus.`,
      });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error("Gagal Hapus", { description: "Gagal menghapus soal." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (active: boolean) => {
    if (!token || selectedCount === 0) return;
    setActionLoading(true);

    const selectedIds = Object.keys(rowSelection);
    const promise = Promise.all(
      selectedIds.map((id) =>
        adminApi.updateQuestion(token, Number(id), { is_active: active }),
      ),
    );

    toast.promise(promise, {
      loading: "Memperbarui status soal...",
      success: () => {
        setRowSelection({});
        loadData();
        return `${selectedIds.length} soal berhasil ${active ? "diaktifkan" : "dinonaktifkan"}.`;
      },
      error: "Gagal memperbarui beberapa soal.",
      finally: () => setActionLoading(false),
    });
  };

  const handleBulkCategoryUpdate = async () => {
    if (!token || !selectedCategoryId || selectedCount === 0) return;
    setIsUpdatingCategory(true);

    const selectedIds = Object.keys(rowSelection);
    const promise = Promise.all(
      selectedIds.map((id) =>
        adminApi.updateQuestion(token, Number(id), {
          package_id: Number(selectedCategoryId),
        }),
      ),
    );

    toast.promise(promise, {
      loading: "Memindahkan kategori...",
      success: () => {
        setRowSelection({});
        setBulkCategoryOpen(false);
        setSelectedCategoryId("");
        loadData();
        return `${selectedIds.length} soal berhasil dipindahkan.`;
      },
      error: "Gagal memindahkan soal.",
      finally: () => setIsUpdatingCategory(false),
    });
  };

  const handleBulkDelete = async () => {
    if (!token || selectedCount === 0) return;
    setActionLoading(true);

    const selectedIds = Object.keys(rowSelection).map(Number);
    const promise = Promise.all(
      selectedIds.map((id) => adminApi.deleteQuestion(token, id)),
    );

    toast.promise(promise, {
      loading: "Menghapus soal secara permanen...",
      success: () => {
        setRowSelection({});
        setBulkDeleteOpen(false);
        loadData();
        return `${selectedIds.length} soal berhasil dihapus.`;
      },
      error: "Gagal menghapus beberapa soal.",
      finally: () => setActionLoading(false),
    });
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

      {selectedCount > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-10 duration-500 ease-out">
          <div className="flex items-center justify-between min-w-135 bg-white backdrop-blur-md border border-slate-200/60 p-2.5 pl-8 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_20px_rgba(0,0,0,0.02)] ring-1 ring-slate-900/5">
            <div className="flex items-center gap-5 mr-8 border-r border-slate-100 pr-10">
              <div className="relative p-3 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="text-base font-semibold leading-none">
                  {selectedCount}
                </span>
                <div className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-800 leading-none">
                  Soal Terpilih
                </span>
                <button
                  onClick={() => setRowSelection({})}
                  className="text-[10px] cursor-pointer font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest mt-2 text-left"
                >
                  Batal Pilih
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
              <div className="flex items-center bg-slate-50/80 p-1.5 rounded-[1.5rem] border border-slate-100">
                <button
                  onClick={() => handleBulkStatusUpdate(true)}
                  className="h-10 px-6 rounded-xl cursor-pointer text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-white hover:shadow-sm hover:text-emerald-700 transition-all flex items-center gap-2"
                >
                  Aktifkan
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(false)}
                  className="h-10 px-6 rounded-xl cursor-pointer text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800 transition-all"
                >
                  Nonaktifkan
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button
                  onClick={() => setBulkCategoryOpen(true)}
                  className="h-10 px-6 rounded-xl cursor-pointer text-[10px] font-bold uppercase tracking-widest text-sky-600 hover:bg-white hover:shadow-sm hover:text-sky-700 transition-all flex items-center gap-2"
                >
                  <Layers size={14} />
                  Ubah Kategori
                </button>
              </div>

              <Button
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                className="h-12 rounded-[1.5rem] bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-none font-bold text-[10px] uppercase tracking-widest px-8 transition-all duration-300 shadow-none active:scale-95 group"
              >
                <Trash2
                  size={16}
                  className="mr-2 group-hover:rotate-12 transition-transform"
                />
                Hapus Masal
              </Button>
            </div>
          </div>
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
            />
          </div>

          <div className="relative group">
            <select
              className="h-9 min-w-35 appearance-none rounded-xl border border-slate-100 bg-slate-50/50 pl-3 pr-8 text-[11px] font-semibold uppercase tracking-tight text-slate-600 outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all cursor-pointer"
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
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
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
                className="rounded-xl font-bold text-xs uppercase tracking-widest text-red-500 hover:bg-red-500"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={actionLoading}
                className="text-white rounded-xl px-6 font-bold shadow-lg shadow-primary-100 min-w-35"
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
                className="w-full h-11 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
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
              <label className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 ml-1">
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
                        ? "bg-primary-600 text-white shadow-md shadow-primary-200 scale-105 z-10"
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
              className="min-h-30 rounded-2xl border-slate-200 focus:ring-primary-500 text-base leading-relaxed p-4"
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
                          ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100"
                          : "bg-slate-100 border-slate-200 text-slate-400 group-focus-within:border-primary-300",
                      )}
                    >
                      {key.toUpperCase()}
                    </div>
                    <Input
                      placeholder={`Isi opsi ${key.toUpperCase()}...`}
                      className={cn(
                        "pl-12 h-12 rounded-xl border-slate-200 transition-all",
                        isCorrect &&
                          "border-primary-300 bg-primary-50/30 ring-1 ring-primary-100",
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
              <div className="text-xs font-medium text-slate-800 leading-snug border-l-2 border-primary-400 pl-3">
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="p-0 overflow-hidden border-none shadow-2xl max-w-md rounded-[2.5rem] bg-white">
          <div className="p-10 pb-6 flex flex-col items-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-4xl bg-rose-50 flex items-center justify-center animate-in zoom-in duration-500">
                <Trash2 className="w-10 h-10 text-rose-600" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-sm">
                <div className="bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {selectedCount}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <AlertDialogTitle className="text-2xl font-semibold text-slate-900 tracking-tight">
                Hapus Masal?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                Kamu akan menghapus{" "}
                <span className="text-rose-600 font-semibold">
                  {selectedCount} soal
                </span>{" "}
                secara permanen dari database. Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </div>
          </div>

          <div className="p-8 pt-0 flex flex-col gap-3">
            <Button
              className="w-full h-14 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl font-semibold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-200 transition-all active:scale-[0.98] border-none"
              onClick={handleBulkDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Mengeksekusi..." : "Ya, Hapus Semua"}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-12 text-slate-400 font-bold text-[11px] uppercase tracking-widest transition-all"
              onClick={() => setBulkDeleteOpen(false)}
            >
              Batalkan
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkCategoryOpen} onOpenChange={setBulkCategoryOpen}>
        <DialogContent className="sm:max-w-105 rounded-[2.5rem] p-10 border-none shadow-2xl bg-white outline-none">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-4xl bg-sky-50 flex items-center justify-center text-sky-600 mb-6 border border-sky-100 shadow-sm transition-transform hover:scale-105 duration-300">
              <Layers size={30} />
            </div>

            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">
                Pindahkan Kategori
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium leading-relaxed px-2">
                Kamu akan memindahkan{" "}
                <span className="text-primary-600 font-semibold px-2 py-0.5 bg-primary-50 rounded-lg">
                  {Object.keys(rowSelection).length} soal
                </span>{" "}
                sekaligus. Pastikan kategori tujuan sudah benar.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full space-y-3 pt-8">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Kategori Tujuan
                </label>
                {selectedCategoryId && (
                  <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-widest animate-pulse">
                    Ready to Move
                  </span>
                )}
              </div>

              <div className="relative group">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={isUpdatingCategory}
                  className={cn(
                    "w-full h-14 rounded-2xl border-2 px-6 text-sm font-bold transition-all outline-none appearance-none cursor-pointer shadow-xs",
                    selectedCategoryId
                      ? "border-sky-600 bg-white text-slate-900 shadow-sky-100/50"
                      : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200",
                  )}
                >
                  <option value="" disabled>
                    Pilih kategori...
                  </option>
                  {packages.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-sky-600 transition-colors">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full pt-10">
              <Button
                variant="ghost"
                disabled={isUpdatingCategory}
                onClick={() => setBulkCategoryOpen(false)}
                className="flex-1 rounded-2xl h-14 font-bold text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                Batal
              </Button>
              <Button
                onClick={handleBulkCategoryUpdate}
                disabled={isUpdatingCategory || !selectedCategoryId}
                className={cn(
                  "flex-[2.5] rounded-2xl h-14 font-semibold text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95",
                  selectedCategoryId
                    ? "bg-primary-900 text-white shadow-primary-200 hover:bg-primary-800"
                    : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed",
                )}
              >
                {isUpdatingCategory ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "Konfirmasi Pindah"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
