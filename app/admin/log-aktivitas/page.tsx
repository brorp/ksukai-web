"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Search,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  User,
  Zap,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Table } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, type ActivityLog } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

type LogStatusFilter = "all" | "success" | "failed";

const ACTION_MAP: Record<string, string> = {
  LOGIN: "Melakukan Login",
  REGISTER: "Mendaftar Akun",
  PROFILE_UPDATE: "Mengubah Profil",
  PROFILE_READ: "Melihat Profil",
  EXAM_START: "Memulai Ujian",
  EXAM_SUBMIT: "Menyelesaikan Ujian",
  EXAM_READ: "Melihat Ujian",
  EXAM_REPORT: "Melaporkan Ujian",
  EXAM_RESULT_READ: "Melihat Hasil Ujian",
  TRANSACTION_CREATE: "Membuat Transaksi",
  TRANSACTION_UPDATE: "Memperbarui Transaksi",
  TRANSACTION_READ: "Melihat Transaksi",
  PASSWORD_RESET: "Mereset Password",
  PASSWORD_RESET_REQUEST: "Request Reset Password",
  LOGOUT: "Melakukan Logout",
  PACKAGE_CREATE: "Membuat Paket",
  PACKAGE_UPDATE: "Memperbarui Paket",
  PACKAGE_ARCHIVE: "Menghapus Paket",
  PACKAGE_READ: "Melihat Paket",
  USER_UPDATE: "Memperbarui User",
  USER_READ: "Melihat User",
  DASHBOARD_READ: "Melihat Dashboard",
};

const ENTITY_MAP: Record<string, string> = {
  USER: "Pengguna",
  EXAM: "Sesi Ujian / Soal",
  PACKAGE: "Paket Ujian",
  TRANSACTION: "Order Pembayaran",
  SESSION: "Sesi Ujian",
  DASHBOARD: "Halaman Dashboard",
  AUTH: "Autentikasi",
};

const formatAction = (action: string) => ACTION_MAP[action] || action.replace(/_/g, " ");
const formatEntity = (entity: string) => ENTITY_MAP[entity] || entity.replace(/_/g, " ");

export default function AdminLogAktivitasPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
        loadError instanceof Error ? loadError.message : "Gagal memuat log.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const mappedAction = formatAction(item.action).toLowerCase();
      const mappedEntity = formatEntity(item.entity).toLowerCase();

      const matchesSearch =
        mappedAction.includes(search.toLowerCase()) ||
        mappedEntity.includes(search.toLowerCase()) ||
        (item.message?.toLowerCase() || "").includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [logs, statusFilter, search]);

  const columns = useMemo<ColumnDef<ActivityLog>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "Waktu",
        cell: ({ row }) => (
          <div className="flex flex-col min-w-30">
            <span className="text-[11px] font-semibold text-slate-900">
              {new Date(row.original.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(row.original.created_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Aktivitas",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-sky-500" />
              <span className="font-semibold text-slate-900 text-[12px] tracking-tight">
                {formatAction(row.original.action)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium italic">
              Target: {formatEntity(row.original.entity)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "actor",
        header: "Aktor",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <User size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-700">
                {row.original.actor_role || "system"}
              </span>
              <span className="text-[10px] text-slate-400">
                ID: {row.original.actor_user_id ?? "-"}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isSuccess = row.original.status === "success";
          return (
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase",
                isSuccess
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-rose-50 text-rose-600 border-rose-100",
              )}
            >
              {isSuccess ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {row.original.status}
            </div>
          );
        },
      },
      {
        accessorKey: "message",
        header: "Keterangan",
        cell: ({ row }) => (
          <p className="text-[11px] text-slate-500 max-w-xs line-clamp-2 italic leading-relaxed">
            {row.original.message || "-"}
          </p>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 h-full text-slate-900">
      <AdminPageHeader
        title="Log Aktivitas"
        description="Pantau riwayat aksi sistem dan pengguna secara real-time."
        icon={<Activity size={20} />}
      />

      <div className="flex flex-col md:flex-row gap-2 bg-white/50 backdrop-blur-sm p-2 px-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Input
            placeholder="Cari aksi atau entitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-slate-50/50 border-slate-100 rounded-xl text-xs focus:bg-white transition-all"
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
          />
        </div>

        <div className="flex gap-1.5 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
          {(["all", "success", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 h-7 rounded-lg text-[10px] font-semibold uppercase transition-all",
                statusFilter === s
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {s === "all" ? "Semua" : s === "success" ? "Berhasil" : "Gagal"}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:bg-primary-50"
          onClick={() => void loadData()}
          disabled={loading}
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-100 bg-rose-50 text-rose-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden flex-1">
        {loading ? (
          <div className="h-full min-h-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCcw size={20} className="animate-spin text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Menyinkronkan Log...
              </span>
            </div>
          </div>
        ) : (
          <Table columns={columns} data={filteredLogs} />
        )}
      </div>
    </div>
  );
}
