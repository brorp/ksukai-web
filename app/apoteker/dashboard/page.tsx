"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Crown,
  FileText,
  Laptop2,
  Layers,
  Play,
  ShieldAlert,
  Timer,
  WalletCards,
  WifiOff,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  transactionApi,
  type ExamPackage,
  type PurchaseRecord,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { ModalPreview } from "@/components/preview-modal";
import { useRouter } from "next/navigation";

const formatExamPurposeLabel = (value?: string) => {
  if (value === "persiapan_ukai") return "Persiapan UKAI";
  if (value === "persiapan_masuk_apoteker") return "Persiapan Masuk Apoteker";
  return "Lainnya";
};

export default function ApotekerDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmStart, setConfirmStart] = useState(false);
  const [selectPackage, setSelectPackage] = useState<ExamPackage>();

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} Menit`;
    return `${hours}j ${minutes}m`;
  };

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
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat data dashboard.",
        );
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

  const pendingByPackageId = useMemo(() => {
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
  }, [purchases]);

  const quickStartPackage = useMemo(
    () =>
      packages.find(
        (item) => item.price === 0 || activePackageIds.has(item.id),
      ) ?? null,
    [activePackageIds, packages],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard Peserta
          </h1>
          <p className="text-slate-500 font-medium">
            Selamat datang,{" "}
            <span className="text-sky-600">{user?.name ?? "-"}</span>
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm w-fit",
            activePackageIds.size > 0
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          )}
        >
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              activePackageIds.size > 0 ? "bg-emerald-500" : "bg-amber-500",
            )}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {activePackageIds.size > 0
              ? `${activePackageIds.size} Paket Aktif`
              : "Belum Ada Paket Aktif"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ProfileCard label="Email" value={user?.email ?? "-"} />
        <ProfileCard label="Target Skor" value={`${user?.targetScore ?? 0}`} />
        <ProfileCard
          label="Tujuan Ujian"
          value={formatExamPurposeLabel(user?.examPurpose)}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <Card className="border-none bg-linear-to-br from-sky-600 via-cyan-600 to-sky-700 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6" />
            Paket Ujian KSUKAI
          </CardTitle>
          <CardDescription className="text-sky-100">
            Paket gratis bisa langsung dimulai. Paket berbayar dibeli lewat
            checkout yang aman di website ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-sky-100">
            Riwayat order dan status pembayaran selalu bisa dipantau dari menu
            Pembelian.
          </p>
          {quickStartPackage ? (
            <Button
              onClick={() => {
                setConfirmStart(true);
                setSelectPackage(quickStartPackage);
              }}
              className="bg-white font-bold text-sky-700 hover:bg-sky-50"
            >
              <Play size={16} className="mr-2 fill-current" />
              Mulai {quickStartPackage.name}
            </Button>
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
            Aktivasi paket berbayar dilakukan per order dan hanya mengaktifkan
            paket yang dibayar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Memuat daftar paket...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {packages.map((pkg) => {
                const canStartPackage =
                  pkg.price === 0 || activePackageIds.has(pkg.id);
                const pendingOrder = pendingByPackageId.get(pkg.id);

                return (
                  <Card
                    key={pkg.id}
                    className="border border-slate-200 bg-white"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <CardDescription>{pkg.description}</CardDescription>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            pkg.price === 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-sky-100 text-sky-700",
                          )}
                        >
                          {pkg.question_count} soal
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-500">{pkg.features}</p>
                      <p className="text-xl font-bold text-slate-900">
                        {pkg.price === 0
                          ? "Gratis"
                          : `Rp ${Number(pkg.price).toLocaleString("id-ID")}`}
                      </p>
                      {canStartPackage ? (
                        <Button
                          onClick={() => {
                            setConfirmStart(true);
                            setSelectPackage(pkg);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Play size={16} className="mr-2 fill-current" />
                          Kerjakan
                        </Button>
                      ) : pendingOrder ? (
                        <Link
                          href={`/apoteker/checkout?transactionId=${pendingOrder.id}`}
                          className="block"
                        >
                          <Button className="w-full bg-amber-600 hover:bg-amber-700">
                            Lanjutkan Pembayaran
                          </Button>
                        </Link>
                      ) : (
                        <Link
                          href={`/apoteker/checkout?packageId=${pkg.id}`}
                          className="block"
                        >
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

      <ModalPreview
        open={confirmStart}
        onClose={() => setConfirmStart(false)}
        title="Konfirmasi Sesi Ujian"
        description="Langkah terakhir sebelum memulai perjuanganmu."
        maxWidth="md"
        footer={
          <div className="flex w-full gap-3 p-1">
            <Button
              variant="ghost"
              className="flex-1 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              onClick={() => setConfirmStart(false)}
            >
              Kembali
            </Button>
            <Button
              onClick={() =>
                router.push(`/apoteker/test?packageId=${selectPackage?.id}`)
              }
              className="flex-2 bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              Mulai Sekarang
            </Button>
          </div>
        }
      >
        <div className="space-y-8 px-1 py-2">
          {/* Header Info: Lebih Fluid */}
          <div className="relative flex justify-around items-center py-6 bg-slate-50/50 rounded-4xl overflow-hidden">
            {/* Decorative Blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-400/10 blur-3xl" />

            <div className="relative text-center space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500/60">
                Durasi
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <Clock size={16} className="text-slate-400" />
                <p className="text-2xl font-semibold text-slate-800 tracking-tighter">
                  {selectPackage?.question_count
                    ? formatDuration(selectPackage.question_count)
                    : "—"}
                </p>
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200" />

            <div className="relative text-center space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500/60">
                Kapasitas
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <Layers size={16} className="text-slate-400" />
                <p className="text-2xl font-semibold text-slate-800 tracking-tighter">
                  {selectPackage?.question_count ?? 0}{" "}
                  <span className="text-sm text-slate-400">Soal</span>
                </p>
              </div>
            </div>
          </div>

          {/* List Persiapan: Borderless & Airy */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                Protokol Ujian
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 gap-6 px-2">
              {[
                {
                  label: "Sesi Terkunci",
                  desc: "Dilarang refresh atau berpindah tab.",
                  icon: <WifiOff className="w-5 h-5" />,
                  color: "text-rose-500",
                  bg: "bg-rose-50",
                },
                {
                  label: "Sinkronisasi Server",
                  desc: "Waktu berjalan real-time meski offline.",
                  icon: <Timer className="w-5 h-5" />,
                  color: "text-amber-500",
                  bg: "bg-amber-50",
                },
                {
                  label: "Optimasi Perangkat",
                  desc: "Gunakan Chrome & Charger terpasang.",
                  icon: <Zap className="w-5 h-5" />,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 group">
                  <div
                    className={cn(
                      "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm",
                      item.bg,
                      item.color,
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                      {item.label}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-2">
            <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100/50">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                Sistem siap. Pastikan fokus Anda maksimal sebelum menekan
                tombol.
              </p>
            </div>
          </div>
        </div>
      </ModalPreview>
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
