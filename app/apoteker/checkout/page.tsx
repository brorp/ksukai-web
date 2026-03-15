"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import MidtransSnapEmbed from "@/components/apoteker/midtrans-snap-embed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  transactionApi,
  type ExamPackage,
  type PaymentProviderConfig,
  type Transaction,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const PAYMENT_OPTIONS = [
  ["all", "Pilih di Checkout", "Tampilkan semua metode pembayaran yang didukung Midtrans."],
  ["qris", "QRIS", "Pembayaran QRIS melalui flow Midtrans."],
  ["gopay", "GoPay", "Langsung ke flow GoPay di Snap."],
  ["shopeepay", "ShopeePay", "Langsung ke flow ShopeePay di Snap."],
  ["bank_transfer", "Transfer Bank", "Virtual account atau transfer bank yang tersedia."],
  ["credit_card", "Kartu Kredit", "Secure card payment via Midtrans Snap."],
  ["alfamart", "Alfamart", "Bayar offline di gerai Alfamart."],
  ["indomaret", "Indomaret", "Bayar offline di gerai Indomaret."],
] as const;

const PENDING_STATUSES = new Set(["created", "pending", "challenge"]);

const formatCurrency = (value: number | undefined) =>
  typeof value === "number" ? `Rp ${Number(value).toLocaleString("id-ID")}` : "-";
const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("id-ID") : "-";

const getStatusLabel = (status?: string | null) => {
  switch (status) {
    case "created":
      return "Order Dibuat";
    case "pending":
      return "Menunggu Pembayaran";
    case "paid":
      return "Lunas";
    case "challenge":
      return "Perlu Review";
    case "cancelled":
      return "Dibatalkan";
    case "expired":
      return "Expired";
    case "refunded":
      return "Refund";
    case "failed":
      return "Gagal";
    default:
      return "-";
  }
};

const getStatusTone = (status?: string | null) =>
  cn(
    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
    status === "paid" && "border-emerald-200 bg-emerald-100 text-emerald-700",
    (status === "pending" || status === "created" || status === "challenge") &&
      "border-amber-200 bg-amber-100 text-amber-700",
    (status === "cancelled" ||
      status === "expired" ||
      status === "failed" ||
      status === "refunded") &&
      "border-rose-200 bg-rose-100 text-rose-700",
    (!status || status === "-") && "border-slate-200 bg-slate-100 text-slate-700",
  );

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentProviderConfig | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [snapOpen, setSnapOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const transactionIdQuery = searchParams.get("transactionId");
  const orderCodeQuery = searchParams.get("order_id");
  const packageIdQuery = searchParams.get("packageId");

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [packageList, config] = await Promise.all([
          transactionApi.getPackages(),
          transactionApi.getPaymentConfig(),
        ]);
        setPackages(packageList);
        setPaymentConfig(config);

        const packageId = Number(packageIdQuery ?? 0);
        if (Number.isInteger(packageId) && packageId > 0) {
          setSelectedPackageId(packageId);
        }

        const transactionId = Number(transactionIdQuery ?? 0);
        const detail =
          Number.isInteger(transactionId) && transactionId > 0
            ? await transactionApi.detail(token, transactionId)
            : orderCodeQuery
              ? await transactionApi.detailByOrderCode(token, orderCodeQuery)
              : null;

        if (detail) {
          setCurrentTransaction(detail);
          setSelectedPackageId(detail.package_id);
          setSelectedPaymentMethod(detail.payment_method ?? "all");
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gagal memuat checkout paket.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [orderCodeQuery, packageIdQuery, token, transactionIdQuery]);

  useEffect(() => {
    if (!token || !currentTransaction || !PENDING_STATUSES.has(currentTransaction.status)) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const detail = await transactionApi.syncStatus(token, currentTransaction.id);
        setCurrentTransaction(detail);
      } catch {
        // keep silent during background polling
      }
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [currentTransaction, token]);

  const selectedPackage = useMemo(() => {
    if (currentTransaction) {
      return {
        id: currentTransaction.package_id,
        name: currentTransaction.package_name ?? "-",
        description: currentTransaction.package_description ?? "",
        price: currentTransaction.package_price ?? currentTransaction.gross_amount ?? 0,
        features: "",
        question_count: currentTransaction.session_limit ?? 0,
        session_limit: currentTransaction.session_limit,
        validity_days: currentTransaction.validity_days,
      } satisfies ExamPackage;
    }
    return packages.find((item) => item.id === selectedPackageId) ?? null;
  }, [currentTransaction, packages, selectedPackageId]);

  const handleCreateOrder = async () => {
    if (!token || !selectedPackageId) return;
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const created = await transactionApi.createTransaction(token, {
        packageId: selectedPackageId,
        paymentMethod: selectedPaymentMethod,
      });
      setCurrentTransaction(created);
      setSnapOpen(true);
      setMessage("Order berhasil dibuat. Lanjutkan pembayaran di bawah.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Gagal membuat order pembayaran.");
    } finally {
      setCreating(false);
    }
  };

  const handleSyncStatus = async () => {
    if (!token || !currentTransaction) return;
    setSyncing(true);
    setError("");
    try {
      const detail = await transactionApi.syncStatus(token, currentTransaction.id);
      setCurrentTransaction(detail);
      setMessage(`Status order diperbarui: ${getStatusLabel(detail.status)}.`);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Gagal sinkronisasi status pembayaran.");
    } finally {
      setSyncing(false);
    }
  };

  const canPay =
    !!currentTransaction &&
    PENDING_STATUSES.has(currentTransaction.status) &&
    !!currentTransaction.snap_token;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3">
            <Link href="/apoteker/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-600">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Checkout Paket</h1>
          <p className="text-slate-500">Ringkasan order dan pembayaran Midtrans di website Anda sendiri.</p>
        </div>
        {currentTransaction?.order_code ? (
          <Badge variant="outline" className="rounded-full px-4 py-2 text-sm font-semibold">
            Order {currentTransaction.order_code}
          </Badge>
        ) : null}
      </div>

      {error ? <Notice tone="rose" message={error} /> : null}
      {message ? <Notice tone="emerald" message={message} /> : null}

      {loading ? (
        <Card className="border border-slate-200">
          <CardContent className="flex items-center justify-center gap-3 py-16 text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Memuat detail checkout...
          </CardContent>
        </Card>
      ) : !selectedPackage ? (
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 py-16 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Paket belum dipilih</h2>
            <p className="text-sm text-slate-500">Buka dashboard dan pilih paket untuk memulai checkout.</p>
            <Link href="/apoteker/dashboard">
              <Button className="bg-sky-600 hover:bg-sky-700">Pilih Paket</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle>Ringkasan Paket</CardTitle>
                <CardDescription>Detail order yang akan dibayarkan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nama Paket</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{selectedPackage.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedPackage.description}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <InfoBox label="Harga" value={formatCurrency(selectedPackage.price)} />
                  <InfoBox label="Batas Sesi" value={typeof selectedPackage.session_limit === "number" && selectedPackage.session_limit > 0 ? `${selectedPackage.session_limit} sesi` : "Tanpa batas sesi"} />
                  <InfoBox label="Masa Berlaku" value={typeof selectedPackage.validity_days === "number" && selectedPackage.validity_days > 0 ? `${selectedPackage.validity_days} hari` : "Tidak dibatasi"} />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
                <CardDescription>Pilih metode yang ingin difokuskan saat membuka Snap checkout.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  {PAYMENT_OPTIONS.map(([value, label, description]) => (
                    <label key={value} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition-colors", selectedPaymentMethod === value ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300")}>
                      <RadioGroupItem value={value} className="mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">{label}</p>
                        <p className="text-sm text-slate-500">{description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {!currentTransaction ? (
              <Button className="w-full bg-sky-600 hover:bg-sky-700" disabled={creating} onClick={handleCreateOrder}>
                {creating ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Membuat Order...</> : <><CreditCard className="mr-2 h-4 w-4" />Buat Order Pembayaran</>}
              </Button>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="border border-slate-200">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>Status Pembayaran</CardTitle>
                    <CardDescription>Order ID: {currentTransaction?.order_code ?? "-"}</CardDescription>
                  </div>
                  <span className={getStatusTone(currentTransaction?.status)}>{getStatusLabel(currentTransaction?.status)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoBox label="Total Order" value={formatCurrency(currentTransaction?.gross_amount ?? selectedPackage.price)} />
                  <InfoBox label="Metode" value={currentTransaction?.payment_method ?? selectedPaymentMethod} />
                  <InfoBox label="Payment Type" value={currentTransaction?.payment_type ?? "-"} />
                  <InfoBox label="Status Provider" value={currentTransaction?.midtrans_transaction_status ?? "-"} />
                  <InfoBox label="Dibuat" value={formatDate(currentTransaction?.created_at)} />
                  <InfoBox label="Paid At" value={formatDate(currentTransaction?.paid_at)} />
                </div>
                {currentTransaction ? (
                  <div className="flex flex-wrap gap-3">
                    {canPay ? (
                      <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setSnapOpen(true)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Bayar Sekarang
                      </Button>
                    ) : null}
                    <Button variant="outline" disabled={syncing} onClick={handleSyncStatus}>
                      <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
                      Sinkronkan Status
                    </Button>
                    {currentTransaction.status === "paid" && currentTransaction.access_status === "active" ? (
                      <Link href={`/apoteker/test?packageId=${currentTransaction.package_id}`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          <BadgeCheck className="mr-2 h-4 w-4" />
                          Mulai Ujian
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                ) : null}
                {currentTransaction?.status === "paid" ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      Pembayaran terkonfirmasi
                    </div>
                    <p className="mt-2">Akses paket diaktifkan hanya untuk paket yang dibeli pada order ini.</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {canPay && paymentConfig ? (
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle>Panel Pembayaran</CardTitle>
                  <CardDescription>UI checkout Midtrans di-embed langsung di halaman ini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!snapOpen ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                      Klik <strong>Bayar Sekarang</strong> untuk membuka panel pembayaran.
                    </div>
                  ) : (
                    <MidtransSnapEmbed
                      active={snapOpen}
                      clientKey={paymentConfig.client_key}
                      snapScriptUrl={paymentConfig.snap_script_url}
                      snapToken={currentTransaction.snap_token ?? ""}
                      onSuccess={() => {
                        setMessage("Midtrans mengembalikan status sukses. Menyinkronkan order...");
                        void handleSyncStatus();
                      }}
                      onPending={() => {
                        setMessage("Pembayaran masih pending. Anda bisa sinkronkan status kapan saja.");
                        void handleSyncStatus();
                      }}
                      onError={() => {
                        setError("Midtrans mengembalikan error pada proses pembayaran.");
                        void handleSyncStatus();
                      }}
                      onClose={() => {
                        setMessage("Panel pembayaran ditutup. Order Anda tetap tersimpan.");
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Notice({ tone, message }: { tone: "rose" | "emerald"; message: string }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm font-medium", tone === "rose" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
      {message}
    </div>
  );
}
