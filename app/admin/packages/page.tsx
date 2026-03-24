"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Package2, Pencil, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminApi,
  type AdminExam,
  type AdminPackage,
  type AdminPackagePayload,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

const createDefaultDraft = (): AdminPackagePayload => ({
  name: "",
  description: "",
  features: "",
  price: 0,
  is_active: true,
  exam_ids: [],
});

const mapPackageToDraft = (item: AdminPackage): AdminPackagePayload => ({
  name: item.name,
  description: item.description,
  features: item.features,
  price: item.price,
  is_active: item.is_active,
  exam_ids: (item.exams ?? []).map((exam) => exam.id),
});

export default function AdminPackagesPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<AdminPackage[]>([]);
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [draft, setDraft] = useState<AdminPackagePayload>(createDefaultDraft());

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [packageRows, examRows] = await Promise.all([
        adminApi.managePackages(token),
        adminApi.manageExams(token),
      ]);
      setRows(packageRows);
      setExams(examRows);
      setSelectedPackageId((current) => current ?? packageRows[0]?.id ?? null);
    } catch (error) {
      toast.error("Gagal memuat data paket.", {
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

  const selectedPackage = useMemo(
    () => rows.find((item) => item.id === selectedPackageId) ?? null,
    [rows, selectedPackageId],
  );

  const resetForm = () => {
    setEditingPackageId(null);
    setDraft(createDefaultDraft());
  };

  const handleEdit = (item: AdminPackage) => {
    setEditingPackageId(item.id);
    setSelectedPackageId(item.id);
    setDraft(mapPackageToDraft(item));
  };

  const handleToggleExam = (examId: number, checked: boolean) => {
    setDraft((current) => ({
      ...current,
      exam_ids: checked
        ? [...current.exam_ids, examId]
        : current.exam_ids.filter((item) => item !== examId),
    }));
  };

  const validateDraft = () => {
    if (!draft.name.trim() || !draft.description.trim() || !draft.features.trim()) {
      toast.warning("Nama, deskripsi, dan fitur paket wajib diisi.");
      return false;
    }
    if (draft.price === "" || Number(draft.price) < 0) {
      toast.warning("Harga paket belum valid.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!token || !validateDraft()) return;

    setSaving(true);
    try {
      const payload: AdminPackagePayload = {
        ...draft,
        price: draft.price === "" ? 0 : draft.price,
        exam_ids: [...new Set(draft.exam_ids)],
      };

      const saved = editingPackageId
        ? await adminApi.updatePackage(token, editingPackageId, payload)
        : await adminApi.createPackage(token, payload);

      toast.success(
        editingPackageId
          ? "Paket berhasil diperbarui."
          : "Paket berhasil dibuat.",
      );
      setEditingPackageId(saved.id);
      setSelectedPackageId(saved.id);
      setDraft(mapPackageToDraft(saved));
      await loadData();
    } catch (error) {
      toast.error("Gagal menyimpan paket.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminPackage) => {
    if (!token) return;
    const confirmed = window.confirm(
      `Hapus paket "${item.name}"?\n\nPaket akan dihapus permanen. Ujian yang ada di dalam paket tetap utuh, hanya relasinya ke paket ini yang dilepas.`,
    );
    if (!confirmed) return;

    try {
      await adminApi.deletePackage(token, item.id);
      toast.success(`Paket "${item.name}" dihapus permanen.`);
      if (selectedPackageId === item.id) {
        setSelectedPackageId(null);
      }
      if (editingPackageId === item.id) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      toast.error("Gagal menghapus paket.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        title="Kelola Paket"
        description="Paket adalah produk yang dibeli user. Pilih ujian-ujian yang sudah dibuat dari halaman Kelola Ujian untuk dimasukkan ke paket."
        icon={<Package2 className="text-primary" size={24} />}
        actionLabel="Refresh"
        onAction={() => void loadData()}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
        <Card className="border border-slate-200/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Daftar Paket</CardTitle>
              <CardDescription>
                Paket menyimpan harga, deskripsi, dan daftar ujian yang didapat user.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Paket Baru
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Memuat paket...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada paket. Buat paket baru lalu pilih ujian yang mau dimasukkan.
              </p>
            ) : (
              rows.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition ${
                    selectedPackageId === item.id
                      ? "border-sky-300 bg-sky-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedPackageId(item.id)}
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
                    <span>{item.exam_count ?? 0} ujian</span>
                    <span>{item.question_count} soal total</span>
                    <span>Rp {Number(item.price).toLocaleString("id-ID")}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
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
              <CardTitle>
                {editingPackageId ? "Edit Paket" : "Buat Paket Baru"}
              </CardTitle>
              <CardDescription>
                Setelah paket dibuat, user membeli paketnya. Akses ujian yang didapat diambil dari daftar ujian yang Anda pilih di bawah.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nama Paket</label>
                  <Input
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Contoh: PAKET TRY OUT A"
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
                    placeholder="Ringkasan paket"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Fitur</label>
                  <Textarea
                    value={draft.features}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, features: event.target.value }))
                    }
                    placeholder="Tulis poin manfaat paket"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Harga</label>
                  <Input
                    type="number"
                    value={draft.price}
                    min={0}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        price:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Status Paket</p>
                    <p className="text-xs text-slate-500">
                      Paket nonaktif tidak tampil di katalog user.
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

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-800">
                    Pilih Ujian untuk Paket Ini
                  </p>
                </div>
                {exams.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Belum ada ujian. Buat dulu di tab Kelola Ujian.
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {exams.map((exam) => {
                      const checked = draft.exam_ids.includes(exam.id);
                      return (
                        <label
                          key={exam.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                            checked
                              ? "border-sky-300 bg-sky-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              handleToggleExam(exam.id, Boolean(value))
                            }
                          />
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{exam.name}</p>
                            <p className="text-sm text-slate-500">
                              {exam.description || `${exam.question_count} soal`}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                              <span>{exam.question_count} soal</span>
                              <span>
                                {typeof exam.session_limit === "number" &&
                                exam.session_limit > 0
                                  ? `Batas sesi ${exam.session_limit}`
                                  : "Tanpa batas sesi"}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => void handleSave()} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {editingPackageId ? "Simpan Perubahan" : "Buat Paket"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/70">
            <CardHeader>
              <CardTitle>Detail Paket</CardTitle>
              <CardDescription>
                Lihat isi paket yang dipilih, termasuk daftar ujian yang akan didapat user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedPackage ? (
                <p className="text-sm text-slate-500">
                  Pilih salah satu paket di sebelah kiri untuk melihat detailnya.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedPackage.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedPackage.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={selectedPackage.is_active ? "default" : "secondary"}>
                      {selectedPackage.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Badge variant="outline">
                      {selectedPackage.exam_count ?? 0} ujian
                    </Badge>
                    <Badge variant="outline">
                      {selectedPackage.question_count} soal total
                    </Badge>
                    <Badge variant="outline">
                      Rp {Number(selectedPackage.price).toLocaleString("id-ID")}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Ujian di dalam paket
                    </p>
                    <div className="mt-3 space-y-2">
                      {(selectedPackage.exams ?? []).length === 0 ? (
                        <p className="text-sm text-slate-500">
                          Paket ini belum memiliki ujian.
                        </p>
                      ) : (
                        (selectedPackage.exams ?? []).map((exam) => (
                          <div
                            key={exam.id}
                            className="rounded-xl border border-white bg-white px-4 py-3 shadow-sm"
                          >
                            <p className="font-medium text-slate-900">{exam.name}</p>
                            <p className="text-sm text-slate-500">
                              {exam.description || `${exam.question_count} soal`}
                            </p>
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
