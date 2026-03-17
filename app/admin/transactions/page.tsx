"use client";

import { useEffect, useState, useMemo } from "react";
import {
  RefreshCw,
  ShieldCheck,
  Search,
  Calendar,
  User,
  CreditCard,
  Receipt,
  Database,
  RefreshCcw,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Table } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, type Transaction } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Transaction["status"]
  >("all");
  const [rechecking, setRechecking] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.transactions(token, {
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setRows(response);
      if (selected) {
        const detail = await adminApi.transactionDetail(token, selected.id);
        setSelected(detail);
      }
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
  }, [token, search, statusFilter]);

  const handleSelect = async (id: number) => {
    if (!token) return;
    try {
      const detail = await adminApi.transactionDetail(token, id);
      setSelected(detail);
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Gagal memuat detail.",
      );
    }
  };

  const handleRecheck = async () => {
    if (!token || !selected) return;
    setRechecking(true);
    setError("");
    try {
      const detail = await adminApi.recheckTransaction(token, selected.id);
      setSelected(detail);
      await loadData();
    } catch (recheckError) {
      setError(
        recheckError instanceof Error
          ? recheckError.message
          : "Gagal sinkronisasi.",
      );
    } finally {
      setRechecking(false);
    }
  };

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "order_code",
        header: "Invoice",
        cell: ({ row }) => (
          <div className="flex flex-col min-w-30">
            <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-tighter">
              {row.original.order_code ?? `TX-${row.original.id}`}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {row.original.package_name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "user_name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <User size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-700 line-clamp-1">
                {row.original.user_name || "Guest"}
              </span>
              <span className="text-[10px] text-slate-400">
                ID: {row.original.user_id}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "gross_amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-700 text-[12px]">
            {row.original.gross_amount
              ? `Rp${Number(row.original.gross_amount).toLocaleString("id-ID")}`
              : "-"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 rounded-lg text-[10px] font-semibold uppercase tracking-widest",
              selected?.id === row.original.id
                ? "bg-primary text-white"
                : "text-primary hover:bg-primary-50",
            )}
            onClick={() => void handleSelect(row.original.id)}
          >
            Detail
          </Button>
        ),
      },
    ],
    [selected],
  );

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 h-full">
      <AdminPageHeader
        title="Transaksi"
        description="Monitor arus kas dan status pembayaran paket ujian."
        icon={<ShieldCheck size={20} />}
      />

      <div className="flex flex-col md:flex-row gap-2 bg-white/50 backdrop-blur-sm p-2 px-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Input
            placeholder="Cari order code, user, atau paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-slate-50/50 border-slate-100 rounded-xl text-xs focus:bg-white transition-all outline-none"
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 outline-none focus:bg-white transition-all"
        >
          <option value="all">Semua Status</option>
          {[
            "created",
            "pending",
            "paid",
            "challenge",
            "failed",
            "cancelled",
            "expired",
            "refunded",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4 flex-1 min-h-0">
        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {loading && rows.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <RefreshCcw size={20} className="animate-spin text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Menyinkronkan Transaksi...
              </span>
            </div>
          ) : (
            <Table columns={columns} data={rows} />
          )}
        </div>

        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm flex flex-col h-[calc(100vh-160px)] overflow-hidden bg-slate-50/40">
          <CardHeader className="bg-white flex items-center border-b border-slate-100 py-2 shrink-0 z-10">
            <CardTitle className="text-[14px] h-full font-semibold uppercase tracking-[0.15em] flex items-center gap-3">
              <Receipt size={18} className="text-primary" /> Detail Transaksi
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 space-y-2 overflow-y-auto no-scrollbar flex-1">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                <Database size={56} strokeWidth={1} className="mb-4" />
                <p className="text-[12px] font-bold uppercase tracking-widest leading-relaxed">
                  Pilih transaksi untuk membedah data
                </p>
              </div>
            ) : (
              <>
                {/* Info Grid - Font Lebih Besar & Padding Luas */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={<Receipt size={14} />}
                    label="Order Code"
                    value={selected.order_code ?? "-"}
                  />
                  <InfoItem
                    icon={<CreditCard size={14} />}
                    label="Payment"
                    value={selected.payment_type ?? "-"}
                  />
                  <InfoItem
                    icon={<Calendar size={14} />}
                    label="Paid At"
                    value={
                      selected.paid_at
                        ? new Date(selected.paid_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "-"
                    }
                  />
                  <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Status Provider
                    </p>
                    <span className="text-[15px] font-semibold text-sky-600">
                      {selected.midtrans_transaction_status ?? "-"}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full rounded-2xl bg-white border border-slate-100 text-primary hover:bg-primary-50 text-[12px] font-bold uppercase tracking-widest h-12 shadow-sm transition-all"
                  disabled={rechecking}
                  onClick={() => void handleRecheck()}
                >
                  <RefreshCw
                    className={cn("mr-3 h-5 w-5", rechecking && "animate-spin")}
                  />
                  Recheck Midtrans Status
                </Button>

                {/* Event History Section */}
                <div className="space-y-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Database size={14} /> Event History & Logs
                  </p>

                  <div className="space-y-6 pb-6">
                    {selected.events?.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-4xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                          <span className="text-[13px] font-semibold text-primary uppercase tracking-wider">
                            {event.event_type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-full uppercase">
                            {new Date(event.created_at).toLocaleTimeString(
                              "id-ID",
                            )}
                          </span>
                        </div>

                        <div className="relative group">
                          <pre className="text-[14px] bg-slate-900 text-emerald-400 p-6 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800 shadow-2xl scrollbar-thin scrollbar-thumb-slate-700">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-100 bg-rose-50 text-rose-600 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Transaction["status"] }) {
  const isPaid = status === "paid";
  const isPending = ["pending", "created", "challenge"].includes(status);

  return (
    <span
      className={cn(
        "text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border",
        isPaid
          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
          : isPending
            ? "bg-amber-50 text-amber-600 border-amber-100"
            : "bg-rose-50 text-rose-600 border-rose-100",
      )}
    >
      {status}
    </span>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-[11px] font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}
