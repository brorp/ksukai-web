"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import SimpleTable from "@/components/admin/simple-table";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api/client";
import { asNumber, asString } from "@/lib/admin-utils";
import { useAuthStore } from "@/lib/store/auth";

type AnyRecord = Record<string, unknown>;

export default function AdminExamResultsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<AnyRecord[]>([]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.examResults(token);
      setRows(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data hasil ujian.",
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
        title="Hasil Ujian"
        description="Rekap nilai peserta dari sesi ujian yang telah selesai."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Hasil Ujian"
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
            headers={["Sesi", "Peserta", "Skor", "Status", "Waktu Submit"]}
            rows={rows.map((item) => [
              String(asNumber(item.session_id ?? item.id, 0)),
              asString(item.user_name ?? item.name ?? item.user_id),
              String(asNumber(item.score, 0)),
              asString(item.status),
              asString(
                item.end_time
                  ? new Date(String(item.end_time)).toLocaleString("id-ID")
                  : item.end_time,
              ),
            ])}
            emptyText="Belum ada data hasil ujian."
          />
        </CardContent>
      </Card>
    </div>
  );
}
