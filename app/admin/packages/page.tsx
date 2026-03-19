"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpenCheck,
  Layers,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminApi,
  type AdminPackage,
  type AdminPackageExamPayload,
  type AdminPackagePayload,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const createDefaultExamDraft = (
  sortOrder = 1,
): AdminPackageExamPayload => ({
  name: "",
  description: "",
  question_count: 50,
  session_limit: null,
  sort_order: sortOrder,
  is_active: true,
});

const createDefaultPackageDraft = (): AdminPackagePayload => ({
  name: "",
  description: "",
  features: "",
  price: 0,
  is_active: true,
  exams: [createDefaultExamDraft(1)],
});

const mapPackageToDraft = (item: AdminPackage): AdminPackagePayload => ({
  name: item.name,
  description: item.description,
  features: item.features,
  price: item.price,
  is_active: item.is_active,
  exams:
    item.exams && item.exams.length > 0
      ? item.exams.map((exam, index) => ({
          id: exam.id,
          name: exam.name,
          description: exam.description,
          question_count: exam.question_count,
          session_limit: exam.session_limit ?? null,
          sort_order: exam.sort_order || index + 1,
          is_active: exam.is_active,
        }))
      : [createDefaultExamDraft(1)],
});

const renumberExamSortOrders = (
  exams: AdminPackageExamPayload[],
): AdminPackageExamPayload[] =>
  exams.map((exam, index) => ({
    ...exam,
    sort_order: index + 1,
  }));

export default function AdminPackagesPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [savingPackage, setSavingPackage] = useState(false);
  const [rows, setRows] = useState<AdminPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null,
  );
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [packageDraft, setPackageDraft] = useState<AdminPackagePayload>(
    createDefaultPackageDraft(),
  );

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminApi.managePackages(token);
      setRows(response);
      setSelectedPackageId((current) => current ?? response[0]?.id ?? null);
    } catch (error) {
      toast.error("Gagal memuat paket.", {
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

  const resetPackageForm = () => {
    setEditingPackageId(null);
    setPackageDraft(createDefaultPackageDraft());
  };

  const handleEditPackage = (item: AdminPackage) => {
    setEditingPackageId(item.id);
    setSelectedPackageId(item.id);
    setPackageDraft(mapPackageToDraft(item));
  };

  const updateExamDraft = (
    index: number,
    updater: (current: AdminPackageExamPayload) => AdminPackageExamPayload,
  ) => {
    setPackageDraft((prev) => ({
      ...prev,
      exams: prev.exams.map((exam, examIndex) =>
        examIndex === index ? updater(exam) : exam,
      ),
    }));
  };

  const addExamDraft = () => {
    setPackageDraft((prev) => ({
      ...prev,
      exams: [
        ...prev.exams,
        createDefaultExamDraft(prev.exams.length + 1),
      ],
    }));
  };

  const removeExamDraft = (index: number) => {
    if (packageDraft.exams.length <= 1) {
      toast.warning("Paket minimal punya satu tipe ujian.");
      return;
    }

    setPackageDraft((prev) => ({
      ...prev,
      exams: renumberExamSortOrders(
        prev.exams.filter((_, examIndex) => examIndex !== index),
      ),
    }));
  };

  const validatePackageDraft = () => {
    if (
      !packageDraft.name.trim() ||
      !packageDraft.description.trim() ||
      !packageDraft.features.trim()
    ) {
      toast.warning("Nama, deskripsi, dan fitur paket wajib diisi.");
      return false;
    }

    if (!packageDraft.exams.length) {
      toast.warning("Paket minimal harus memiliki satu tipe ujian.");
      return false;
    }

    for (const [index, exam] of packageDraft.exams.entries()) {
      if (!exam.name.trim()) {
        toast.warning(`Nama tipe ujian ke-${index + 1} wajib diisi.`);
        return false;
      }
      if (!exam.question_count || exam.question_count <= 0) {
        toast.warning(`Jumlah soal untuk tipe ujian "${exam.name}" belum valid.`);
        return false;
      }
    }

    return true;
  };

  const handleSavePackage = async () => {
    if (!token || !validatePackageDraft()) return;

    setSavingPackage(true);
    try {
      const payload: AdminPackagePayload = {
        ...packageDraft,
        exams: renumberExamSortOrders(packageDraft.exams),
      };

      const saved = editingPackageId
        ? await adminApi.updatePackage(token, editingPackageId, payload)
        : await adminApi.createPackage(token, payload);

      toast.success(
        editingPackageId
          ? "Paket dan tipe ujian berhasil diperbarui."
          : "Paket dan tipe ujian berhasil dibuat.",
      );

      setEditingPackageId(saved.id);
      setSelectedPackageId(saved.id);
      setPackageDraft(mapPackageToDraft(saved));
      await loadData();
    } catch (error) {
      toast.error("Gagal menyimpan paket.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    } finally {
      setSavingPackage(false);
    }
  };

  const handleArchivePackage = async (item: AdminPackage) => {
    if (!token) return;
    try {
      await adminApi.archivePackage(token, item.id);
      toast.success(`Paket "${item.name}" diarsipkan.`);
      if (selectedPackageId === item.id) {
        setSelectedPackageId(null);
      }
      if (editingPackageId === item.id) {
        resetPackageForm();
      }
      await loadData();
    } catch (error) {
      toast.error("Gagal mengarsipkan paket.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        title="Manajemen Paket & Tipe Ujian"
        description="Paket adalah produk yang dibeli user, sedangkan tipe ujian adalah entity turunan yang berisi soal dan batas sesi masing-masing."
        icon={<ShieldCheck className="text-primary" size={24} />}
        actionLabel="Refresh"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[440px_1fr]">
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers size={18} />
                {editingPackageId
                  ? "Edit Paket & Tipe Ujian"
                  : "Buat Paket Baru"}
              </CardTitle>
              <CardDescription>
                Setelah data paket diisi, lanjutkan langsung dengan tipe ujian
                yang menjadi isi paket tersebut.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Nama Paket">
                <Input
                  value={packageDraft.name}
                  onChange={(e) =>
                    setPackageDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </Field>

              <Field label="Deskripsi Paket">
                <Textarea
                  value={packageDraft.description}
                  onChange={(e) =>
                    setPackageDraft((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-24"
                />
              </Field>

              <Field label="Fitur Ringkas">
                <Textarea
                  value={packageDraft.features}
                  onChange={(e) =>
                    setPackageDraft((prev) => ({ ...prev, features: e.target.value }))
                  }
                  className="min-h-24"
                />
              </Field>

              <Field label="Harga">
                <Input
                  type="number"
                  value={packageDraft.price}
                  onChange={(e) =>
                    setPackageDraft((prev) => ({
                      ...prev,
                      price: Number(e.target.value || 0),
                    }))
                  }
                />
              </Field>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Paket aktif
                  </p>
                  <p className="text-xs text-slate-500">
                    Paket aktif akan muncul di katalog pembelian user.
                  </p>
                </div>
                <Switch
                  checked={packageDraft.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setPackageDraft((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Daftar Tipe Ujian di Dalam Paket
                    </p>
                    <p className="text-xs text-slate-500">
                      Hapus tipe ujian dari form saat edit untuk mengarsipkannya dari
                      paket.
                    </p>
                  </div>
                  <Button variant="outline" onClick={addExamDraft}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Tipe Ujian
                  </Button>
                </div>

                <div className="space-y-4">
                  {packageDraft.exams.map((exam, index) => (
                    <div
                      key={exam.id ?? `draft-${index}`}
                      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Tipe Ujian {index + 1}
                          </p>
                          <p className="text-xs text-slate-500">
                            Relasi ini akan langsung tersimpan ke package.
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-rose-600"
                          onClick={() => removeExamDraft(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <Field label="Nama Tipe Ujian">
                        <Input
                          value={exam.name}
                          onChange={(e) =>
                            updateExamDraft(index, (current) => ({
                              ...current,
                              name: e.target.value,
                            }))
                          }
                        />
                      </Field>

                      <Field label="Deskripsi Tipe Ujian">
                        <Textarea
                          value={exam.description}
                          onChange={(e) =>
                            updateExamDraft(index, (current) => ({
                              ...current,
                              description: e.target.value,
                            }))
                          }
                          className="min-h-20"
                        />
                      </Field>

                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Jumlah Soal">
                          <Input
                            type="number"
                            value={exam.question_count}
                            onChange={(e) =>
                              updateExamDraft(index, (current) => ({
                                ...current,
                                question_count: Number(e.target.value || 0),
                              }))
                            }
                          />
                        </Field>
                        <Field label="Batas Sesi">
                          <Input
                            type="number"
                            placeholder="∞"
                            value={exam.session_limit ?? ""}
                            onChange={(e) =>
                              updateExamDraft(index, (current) => ({
                                ...current,
                                session_limit: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }))
                            }
                          />
                        </Field>
                        <Field label="Urutan Tampil">
                          <Input
                            type="number"
                            value={exam.sort_order ?? index + 1}
                            onChange={(e) =>
                              updateExamDraft(index, (current) => ({
                                ...current,
                                sort_order: Number(e.target.value || index + 1),
                              }))
                            }
                          />
                        </Field>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Tipe ujian aktif
                          </p>
                          <p className="text-xs text-slate-500">
                            Tipe ujian aktif bisa dikerjakan user yang membeli
                            paket ini.
                          </p>
                        </div>
                        <Switch
                          checked={exam.is_active ?? true}
                          onCheckedChange={(checked) =>
                            updateExamDraft(index, (current) => ({
                              ...current,
                              is_active: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => void handleSavePackage()}
                  disabled={savingPackage}
                  className="flex-1"
                >
                  {savingPackage
                    ? "Menyimpan..."
                    : editingPackageId
                      ? "Simpan Paket & Tipe Ujian"
                      : "Buat Paket & Tipe Ujian"}
                </Button>
                {(editingPackageId || packageDraft.name || packageDraft.exams.length > 1) && (
                  <Button variant="outline" onClick={resetPackageForm}>
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {loading ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="py-14 text-center text-sm text-slate-500">
                Memuat paket dan tipe ujian...
              </CardContent>
            </Card>
          ) : rows.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="py-14 text-center text-sm text-slate-500">
                Belum ada paket. Buat paket pertama Anda dari panel kiri.
              </CardContent>
            </Card>
          ) : (
            rows.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "border-slate-200 shadow-sm",
                  selectedPackageId === item.id && "ring-2 ring-primary/20",
                )}
              >
                <CardHeader className="gap-3">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{item.name}</CardTitle>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
                            item.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {item.is_active ? "Aktif" : "Arsip"}
                        </span>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {item.exam_count ?? item.exams?.length ?? 0} tipe ujian
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {item.question_count} soal total
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEditPackage(item)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {item.is_active && (
                        <Button
                          variant="outline"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => void handleArchivePackage(item)}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Arsipkan
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          Tipe Ujian Dalam Paket
                        </p>
                        <p className="text-sm text-slate-500">
                          Relasi ini langsung dibawa ke katalog user dan akan
                          menentukan bank soal per tipe ujian.
                        </p>
                      </div>
                    </div>
                  </div>

                  {(item.exams ?? []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                      Belum ada tipe ujian di paket ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(item.exams ?? []).map((exam) => (
                        <div
                          key={exam.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-slate-900">
                              {exam.name}
                            </p>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
                                exam.is_active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500",
                              )}
                            >
                              {exam.is_active ? "Aktif" : "Arsip"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {exam.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              {exam.question_count} soal
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              Urutan {exam.sort_order}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedPackage && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col gap-2 py-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>
              Paket terpilih saat ini:
              <span className="ml-2 font-semibold text-slate-900">
                {selectedPackage.name}
              </span>
            </div>
            <div>
              Total tipe ujian:
              <span className="ml-2 font-semibold text-slate-900">
                {selectedPackage.exam_count ?? selectedPackage.exams?.length ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
