"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Crown, Play, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transactionApi, type ExamPackage, type PurchaseRecord } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const formatExamPurposeLabel = (value?: string) => {
  if (value === "persiapan_ukai") return "Persiapan UKAI";
  if (value === "persiapan_masuk_apoteker") return "Persiapan Masuk Apoteker";
  return "Lainnya";
};

export default function ApotekerDashboard() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        await fetchProfile();
        const [packageList, purchaseList] = await Promise.all([
          transactionApi.getPackages(),
          token ? transactionApi.myTransactions(token) : Promise.resolve([]),
        ]);
        setPackages(packageList);
        setPurchases(purchaseList);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [fetchProfile, token]);

  const activePackageIds = useMemo(
    () =>
      new Set(
        purchases
          .filter((item) => item.access_status === "active")
          .map((item) => item.package_id),
      ),
    [purchases],
  );

  const pendingByPackageId = useMemo(
    () => {
      const map = new Map<number, PurchaseRecord>();
      for (const item of purchases) {
        if (
          !map.has(item.package_id) &&
          (item.transaction_status === "pending" ||
            item.transaction_status === "created" ||
            item.transaction_status === "challenge")
        ) {
          map.set(item.package_id, item);
        }
      }
      return map;
    },
    [purchases],
  );

  const quickStartPackage = useMemo(
    () => packages.find((item) => item.price === 0 || activePackageIds.has(item.id)) ?? null,
    [activePackageIds, packages],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Peserta</h1>
          <p className="text-slate-500 font-medium">
            Selamat datang, <span className="text-sky-600">{user?.name ?? "-"}</span>
          </p>
        </div>
        <div className={cn("flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm w-fit", activePackageIds.size > 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
          <div className={cn("h-2 w-2 rounded-full", activePackageIds.size > 0 ? "bg-emerald-500" : "bg-amber-500")} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {activePackageIds.size > 0 ? `${activePackageIds.size} Paket Aktif` : "Belum Ada Paket Aktif"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ProfileCard label="Email" value={user?.email ?? "-"} />
        <ProfileCard label="Target Skor" value={`${user?.targetScore ?? 0}`} />
        <ProfileCard label="Tujuan Ujian" value={formatExamPurposeLabel(user?.examPurpose)} />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <Card className="border-none bg-gradient-to-br from-sky-600 via-cyan-600 to-sky-700 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6" />
            Paket Ujian CBT
          </CardTitle>
          <CardDescription className="text-sky-100">
            Paket gratis bisa langsung dimulai. Paket berbayar dibeli lewat checkout yang aman di website ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-sky-100">
            Riwayat order dan status pembayaran selalu bisa dipantau dari menu Pembelian.
          </p>
          {quickStartPackage ? (
            <Link href={`/apoteker/test?packageId=${quickStartPackage.id}`}>
              <Button className="bg-white font-bold text-sky-700 hover:bg-sky-50">
                <Play size={16} className="mr-2 fill-current" />
                Mulai {quickStartPackage.name}
              </Button>
            </Link>
          ) : (
            <Link href="/apoteker/purchases">
              <Button className="bg-white font-bold text-sky-700 hover:bg-sky-50">
                Lihat Pembelian
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card className="border border-amber-200 bg-amber-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <WalletCards className="h-5 w-5" />
            Pilih Paket Ujian
          </CardTitle>
          <CardDescription>
            Aktivasi paket berbayar dilakukan per order dan hanya mengaktifkan paket yang dibayar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Memuat daftar paket...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {packages.map((pkg) => {
                const canStartPackage = pkg.price === 0 || activePackageIds.has(pkg.id);
                const pendingOrder = pendingByPackageId.get(pkg.id);

                return (
                  <Card key={pkg.id} className="border border-slate-200 bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <CardDescription>{pkg.description}</CardDescription>
                        </div>
                        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", pkg.price === 0 ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700")}>
                          {pkg.question_count} soal
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-500">{pkg.features}</p>
                      <p className="text-xl font-bold text-slate-900">
                        {pkg.price === 0 ? "Gratis" : `Rp ${Number(pkg.price).toLocaleString("id-ID")}`}
                      </p>
                      {canStartPackage ? (
                        <Link href={`/apoteker/test?packageId=${pkg.id}`} className="block">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <Play size={16} className="mr-2 fill-current" />
                            Mulai Paket
                          </Button>
                        </Link>
                      ) : pendingOrder ? (
                        <Link href={`/apoteker/checkout?transactionId=${pendingOrder.id}`} className="block">
                          <Button className="w-full bg-amber-600 hover:bg-amber-700">
                            Lanjutkan Pembayaran
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/apoteker/checkout?packageId=${pkg.id}`} className="block">
                          <Button className="w-full bg-sky-600 hover:bg-sky-700">
                            Checkout Paket
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">{label}</CardDescription>
        <CardTitle className="text-lg">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
