"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import SimpleTable from "@/components/admin/simple-table";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi, type ActivityLog } from "@/lib/api/client";
import { asString } from "@/lib/admin-utils";
import { useAuthStore } from "@/lib/store/auth";

type LogStatusFilter = "all" | "success" | "failed";

export default function AdminLogAktivitasPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<LogStatusFilter>("all");

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.activityLogs(token);
      setLogs(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat log aktivitas.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const filteredLogs = useMemo(() => {
    if (statusFilter === "all") return logs;
    return logs.filter((item) => item.status === statusFilter);
  }, [logs, statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Log Aktivitas"
        description="Riwayat aktivitas API dan tindakan admin/peserta."
        icon={<Activity size={20} />}
        actionLabel="Refresh Log"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`px-3 h-9 rounded-md text-sm border transition-colors ${
            statusFilter === "all"
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => setStatusFilter("all")}
        >
          Semua
        </button>
        <button
          type="button"
          className={`px-3 h-9 rounded-md text-sm border transition-colors ${
            statusFilter === "success"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => setStatusFilter("success")}
        >
          Berhasil
        </button>
        <button
          type="button"
          className={`px-3 h-9 rounded-md text-sm border transition-colors ${
            statusFilter === "failed"
              ? "bg-rose-600 text-white border-rose-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => setStatusFilter("failed")}
        >
          Gagal
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <SimpleTable
            loading={loading}
            headers={["Waktu", "Aksi", "Entitas", "Aktor", "Status", "Keterangan"]}
            rows={filteredLogs.map((item) => [
              new Date(item.created_at).toLocaleString("id-ID"),
              item.action,
              item.entity,
              item.actor_role
                ? `${item.actor_role}#${item.actor_user_id ?? "-"}`
                : "-",
              item.status === "success" ? "Berhasil" : "Gagal",
              asString(item.message),
            ])}
            emptyText="Belum ada log aktivitas."
          />
        </CardContent>
      </Card>
    </div>
  );
}
