"use client";

import { useEffect, useState } from "react";
import { Archive, Package2, ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminApi, type AdminPackage } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

type PackageDraft = {
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<AdminPackage[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<PackageDraft>(defaultDraft);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.managePackages(token);
      setRows(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat paket ujian.",
      );
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
      name: item.name,
      description: item.description,
      features: item.features,
      price: item.price,
      question_count: item.question_count,
      session_limit: item.session_limit ?? null,
      validity_days: item.validity_days ?? null,
      is_active: item.is_active,
    });
  };

  const handleSave = async () => {
    if (!token) return;
    if (!draft.name.trim() || !draft.description.trim() || !draft.features.trim()) {
      setError("Nama, deskripsi, dan fitur paket wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await adminApi.updatePackage(token, editingId, draft);
        setMessage("Paket berhasil diperbarui.");
      } else {
        await adminApi.createPackage(token, draft);
        setMessage("Paket berhasil dibuat.");
      }
      resetForm();
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal menyimpan paket.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!token) return;

    setArchivingId(id);
    setError("");
    setMessage("");
    try {
      await adminApi.archivePackage(token, id);
      setMessage(`Paket #${id} berhasil diarsipkan.`);
      await loadData();
      if (editingId === id) {
        resetForm();
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal mengarsipkan paket.",
      );
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Kelola Paket"
        description="CRUD paket ujian yang dijual atau diaktifkan di platform."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Paket"
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
          <CardTitle>{editingId ? "Edit Paket" : "Tambah Paket"}</CardTitle>
          <CardDescription>
            Paket lama dari seed tetap bisa dikelola di sini.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            placeholder="Nama paket"
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            placeholder="Harga"
            type="number"
            min={0}
            value={draft.price}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, price: Number(event.target.value) }))
            }
          />
          <Input
            placeholder="Deskripsi"
            value={draft.description}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <Input
            placeholder="Fitur singkat"
            value={draft.features}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, features: event.target.value }))
            }
          />
          <Input
            placeholder="Jumlah soal"
            type="number"
            min={1}
            value={draft.question_count}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, question_count: Number(event.target.value) }))
            }
          />
          <Input
            placeholder="Batas sesi (opsional)"
            type="number"
            min={1}
            value={draft.session_limit ?? ""}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                session_limit: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
          <Input
            placeholder="Masa berlaku hari (opsional)"
            type="number"
            min={1}
            value={draft.validity_days ?? ""}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                validity_days: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Switch
              checked={draft.is_active}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, is_active: checked }))
              }
            />
            <span className="text-sm font-medium text-slate-700">
              {draft.is_active ? "Paket Aktif" : "Paket Nonaktif"}
            </span>
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {saving ? "Menyimpan..." : editingId ? "Update Paket" : "Tambah Paket"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Batal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Daftar Paket</CardTitle>
          <CardDescription>
            Archive digunakan agar histori transaksi dan akses tetap aman.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Memuat paket...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada paket.</p>
          ) : (
            rows.map((item) => (
              <Card key={item.id} className="border border-slate-200">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      #{item.id} • {item.name}
                    </p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                    <p className="text-xs text-slate-400">
                      {item.question_count} soal
                      {typeof item.session_limit === "number" && item.session_limit > 0
                        ? ` • limit ${item.session_limit} sesi`
                        : ""}
                      {typeof item.validity_days === "number" && item.validity_days > 0
                        ? ` • ${item.validity_days} hari`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.is_active ? "Aktif" : "Archived"}
                    </span>
                    <Button variant="outline" onClick={() => handleEdit(item)}>
                      <Package2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    {item.is_active ? (
                      <Button
                        variant="outline"
                        disabled={archivingId === item.id}
                        onClick={() => void handleArchive(item.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {archivingId === item.id ? "Mengarsipkan..." : "Archive"}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
