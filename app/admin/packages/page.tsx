"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpenCheck,
  Layers,
  Pencil,
  Plus,
  ShieldCheck,
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
  type AdminPackageExam,
  type AdminPackageExamPayload,
  type AdminPackagePayload,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const createDefaultPackageDraft = (): AdminPackagePayload => ({
  name: "",
  description: "",
  features: "",
  price: 0,
  session_limit: null,
  validity_days: null,
  is_active: true,
});

const createDefaultExamDraft = (): AdminPackageExamPayload => ({
  name: "",
  description: "",
  question_count: 50,
  sort_order: 1,
  is_active: true,
});

export default function AdminPackagesPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [savingPackage, setSavingPackage] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [rows, setRows] = useState<AdminPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null,
  );
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [packageDraft, setPackageDraft] = useState<AdminPackagePayload>(
    createDefaultPackageDraft(),
  );
  const [examDraft, setExamDraft] = useState<AdminPackageExamPayload>(
    createDefaultExamDraft(),
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

  const resetExamForm = () => {
    setEditingExamId(null);
    setExamDraft(createDefaultExamDraft());
  };

  const handleEditPackage = (item: AdminPackage) => {
    setEditingPackageId(item.id);
    setSelectedPackageId(item.id);
    setPackageDraft({
      name: item.name,
      description: item.description,
      features: item.features,
      price: item.price,
      session_limit: item.session_limit ?? null,
      validity_days: item.validity_days ?? null,
      is_active: item.is_active,
    });
  };

  const handleEditExam = (exam: AdminPackageExam) => {
    setEditingExamId(exam.id);
    setExamDraft({
      name: exam.name,
      description: exam.description,
      question_count: exam.question_count,
      sort_order: exam.sort_order,
      is_active: exam.is_active,
    });
  };

  const handleSavePackage = async () => {
    if (!token) return;
    if (!packageDraft.name.trim() || !packageDraft.description.trim()) {
      toast.warning("Nama dan deskripsi paket wajib diisi.");
      return;
    }

    setSavingPackage(true);
    try {
      if (editingPackageId) {
        await adminApi.updatePackage(token, editingPackageId, packageDraft);
        toast.success("Paket berhasil diperbarui.");
      } else {
        await adminApi.createPackage(token, packageDraft);
        toast.success("Paket berhasil dibuat.");
      }
      resetPackageForm();
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

  const handleSaveExam = async () => {
    if (!token || !selectedPackageId) return;
    if (!examDraft.name.trim() || !examDraft.description.trim()) {
      toast.warning("Nama dan deskripsi ujian wajib diisi.");
      return;
    }

    setSavingExam(true);
    try {
      if (editingExamId) {
        await adminApi.updatePackageExam(token, editingExamId, examDraft);
        toast.success("Ujian berhasil diperbarui.");
      } else {
        await adminApi.createPackageExam(token, selectedPackageId, examDraft);
        toast.success("Ujian baru berhasil ditambahkan.");
      }
      resetExamForm();
      await loadData();
    } catch (error) {
      toast.error("Gagal menyimpan ujian.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    } finally {
      setSavingExam(false);
    }
  };

  const handleArchiveExam = async (exam: AdminPackageExam) => {
    if (!token) return;
    try {
      await adminApi.archivePackageExam(token, exam.id);
      toast.success(`Ujian "${exam.name}" diarsipkan.`);
      if (editingExamId === exam.id) {
        resetExamForm();
      }
      await loadData();
    } catch (error) {
      toast.error("Gagal mengarsipkan ujian.", {
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        title="Manajemen Paket & Ujian"
        description="Kelola produk paket tryout dan daftar ujian yang berada di dalam setiap paket."
        icon={<ShieldCheck className="text-primary" size={24} />}
        actionLabel="Refresh"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers size={18} />
                {editingPackageId ? "Edit Paket" : "Buat Paket Baru"}
              </CardTitle>
              <CardDescription>
                Paket adalah layer pembelian. Ujian dikelola setelah paket
                dibuat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-3 gap-3">
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
                <Field label="Batas Sesi">
                  <Input
                    type="number"
                    placeholder="∞"
                    value={packageDraft.session_limit ?? ""}
                    onChange={(e) =>
                      setPackageDraft((prev) => ({
                        ...prev,
                        session_limit: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                  />
                </Field>
                <Field label="Masa Aktif">
                  <Input
                    type="number"
                    placeholder="∞"
                    value={packageDraft.validity_days ?? ""}
                    onChange={(e) =>
                      setPackageDraft((prev) => ({
                        ...prev,
                        validity_days: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                  />
                </Field>
              </div>

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

              <div className="flex gap-3">
                <Button
                  onClick={() => void handleSavePackage()}
                  disabled={savingPackage}
                  className="flex-1"
                >
                  {savingPackage
                    ? "Menyimpan..."
                    : editingPackageId
                      ? "Simpan Paket"
                      : "Buat Paket"}
                </Button>
                {editingPackageId && (
                  <Button variant="outline" onClick={resetPackageForm}>
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpenCheck size={18} />
                {editingExamId ? "Edit Ujian" : "Tambah Ujian ke Paket"}
              </CardTitle>
              <CardDescription>
                {selectedPackage
                  ? `Ujian akan ditambahkan ke paket "${selectedPackage.name}".`
                  : "Pilih paket lebih dulu untuk mengelola daftar ujian di dalamnya."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Paket Terpilih">
                <select
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={selectedPackageId ?? ""}
                  onChange={(e) =>
                    setSelectedPackageId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                >
                  <option value="">Pilih paket...</option>
                  {rows.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Nama Ujian">
                <Input
                  value={examDraft.name}
                  onChange={(e) =>
                    setExamDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={!selectedPackageId}
                />
              </Field>

              <Field label="Deskripsi Ujian">
                <Textarea
                  value={examDraft.description}
                  onChange={(e) =>
                    setExamDraft((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-24"
                  disabled={!selectedPackageId}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Jumlah Soal">
                  <Input
                    type="number"
                    value={examDraft.question_count}
                    onChange={(e) =>
                      setExamDraft((prev) => ({
                        ...prev,
                        question_count: Number(e.target.value || 0),
                      }))
                    }
                    disabled={!selectedPackageId}
                  />
                </Field>
                <Field label="Urutan Tampil">
                  <Input
                    type="number"
                    value={examDraft.sort_order ?? 1}
                    onChange={(e) =>
                      setExamDraft((prev) => ({
                        ...prev,
                        sort_order: Number(e.target.value || 1),
                      }))
                    }
                    disabled={!selectedPackageId}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Ujian aktif
                  </p>
                  <p className="text-xs text-slate-500">
                    Ujian aktif dapat dikerjakan user yang punya akses ke paket.
                  </p>
                </div>
                <Switch
                  checked={examDraft.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setExamDraft((prev) => ({ ...prev, is_active: checked }))
                  }
                  disabled={!selectedPackageId}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => void handleSaveExam()}
                  disabled={savingExam || !selectedPackageId}
                  className="flex-1"
                >
                  {savingExam
                    ? "Menyimpan..."
                    : editingExamId
                      ? "Simpan Ujian"
                      : "Tambah Ujian"}
                </Button>
                {editingExamId && (
                  <Button variant="outline" onClick={resetExamForm}>
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
                Memuat paket dan ujian...
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
                          {item.exam_count ?? item.exams?.length ?? 0} ujian
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {item.question_count} soal total
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedPackageId(item.id);
                          handleEditPackage(item);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Paket
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
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          Daftar Ujian
                        </p>
                        <p className="text-sm text-slate-500">
                          Paket ini bisa berisi banyak ujian dengan jumlah soal
                          masing-masing.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedPackageId(item.id);
                          resetExamForm();
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Ujian
                      </Button>
                    </div>
                  </div>

                  {(item.exams ?? []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                      Belum ada ujian di paket ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(item.exams ?? []).map((exam) => (
                        <div
                          key={exam.id}
                          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
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
                            <p className="text-sm text-slate-500">
                              {exam.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                              <span className="rounded-full bg-slate-100 px-3 py-1">
                                {exam.question_count} soal
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1">
                                Urutan {exam.sort_order}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedPackageId(item.id);
                                handleEditExam(exam);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            {exam.is_active && (
                              <Button
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                                onClick={() => void handleArchiveExam(exam)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Arsipkan
                              </Button>
                            )}
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
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}
