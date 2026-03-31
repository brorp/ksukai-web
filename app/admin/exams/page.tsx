"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminApi,
  type AdminExam,
  type AdminPackageExamPayload,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

const createDefaultDraft = (): AdminPackageExamPayload => ({
  name: "",
  description: "",
  question_count: 50,
  session_limit: null,
  sort_order: 1,
  is_active: true,
});

const mapExamToDraft = (item: AdminExam): AdminPackageExamPayload => ({
  name: item.name,
  description: item.description,
  question_count: item.question_count,
  session_limit: item.session_limit ?? null,
  sort_order: item.sort_order,
  is_active: item.is_active,
});

export default function AdminExamsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<AdminExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [draft, setDraft] = useState<AdminPackageExamPayload>(createDefaultDraft());

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const examRows = await adminApi.manageExams(token);
      setRows(examRows);
      setSelectedExamId((current) => current ?? examRows[0]?.id ?? null);
    } catch (error) {
      toast.error("Gagal memuat data ujian.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const selectedExam = useMemo(
    () => rows.find((item) => item.id === selectedExamId) ?? null,
    [rows, selectedExamId],
  );

  const resetForm = () => {
    setEditingExamId(null);
    setDraft(createDefaultDraft());
  };

  const handleEdit = (item: AdminExam) => {
    setEditingExamId(item.id);
    setSelectedExamId(item.id);
    setDraft(mapExamToDraft(item));
  };

  const validateDraft = () => {
    if (!draft.name.trim()) {
      toast.warning("Nama ujian wajib diisi.");
      return false;
    }
    if (draft.question_count === "" || Number(draft.question_count) <= 0) {
      toast.warning("Jumlah soal ujian belum valid.");
      return false;
    }
    if (
      draft.session_limit !== null &&
      draft.session_limit !== "" &&
      Number(draft.session_limit) <= 0
    ) {
      toast.warning("Batas sesi ujian belum valid.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!token || !validateDraft()) return;

    setSaving(true);
    try {
      const payload: AdminPackageExamPayload = {
        ...draft,
        question_count:
          draft.question_count === "" ? 0 : Number(draft.question_count),
        session_limit:
          draft.session_limit === "" ? null : draft.session_limit,
        sort_order: draft.sort_order === "" ? 1 : Number(draft.sort_order),
      };

      const saved = editingExamId
        ? await adminApi.updateExam(token, editingExamId, payload)
        : await adminApi.createExam(token, payload);

      toast.success(
        editingExamId ? "Ujian berhasil diperbarui." : "Ujian berhasil dibuat.",
      );
      setEditingExamId(saved.id);
      setSelectedExamId(saved.id);
      setDraft(mapExamToDraft(saved));
      await loadData();
    } catch (error) {
      toast.error("Gagal menyimpan ujian.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminExam) => {
    if (!token) return;
    const confirmed = window.confirm(
      `Hapus ujian "${item.name}"?\n\nSemua soal yang terhubung akan tetap ada di bank soal, tetapi akan menjadi nonaktif dan tidak terhubung ke ujian mana pun.`,
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteExam(token, item.id);
      toast.success(`Ujian "${item.name}" dihapus permanen.`);
      if (selectedExamId === item.id) {
        setSelectedExamId(null);
      }
      if (editingExamId === item.id) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      toast.error("Gagal menghapus ujian.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        title="Kelola Ujian"
        description="Buat dulu entity ujian di sini. Setelah itu soal-soal di bank soal bisa di-assign ke ujian ini, lalu ujian tersebut dipilih ke paket dari halaman Kelola Paket."
        icon={<BookOpenCheck className="text-primary" size={24} />}
        actionLabel="Refresh"
        onAction={() => void loadData()}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
        <Card className="border border-slate-200/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Daftar Ujian</CardTitle>
              <CardDescription>
                Ujian adalah entity mandiri yang menampung soal. Satu ujian bisa dipakai di beberapa paket.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Ujian Baru
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Memuat ujian...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada ujian. Buat ujian baru, lalu isi soalnya dari bank soal.
              </p>
            ) : (
              rows.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition ${
                    selectedExamId === item.id
                      ? "border-sky-300 bg-sky-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedExamId(item.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </button>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>
                      {item.assigned_question_count ?? 0} / {item.question_count} soal terisi
                    </span>
                    <span>
                      {typeof item.session_limit === "number" &&
                      item.session_limit > 0
                        ? `Batas sesi ${item.session_limit}`
                        : "Tanpa batas sesi"}
                    </span>
                    <span>Dipakai di {item.package_count} paket</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/admin/exams/preview?examId=${item.id}`}>
                      <Button type="button" size="sm" variant="secondary">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </Link>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => void handleDelete(item)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-slate-200/70">
            <CardHeader>
              <CardTitle>{editingExamId ? "Edit Ujian" : "Buat Ujian Baru"}</CardTitle>
              <CardDescription>
                Soal akan dihubungkan ke ujian ini dari halaman Bank Soal atau Kelola Soal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedExam ? (
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">
                    Progres isi soal: {selectedExam.assigned_question_count ?? 0} /{" "}
                    {selectedExam.question_count} soal
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Jumlah kiri menunjukkan soal yang sudah ter-assign ke ujian ini dari bank soal.
                  </p>
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nama Ujian</label>
                  <Input
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Contoh: Soal Uji Klinis 2025"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                  <Textarea
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Deskripsi singkat ujian"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Jumlah Soal</label>
                  <Input
                    type="number"
                    min={1}
                    value={draft.question_count}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        question_count:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Batas Sesi</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Kosongkan jika tak terbatas"
                    value={draft.session_limit ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        session_limit:
                          event.target.value === ""
                            ? null
                            : Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Urutan Default</label>
                  <Input
                    type="number"
                    min={1}
                    value={draft.sort_order ?? 1}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sort_order:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Status Ujian</p>
                    <p className="text-xs text-slate-500">
                      Jika nonaktif, ujian tidak bisa dimulai user.
                    </p>
                  </div>
                  <Switch
                    checked={draft.is_active ?? true}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({ ...current, is_active: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => void handleSave()} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {editingExamId ? "Simpan Perubahan" : "Buat Ujian"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/70">
            <CardHeader>
              <CardTitle>Detail Ujian</CardTitle>
              <CardDescription>
                Pantau ujian sedang dipakai di paket mana saja sebelum mengubah atau menghapusnya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedExam ? (
                <p className="text-sm text-slate-500">
                  Pilih ujian dari daftar di sebelah kiri untuk melihat detailnya.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{selectedExam.name}</p>
                    <p className="text-sm text-slate-500">{selectedExam.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={selectedExam.is_active ? "default" : "secondary"}>
                      {selectedExam.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Badge variant="outline">{selectedExam.question_count} soal</Badge>
                    <Badge variant="outline">
                      {typeof selectedExam.session_limit === "number" &&
                      selectedExam.session_limit > 0
                        ? `Batas sesi ${selectedExam.session_limit}`
                        : "Tanpa batas sesi"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-sm font-semibold text-slate-800">Dipakai di paket</p>
                    <div className="mt-3 space-y-2">
                      {selectedExam.packages.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          Ujian ini belum terhubung ke paket mana pun.
                        </p>
                      ) : (
                        selectedExam.packages.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-white bg-white px-4 py-3 shadow-sm"
                          >
                            <p className="font-medium text-slate-900">{item.name}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
