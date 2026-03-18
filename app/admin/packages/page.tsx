"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  ShieldCheck,
  Plus,
  Pencil,
  RotateCcw,
  Coins,
  Layers,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminApi, type AdminPackage } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

type PackageDraft = {
  id: string;
  name: string;
  description: string;
  features: string;
  price: number;
  question_count: number;
  session_limit: number | null;
  validity_days: number | null;
  is_active: boolean;
};

const defaultDraft: PackageDraft = {
  id: "",
  name: "",
  description: "",
  features: "",
  price: 0,
  question_count: 50,
  session_limit: null,
  validity_days: null,
  is_active: true,
};

export default function AdminPackagesPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const [rows, setRows] = useState<AdminPackage[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<PackageDraft>(defaultDraft);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminApi.managePackages(token);
      setRows(response);
    } catch {
      toast.error("Gagal memuat paket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const resetForm = () => {
    setEditingId(null);
    setDraft(defaultDraft);
  };

  const handleEdit = (item: AdminPackage) => {
    setEditingId(item.id);
    setDraft({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      features: item.features || "",
      price: item.price,
      question_count: item.question_count,
      session_limit: item.session_limit ?? null,
      validity_days: item.validity_days ?? null,
      is_active: item.is_active,
    });
  };

  const handleSave = async () => {
    if (!token) return;
    if (!draft.name.trim() || !draft.description.trim()) {
      toast.warning("Nama dan deskripsi wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updatePackage(token, editingId, draft);
        toast.success("Paket diperbarui.");
      } else {
        await adminApi.createPackage(token, draft);
        toast.success("Paket dibuat.");
      }
      resetForm();
      await loadData();
    } catch {
      toast.error("Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!token) return;
    setArchivingId(id);
    try {
      await adminApi.archivePackage(token, id);
      toast.success(`Paket #${id} diarsipkan.`);
      await loadData();
      if (editingId === id) resetForm();
    } catch {
      toast.error("Gagal mengarsipkan.");
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full animate-in fade-in duration-500 overflow-hidden">
      <div className="px-6 py-2 shrink-0">
        <AdminPageHeader
          title="Manajemen Paket"
          description="Atur katalog produk dan limitasi akses ujian."
          icon={<ShieldCheck className="text-primary" size={24} />}
          actionLabel="Sinkronkan"
          onAction={() => void loadData()}
          actionDisabled={loading}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 pt-2 overflow-hidden items-start">
        <div className="lg:col-span-4 h-full max-h-full overflow-y-auto pr-2 custom-scrollbar">
          <Card className="border-slate-200 shadow-sm border-none ring-1 ring-slate-200 p-0 m-1">
            <CardHeader
              className={cn(
                "px-5 py-5 border-b transition-colors rounded-t-xl [.border-b]:pb-4",
                editingId ? "bg-primary/5" : "bg-slate-50/50",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg shadow-sm",
                    editingId
                      ? "bg-primary text-white"
                      : "bg-white text-slate-400 border border-slate-100",
                  )}
                >
                  {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                </div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {editingId ? `Update Paket ${draft.id}` : "Tambah Paket"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-slate-400 ml-1">
                    Nama Produk
                  </label>
                  <Input
                    className="h-10 rounded-lg focus:ring-primary border-slate-200"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-slate-400 ml-1">
                      Harga (Rp)
                    </label>
                    <Input
                      type="number"
                      className="h-10 rounded-lg"
                      value={draft.price}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          price: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-slate-400 ml-1">
                      Jml Soal
                    </label>
                    <Input
                      type="number"
                      className="h-10 rounded-lg text-center font-bold"
                      value={draft.question_count}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          question_count: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-slate-400 ml-1">
                    Deskripsi
                  </label>
                  <Input
                    className="h-10 rounded-lg"
                    value={draft.description}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-slate-400 ml-1">
                      Batas Sesi
                    </label>
                    <Input
                      type="number"
                      placeholder="∞"
                      className="h-10 rounded-lg"
                      value={draft.session_limit ?? ""}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          session_limit: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-slate-400 ml-1">
                      Masa Aktif
                    </label>
                    <Input
                      type="number"
                      placeholder="∞"
                      className="h-10 rounded-lg"
                      value={draft.validity_days ?? ""}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          validity_days: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-600">
                    Publikasikan
                  </span>
                  <Switch
                    checked={draft.is_active}
                    onCheckedChange={(v) =>
                      setDraft((p) => ({ ...p, is_active: v }))
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="w-full h-10 bg-primary hover:bg-primary/90 font-bold text-white rounded-lg shadow-sm"
                >
                  {saving
                    ? "..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Terbitkan Paket"}
                </Button>
                {editingId && (
                  <Button
                    variant="ghost"
                    onClick={resetForm}
                    className="h-9 text-slate-400 text-xs font-bold"
                  >
                    <RotateCcw size={14} className="mr-2" /> Batal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-2 px-1 mb-4 shrink-0">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">
              Database Paket ({rows.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-2xl">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Mengambil data...
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {rows.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "group p-0 mx-1 my-2 relative border-none ring-1 ring-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/30 rounded-2xl overflow-hidden",
                    !item.is_active && "opacity-70 bg-slate-50/50",
                  )}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                  <CardContent className="p-0">
                    <div className="flex items-stretch min-h-25">
                      <div
                        className={cn(
                          "w-20 flex flex-col items-center justify-center border-r border-slate-100/80 transition-colors group-hover:bg-primary/2",
                          item.is_active ? "text-primary" : "text-slate-400",
                        )}
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-tighter opacity-40">
                          ID
                        </span>
                        <span className="text-lg font-semibold tracking-tight leading-none mt-1">
                          {item.id}
                        </span>
                      </div>

                      <div className="p-5 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors duration-300">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 italic font-medium">
                              {item.description || "Tidak ada deskripsi paket."}
                            </p>
                          </div>

                          <div
                            className={cn(
                              "shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-widest shadow-sm border",
                              item.is_active
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-200",
                            )}
                          >
                            {item.is_active ? "Active" : "Draft"}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/4 rounded-md ring-1 ring-primary/10">
                            <Coins size={12} className="text-primary" />
                            <span className="text-[12px] font-semibold text-slate-700">
                              Rp {item.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100/50 rounded-md ring-1 ring-slate-200/50">
                            <Layers size={12} className="text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500">
                              {item.question_count} Soal
                            </span>
                          </div>
                          {item.validity_days && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <AlertCircle size={12} />
                              <span className="text-[11px] font-medium">
                                {item.validity_days} Hari
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-1 px-4 border-l border-slate-50 bg-slate-50/30 group-hover:bg-slate-50/80 transition-colors">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-9 w-9 rounded-xl hover:bg-white hover:text-primary hover:shadow-md text-slate-400 transition-all active:scale-90"
                          title="Edit Paket"
                        >
                          <Pencil size={15} />
                        </Button>
                        {item.is_active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={archivingId === item.id}
                            onClick={() => void handleArchive(item.id)}
                            className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all active:scale-90"
                            title="Arsipkan"
                          >
                            <Archive size={15} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="h-6 w-full shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
