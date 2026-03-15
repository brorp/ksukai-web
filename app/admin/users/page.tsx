"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { adminApi, type AdminUser } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

export default function AdminUsersPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.users(token);
      setRows(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data pengguna.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const handleToggleStatus = async (user: AdminUser, nextChecked: boolean) => {
    if (!token) return;

    setUpdatingUserId(user.id);
    setError("");
    setMessage("");

    try {
      const updated = await adminApi.updateUserStatus(token, user.id, {
        account_status: nextChecked ? "active" : "inactive",
        status_note: nextChecked ? null : user.status_note ?? "Akun dinonaktifkan oleh admin.",
      });
      setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(`Status akun ${updated.name} berhasil diperbarui.`);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal memperbarui status user.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Pengguna"
        description="Daftar seluruh akun yang terdaftar pada platform."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Pengguna"
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
        <CardContent className="p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Memuat data pengguna...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data pengguna.</p>
          ) : (
            <div className="space-y-4">
              {rows.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        #{item.id} • {item.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.email} • {item.role} • {item.exam_purpose_label ?? item.exam_purpose}
                      </p>
                      <p className="text-xs text-slate-400">
                        Premium: {item.is_premium ? "Ya" : "Tidak"}
                        {item.status_note ? ` • Catatan: ${item.status_note}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <Switch
                        checked={item.account_status === "active"}
                        disabled={updatingUserId === item.id}
                        onCheckedChange={(checked) => void handleToggleStatus(item, checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {updatingUserId === item.id
                          ? "Menyimpan..."
                          : item.account_status === "active"
                            ? "Akun Aktif"
                            : "Akun Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
