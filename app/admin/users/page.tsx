"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, Users } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import SimpleTable from "@/components/admin/simple-table";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api/client";
import { asNumber, asString } from "@/lib/admin-utils";
import { useAuthStore } from "@/lib/store/auth";

type AnyRecord = Record<string, unknown>;

export default function AdminUsersPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<AnyRecord[]>([]);

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

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <SimpleTable
            loading={loading}
            headers={["ID", "Nama", "Email", "Role", "Premium", "Tujuan Ujian"]}
            rows={rows.map((item) => [
              String(asNumber(item.id, 0)),
              asString(item.name),
              asString(item.email),
              asString(item.role),
              Boolean(item.is_premium ?? item.isPremium) ? "Ya" : "Tidak",
              asString(item.exam_purpose ?? item.examPurpose),
            ])}
            emptyText="Belum ada data pengguna."
          />
        </CardContent>
      </Card>
    </div>
  );
}
