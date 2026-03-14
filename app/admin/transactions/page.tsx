"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import SimpleTable from "@/components/admin/simple-table";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi, type Transaction } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

export default function AdminTransactionsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Transaction[]>([]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.transactions(token);
      setRows(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data transaksi.",
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
        title="Transaksi"
        description="Daftar seluruh transaksi pembelian paket ujian."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Transaksi"
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
            headers={["ID", "User ID", "Paket", "Status", "URL Pembayaran"]}
            rows={rows.map((item) => [
              String(item.id),
              String(item.user_id),
              item.package_name ?? String(item.package_id),
              item.status,
              item.payment_gateway_url || "-",
            ])}
            emptyText="Belum ada data transaksi."
          />
        </CardContent>
      </Card>
    </div>
  );
}
