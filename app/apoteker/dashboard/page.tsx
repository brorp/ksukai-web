"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Crown, Play, RefreshCw, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { transactionApi, type ExamPackage, type Transaction } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function ApotekerDashboard() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingPackages(true);
      setError("");
      try {
        await fetchProfile();
        const packageList = await transactionApi.getPackages();
        setPackages(packageList);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat data dashboard.",
        );
      } finally {
        setLoadingPackages(false);
      }
    };

    void loadInitialData();
  }, [fetchProfile]);

  const formattedPurpose = useMemo(() => {
    if (!user?.examPurpose) return "-";
    return user.examPurpose.toUpperCase();
  }, [user?.examPurpose]);

  const handleCreateTransaction = async (packageId: number) => {
    if (!token) return;

    setSelectedPackageId(packageId);
    setActionMessage("");
    setError("");

    try {
      const transaction = await transactionApi.createTransaction(token, packageId);
      setLatestTransaction(transaction);
      setActionMessage(
        "Transaksi berhasil dibuat. Lanjutkan pembayaran pada URL yang disediakan.",
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal membuat transaksi.",
      );
    } finally {
      setSelectedPackageId(null);
    }
  };

  const handleSimulatePayment = async () => {
    if (!latestTransaction) return;

    setSimulatingPayment(true);
    setError("");
    setActionMessage("");

    try {
      await transactionApi.simulateWebhookSuccess(latestTransaction.id);
      await fetchProfile();
      setActionMessage("Pembayaran berhasil disimulasikan. Akun Anda sekarang premium.");
    } catch (simulateError) {
      setError(
        simulateError instanceof Error
          ? simulateError.message
          : "Gagal memproses simulasi pembayaran.",
      );
    } finally {
      setSimulatingPayment(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard Peserta
          </h1>
          <p className="text-slate-500 font-medium">
            Selamat datang, <span className="text-sky-600">{user?.name ?? "-"}</span>
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm w-fit",
            user?.isPremium
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200",
          )}
        >
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              user?.isPremium ? "bg-emerald-500" : "bg-amber-500",
            )}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {user?.isPremium ? "Premium Aktif" : "Belum Premium"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProfileCard label="Email" value={user?.email ?? "-"} />
        <ProfileCard label="Target Skor" value={`${user?.targetScore ?? 0}`} />
        <ProfileCard label="Tujuan Ujian" value={formattedPurpose} />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-medium">
          {actionMessage}
        </div>
      )}

      <Card className="border-none shadow-xl bg-gradient-to-br from-sky-600 via-cyan-600 to-sky-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Crown className="h-6 w-6" />
            Simulasi Ujian CBT
          </CardTitle>
          <CardDescription className="text-sky-100">
            Durasi ujian 200 menit + grace period 1 menit. Soal diacak per peserta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sky-100 text-sm">
              Anda dapat mulai ujian jika akun premium sudah aktif.
            </p>
          </div>
          <Link href="/apoteker/test">
            <Button
              disabled={!user?.isPremium}
              className="bg-white text-sky-700 hover:bg-sky-50 font-bold"
            >
              <Play size={16} className="mr-2 fill-current" />
              Mulai Ujian
            </Button>
          </Link>
        </CardContent>
      </Card>

      {!user?.isPremium && (
        <Card className="border border-amber-200 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <WalletCards className="h-5 w-5" />
              Aktivasi Premium
            </CardTitle>
            <CardDescription>
              Pilih paket, buat transaksi, lalu selesaikan pembayaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPackages ? (
              <p className="text-sm text-slate-500">Memuat daftar paket...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="border border-slate-200 bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-500">{pkg.features}</p>
                      <p className="text-xl font-bold text-slate-900">
                        Rp {Number(pkg.price).toLocaleString("id-ID")}
                      </p>
                      <Button
                        className="w-full bg-sky-600 hover:bg-sky-700"
                        disabled={selectedPackageId === pkg.id}
                        onClick={() => handleCreateTransaction(pkg.id)}
                      >
                        {selectedPackageId === pkg.id
                          ? "Membuat Transaksi..."
                          : "Pilih Paket"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {latestTransaction && (
              <Card className="border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Transaksi #{latestTransaction.id}
                  </CardTitle>
                  <CardDescription>Status: {latestTransaction.status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={latestTransaction.payment_gateway_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-700 underline break-all"
                  >
                    {latestTransaction.payment_gateway_url}
                  </a>

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={simulatingPayment}
                    onClick={handleSimulatePayment}
                  >
                    <RefreshCw
                      size={14}
                      className={cn("mr-2", simulatingPayment && "animate-spin")}
                    />
                    Simulasikan Pembayaran Sukses
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </CardDescription>
        <CardTitle className="text-lg">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
