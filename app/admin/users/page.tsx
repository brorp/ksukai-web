"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Mail,
  Search,
  RefreshCcw,
  CheckCircle,
  XCircle,
  UserMinus,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { adminApi, type AdminUser } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { Table } from "@/components/data-table";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rowSelection, setRowSelection] = useState({});

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminApi.users(token);
      setRows(response);
      setSelectedIds([]);
    } catch {
      toast.error("Gagal memuat data pengguna.");
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

  const handleBulkAction = async (action: "active" | "inactive") => {
    if (!token || selectedIds.length === 0) return;

    const promise = Promise.all(
      selectedIds.map((id) => {
        return adminApi.updateUserStatus(token, id, {
          account_status: action,
          status_note: action === "active" ? null : "Bulk action by admin.",
        });
      }),
    );

    toast.promise(promise, {
      loading: `Memproses ${selectedIds.length} pengguna...`,
      success: () => {
        void loadData();
        return `${selectedIds.length} pengguna berhasil diperbarui.`;
      },
      error: "Gagal memproses beberapa pengguna.",
    });
  };

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "checkbox",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-0.5 ml-1"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-0.5 ml-1"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
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
        accessorKey: "account_status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.account_status === "active"}
              disabled={updatingUserId === row.original.id}
              onCheckedChange={async (checked) => {
                setUpdatingUserId(row.original.id);
                try {
                  await adminApi.updateUserStatus(token!, row.original.id, {
                    account_status: checked ? "active" : "inactive",
                  });
                  await loadData();
                  toast.success("Status diperbarui.");
                } catch {
                  toast.error("Gagal update status.");
                } finally {
                  setUpdatingUserId(null);
                }
              }}
              className="scale-75 origin-left"
            />
          </div>
        ),
      },
    ],
    [updatingUserId, selectedIds, filteredData],
  );

  useEffect(() => {
    const selectedRows = Object.keys(rowSelection)
      .map((index) => {
        return filteredData[Number(index)]?.id;
      })
      .filter(Boolean);

    setSelectedIds(selectedRows);
  }, [rowSelection, filteredData]);

  return (
    <div className="relative flex flex-col space-y-4 animate-in fade-in duration-500 h-full overflow-hidden">
      <AdminPageHeader
        title="Pengguna"
        description="Manajemen akses dan status akun pengguna platform."
        icon={<ShieldCheck size={20} />}
      />

      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-2 px-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
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
          className="h-9 w-9 rounded-xl border border-slate-100 bg-white"
          onClick={() => void loadData()}
          disabled={loading}
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-1 mb-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCcw size={20} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <Table
              columns={columns}
              data={filteredData}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-12 fade-in duration-500">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.02)] border border-white/40 ring-1 ring-slate-200/50">
            {/* Indicator Section */}
            <div className="flex items-center gap-3 pl-1 pr-4 border-r border-slate-200/60">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-bold text-primary animate-in zoom-in duration-300">
                  {selectedIds.length}
                </span>
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Terpilih
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  User
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 px-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction("active")}
                className="h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-tight text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95"
              >
                <CheckCircle size={15} className="mr-2 text-emerald-500" />{" "}
                Aktifkan
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction("inactive")}
                className="h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-tight text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
              >
                <XCircle size={15} className="mr-2 text-slate-400" />{" "}
                Nonaktifkan
              </Button>

              <div className="w-px h-4 bg-slate-200/60 mx-1" />
            </div>

            <div className="pl-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedIds([]);
                  setRowSelection({});
                }}
                className="h-8 w-8 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all group"
                title="Batalkan"
              >
                <UserMinus
                  size={14}
                  className="group-hover:rotate-12 transition-transform"
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
