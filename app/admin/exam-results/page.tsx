"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Trophy,
  Calendar,
  User,
  Search,
  RefreshCcw,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Table } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/client";
import { asNumber, asString } from "@/lib/admin-utils";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

type AnyRecord = Record<string, unknown>;

export default function AdminExamResultsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
        loadError instanceof Error ? loadError.message : "Gagal memuat data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const filteredData = useMemo(() => {
    return rows.filter((item) => {
      const name = asString(
        item.user_name ?? item.name ?? item.user_id,
      ).toLowerCase();
      const sessionId = asString(item.session_id ?? item.id).toLowerCase();
      const status = asString(item.status).toLowerCase();
      const searchTerm = search.toLowerCase();

      return (
        name.includes(searchTerm) ||
        sessionId.includes(searchTerm) ||
        status.includes(searchTerm)
      );
    });
  }, [rows, search]);

  const columns = useMemo<ColumnDef<AnyRecord>[]>(
    () => [
      {
        accessorKey: "session_id",
        header: "Sesi",
        cell: ({ row }) => (
          <span className="font-bold text-slate-400 text-[10px]">
            {asNumber(row.original.session_id ?? row.original.id, 0)}
          </span>
        ),
      },
      {
        accessorKey: "user_name",
        header: "Peserta",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User size={14} />
            </div>
            <span className="font-bold text-slate-900 text-[13px] line-clamp-1">
              {asString(
                row.original.user_name ??
                  row.original.name ??
                  row.original.user_id,
              )}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "score",
        header: "Skor",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Trophy size={12} />
            </div>
            <span className="font-black text-slate-700">
              {asNumber(row.original.score, 0)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = asString(row.original.status).toLowerCase();
          const isFinished = status === "finished" || status === "selesai";
          return (
            <span
              className={cn(
                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                isFinished
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-amber-50 text-amber-600 border-amber-100",
              )}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "end_time",
        header: "Waktu Submit",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar size={12} />
            <span className="text-[11px] font-medium whitespace-nowrap">
              {row.original.end_time
                ? new Date(String(row.original.end_time)).toLocaleString(
                    "id-ID",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  )
                : "-"}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 h-full">
      <AdminPageHeader
        title="Hasil Ujian"
        description="Rekap nilai peserta dari sesi ujian yang telah selesai."
        icon={<ShieldCheck size={20} />}
      />

      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-2 px-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Input
            placeholder="Cari peserta, sesi, atau status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-slate-50/50 border-slate-100 rounded-xl text-xs focus:bg-white transition-all"
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:bg-primary-50 transition-all"
          onClick={() => void loadData()}
          disabled={loading}
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-100 bg-rose-50 text-rose-600 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden flex-1">
        {loading ? (
          <div className="h-full min-h-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCcw size={20} className="animate-spin text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Memuat Hasil...
              </span>
            </div>
          </div>
        ) : (
          <Table columns={columns} data={filteredData} />
        )}
      </div>
    </div>
  );
}
