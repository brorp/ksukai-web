"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, PackageCheck, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type PurchaseRecord, transactionApi } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("id-ID") : "-";

const getAccessLabel = (value: PurchaseRecord["access_status"]) => {
  if (value === "active") return "Aktif";
  if (value === "expired") return "Expired";
  return "Belum Aktif";
};

const getTransactionLabel = (value: PurchaseRecord["transaction_status"]) => {
  if (value === "paid") return "Lunas";
  if (value === "pending") return "Pending";
  if (value === "created") return "Order Dibuat";
  if (value === "challenge") return "Challenge";
  if (value === "cancelled") return "Dibatalkan";
  if (value === "expired") return "Expired";
  if (value === "refunded") return "Refund";
  return "Gagal";
};

export default function PurchasesPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<PurchaseRecord[]>([]);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await transactionApi.myTransactions(token);
        setRows(response);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat riwayat pembelian.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Pembelian
          </h1>
          <p className="text-slate-500">
            Riwayat pembelian paket dan status akses ujian Anda.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-sky-600" />
            Riwayat Paket
          </CardTitle>
          <CardDescription>
            Status transaksi dan akses paket ditampilkan per pembelian.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Memuat riwayat pembelian...</p>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <PackageCheck className="h-6 w-6 text-sky-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Belum ada pembelian paket
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Pilih paket dari dashboard untuk mulai transaksi atau akses paket gratis.
              </p>
              <div className="mt-5">
                <Link href="/apoteker/dashboard">
                  <Button className="bg-sky-600 hover:bg-sky-700">
                    Buka Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            rows.map((item) => (
              <Card key={item.id} className="border border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.package_name}</CardTitle>
                      <CardDescription>{item.package_description}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        tone={
                          item.access_status === "active"
                            ? "green"
                            : item.access_status === "expired"
                              ? "amber"
                              : "slate"
                        }
                      >
                        {getAccessLabel(item.access_status)}
                      </Badge>
                      <Badge
                        tone={
                          item.transaction_status === "paid"
                            ? "green"
                            : item.transaction_status === "pending" ||
                                item.transaction_status === "created" ||
                                item.transaction_status === "challenge"
                              ? "amber"
                              : "rose"
                        }
                      >
                        {getTransactionLabel(item.transaction_status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                    <InfoItem
                      label="Harga"
                      value={
                        (item.gross_amount ?? item.package_price) === 0
                          ? "Gratis"
                          : `Rp ${Number(item.gross_amount ?? item.package_price).toLocaleString("id-ID")}`
                      }
                    />
                    <InfoItem label="Order ID" value={item.order_code ?? "-"} />
                    <InfoItem label="Tanggal Pembelian" value={formatDate(item.created_at)} />
                    <InfoItem label="Tanggal Aktivasi" value={formatDate(item.activated_at)} />
                    <InfoItem label="Expired" value={formatDate(item.expires_at)} />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <CalendarDays className="h-4 w-4" />
                      Progress Akses
                    </div>
                    <p className="mt-2">
                      Sesi digunakan: <strong>{item.sessions_used}</strong>
                      {typeof item.session_limit === "number" && item.session_limit > 0
                        ? ` / ${item.session_limit}`
                        : " (tanpa batas sesi)"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {item.access_status === "active" ? (
                      <Link href={`/apoteker/test?packageId=${item.package_id}`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          Mulai Ujian
                        </Button>
                      </Link>
                    ) : item.transaction_status === "pending" ||
                      item.transaction_status === "created" ||
                      item.transaction_status === "challenge" ? (
                      <Link href={`/apoteker/checkout?transactionId=${item.id}`}>
                        <Button className="bg-sky-600 hover:bg-sky-700">
                          Lanjutkan Pembayaran
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/apoteker/dashboard">
                        <Button variant="outline">Ke Dashboard</Button>
                      </Link>
                    )}
                    <Link href={`/apoteker/checkout?transactionId=${item.id}`}>
                      <Button variant="outline">Detail Order</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
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

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "amber" | "rose" | "slate";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        tone === "green" && "bg-emerald-100 text-emerald-700",
        tone === "amber" && "bg-amber-100 text-amber-700",
        tone === "rose" && "bg-rose-100 text-rose-700",
        tone === "slate" && "bg-slate-100 text-slate-700",
      )}
    >
      {children}
    </span>
  );
}
