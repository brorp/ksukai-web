"use client";

import { useEffect, useState } from "react";
import { BarChart3, ShieldCheck, Users, WalletCards } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, type DashboardStats } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

export default function AdminDashboardPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    transactions: 0,
    examCompleted: 0,
  });

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const statsResponse = await adminApi.dashboardStats(token);
      setStats(statsResponse);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat ringkasan dashboard.",
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
        title="Dashboard Admin"
        description="Ringkasan data utama platform CBT."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Data"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Pengguna"
          value={String(stats.users)}
          icon={<Users className="text-sky-600" size={20} />}
        />
        <StatsCard
          title="Total Transaksi"
          value={String(stats.transactions)}
          icon={<WalletCards className="text-emerald-600" size={20} />}
        />
        <StatsCard
          title="Ujian Selesai"
          value={String(stats.examCompleted)}
          icon={<BarChart3 className="text-indigo-600" size={20} />}
        />
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {title}
        </CardTitle>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
