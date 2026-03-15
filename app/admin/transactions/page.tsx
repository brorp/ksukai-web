"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [statusFilter, setStatusFilter] = useState<"all" | Transaction["status"]>("all");
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
          : "Gagal memuat detail transaksi.",
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
          : "Gagal sinkronisasi transaksi.",
      );
    } finally {
      setRechecking(false);
    }
  };

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
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              placeholder="Cari order code, nama user, paket..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="md:max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | Transaction["status"])
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="created">created</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="challenge">challenge</option>
              <option value="failed">failed</option>
              <option value="cancelled">cancelled</option>
              <option value="expired">expired</option>
              <option value="refunded">refunded</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Memuat transaksi...</p>
              ) : rows.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada data transaksi.</p>
              ) : (
                rows.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void handleSelect(item.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition-colors",
                      selected?.id === item.id
                        ? "border-sky-300 bg-sky-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.package_name} • {item.order_code ?? `TX-${item.id}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          User #{item.user_id}
                          {item.user_name ? ` • ${item.user_name}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {typeof item.gross_amount === "number"
                            ? `Rp ${Number(item.gross_amount).toLocaleString("id-ID")}`
                            : "-"}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <StatusPill status={item.status} />
                        <p className="text-xs text-slate-500">
                          {item.payment_type ?? item.payment_method ?? "-"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <Card className="border border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle>Detail Transaksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selected ? (
                  <p className="text-sm text-slate-500">
                    Pilih salah satu transaksi untuk melihat detail payload dan status callback.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <InfoItem label="Order Code" value={selected.order_code ?? "-"} />
                      <InfoItem label="Status" value={selected.status} />
                      <InfoItem
                        label="Status Provider"
                        value={selected.midtrans_transaction_status ?? "-"}
                      />
                      <InfoItem label="Payment Type" value={selected.payment_type ?? "-"} />
                      <InfoItem
                        label="Fraud Status"
                        value={selected.fraud_status ?? "-"}
                      />
                      <InfoItem
                        label="Paid At"
                        value={selected.paid_at ? new Date(selected.paid_at).toLocaleString("id-ID") : "-"}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        disabled={rechecking}
                        onClick={() => void handleRecheck()}
                      >
                        <RefreshCw
                          className={cn("mr-2 h-4 w-4", rechecking && "animate-spin")}
                        />
                        Recheck Midtrans
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Event Logs
                      </p>
                      {selected.events?.length ? (
                        selected.events.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {event.event_type}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {new Date(event.created_at).toLocaleString("id-ID")}
                              </p>
                            </div>
                            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Belum ada event log.</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusPill({ status }: { status: Transaction["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        status === "paid" && "bg-emerald-100 text-emerald-700",
        (status === "pending" || status === "created" || status === "challenge") &&
          "bg-amber-100 text-amber-700",
        (status === "failed" ||
          status === "cancelled" ||
          status === "expired" ||
          status === "refunded") &&
          "bg-rose-100 text-rose-700",
      )}
    >
      {status}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
