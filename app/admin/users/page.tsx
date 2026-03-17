"use client";

import { useEffect, useState, useMemo } from "react";
import { ShieldCheck, Mail, Crown, Search, RefreshCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, type AdminUser } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { Table } from "@/components/data-table";

export default function AdminUsersPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
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
    return rows.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toString().includes(search),
    );
  }, [rows, search]);

  const handleToggleStatus = async (user: AdminUser, nextChecked: boolean) => {
    if (!token) return;
    setUpdatingUserId(user.id);
    try {
      const updated = await adminApi.updateUserStatus(token, user.id, {
        account_status: nextChecked ? "active" : "inactive",
        status_note: nextChecked ? null : "Akun dinonaktifkan oleh admin.",
      });
      setRows((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError("Gagal memperbarui status.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-bold text-slate-400">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Pengguna",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 line-clamp-1">
              {row.original.name}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Mail size={10} /> {row.original.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role & Purpose",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border",
                  row.original.role === "admin"
                    ? "bg-rose-50 text-rose-600 border-rose-100"
                    : "bg-slate-50 text-slate-600 border-slate-100",
                )}
              >
                {row.original.role}
              </span>
              {row.original.is_premium && (
                <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Crown size={8} /> Premium
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              {row.original.exam_purpose_label ?? row.original.exam_purpose}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "account_status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.account_status === "active"}
              disabled={updatingUserId === row.original.id}
              onCheckedChange={(checked) =>
                void handleToggleStatus(row.original, checked)
              }
              className="scale-75 origin-left"
            />
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-tighter",
                row.original.account_status === "active"
                  ? "text-emerald-500"
                  : "text-slate-300",
              )}
            >
              {updatingUserId === row.original.id
                ? "..."
                : row.original.account_status}
            </span>
          </div>
        ),
      },
    ],
    [updatingUserId],
  );

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 h-full">
      <AdminPageHeader
        title="Pengguna"
        description="Manajemen akses dan status akun pengguna platform."
        icon={<ShieldCheck size={20} />}
      />

      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-2 px-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Input
            placeholder="Cari nama, email, atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-slate-50/50 border-slate-100 rounded-xl text-xs focus:bg-white transition-all outline-none"
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

      {(error || message) && (
        <div
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold border animate-in slide-in-from-top-2",
            error
              ? "bg-rose-50 border-rose-100 text-rose-600"
              : "bg-emerald-50 border-emerald-100 text-emerald-600",
          )}
        >
          {error || message}
        </div>
      )}

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden flex-1">
        {loading ? (
          <div className="h-full min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCcw size={20} className="animate-spin text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Memuat User...
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
