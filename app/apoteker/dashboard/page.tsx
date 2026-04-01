"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Crown,
  Layers,
  LogOut,
  Play,
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
  type ExamPackageExam,
  type PurchaseRecord,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { ModalPreview } from "@/components/preview-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formatExamPurposeLabel = (value?: string) => {
  if (value === "persiapan_ukai") return "Persiapan UKAI";
  if (value === "persiapan_masuk_apoteker") return "Persiapan Masuk Apoteker";
  return "Lainnya";
};

const getPackageHighlights = (value?: string) =>
  (value ?? "")
    .split(/\r?\n|•|,|\|/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

const getSessionLimitLabel = (value?: number | null) =>
  typeof value === "number" && value > 0
    ? `Maks. ${value} sesi`
    : "Sesi fleksibel";

export default function ApotekerDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmStart, setConfirmStart] = useState(false);
  const [selectedExamState, setSelectedExamState] = useState<{
    packageItem: ExamPackage;
    examItem: ExamPackageExam;
  } | null>(null);

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} Menit`;
    return `${hours}j ${minutes}m`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchProfile();
        const [packageList, purchaseList] = await Promise.all([
          transactionApi.getPackages(),
          token ? transactionApi.myTransactions(token) : Promise.resolve([]),
        ]);
        setPackages(packageList);
        setPurchases(purchaseList);
      } catch (loadError) {
        toast.error(
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
        <div className="flex flex-wrap items-center gap-2">
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
          <Button
            variant="outline"
            className="rounded-full border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
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

      <Card className="border-none bg-linear-to-br from-sky-600 via-sky-700 to-sky-800 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl mb-1">
            <Crown className="h-6 w-6 text-sky-200" />
            Informasi & Alur Ujian CBT KSUKAI
          </CardTitle>
          <CardDescription className="text-sky-100/90 text-sm md:text-base leading-relaxed max-w-3xl">
            Selamat datang di portal ujian KSUKAI. Mohon perhatikan tata cara berikut untuk kelancaran proses ujian Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm text-sky-50 mt-2">
            <li className="flex gap-3 items-start bg-white/10 p-4 rounded-2xl border border-white/5">
              <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-bold shadow-sm">1</div>
              <p className="leading-relaxed">Pastikan <strong className="text-white">koneksi internet stabil</strong> sebelum memulai ujian untuk menghindari terputusnya sesi secara tiba-tiba.</p>
            </li>
            <li className="flex gap-3 items-start bg-white/10 p-4 rounded-2xl border border-white/5">
              <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-bold shadow-sm">2</div>
              <p className="leading-relaxed">Paket gratis dapat langsung dikerjakan. Paket berbayar akan aktif otomatis setelah <strong className="text-white">pembayaran terverifikasi</strong>.</p>
            </li>
            <li className="flex gap-3 items-start bg-white/10 p-4 rounded-2xl border border-white/5">
              <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-bold shadow-sm">3</div>
              <p className="leading-relaxed">Waktu berjalan otomatis. <strong className="text-white">Timer tidak akan berhenti</strong> meskipun Anda keluar dari layar ujian.</p>
            </li>
          </ul>
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
                const packageHighlights = getPackageHighlights(
                  `${pkg.description}\n${pkg.features}`,
                );

                return (
                  <Card
                    key={pkg.id}
                    className="border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                                pkg.price === 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-sky-100 text-sky-700",
                              )}
                            >
                              {pkg.price === 0 ? "Gratis" : "Premium"}
                            </span>
                          </div>
                          <CardDescription className="text-sm leading-relaxed text-slate-500">
                            {pkg.description || "Paket tryout terstruktur untuk latihan UKAI."}
                          </CardDescription>
                        </div>
                        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                            Harga
                          </p>
                          <p className="mt-1 text-lg font-black">
                            {pkg.price === 0
                              ? "Gratis"
                              : `Rp ${Number(pkg.price).toLocaleString("id-ID")}`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-500">
                          {pkg.question_count} soal
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-500">
                          {(pkg.exams ?? []).length} ujian
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-500">
                          {getSessionLimitLabel(pkg.session_limit)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {packageHighlights.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {packageHighlights.map((highlight) => (
                            <span
                              key={highlight}
                              className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Daftar Ujian di Paket
                          </p>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
                            {(pkg.exams ?? []).length} item
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {(pkg.exams ?? []).length > 0 ? (
                            (pkg.exams ?? []).map((exam) => (
                              <div
                                key={exam.id}
                                className="rounded-xl border border-white bg-white p-3 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-900">
                                      {exam.name}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-500">
                                        {exam.question_count} soal
                                      </span>
                                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-500">
                                        {getSessionLimitLabel(exam.session_limit)}
                                      </span>
                                    </div>
                                    {exam.description ? (
                                      <p className="text-xs leading-relaxed text-slate-500">
                                        {exam.description}
                                      </p>
                                    ) : null}
                                  </div>

                                  {canStartPackage ? (
                                    <Button
                                      onClick={() => {
                                        setConfirmStart(true);
                                        setSelectedExamState({
                                          packageItem: pkg,
                                          examItem: exam,
                                        });
                                      }}
                                      className="h-10 rounded-xl bg-emerald-600 px-4 text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700"
                                    >
                                      <Play size={14} className="mr-1.5 fill-current" />
                                      Kerjakan
                                    </Button>
                                  ) : (
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                                      Aktivasi dulu
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                              Belum ada ujian yang ditautkan ke paket ini.
                            </div>
                          )}
                        </div>
                      </div>

                      {canStartPackage ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-medium text-emerald-700">
                          Paket aktif. Pilih salah satu ujian di atas untuk mulai tryout.
                        </div>
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
                          <Button className="w-full bg-primary-600 hover:bg-primary-700">
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
                router.push(
                  `/apoteker/test?packageId=${selectedExamState?.packageItem.id}&examId=${selectedExamState?.examItem.id}`,
                )
              }
              className="flex-2 bg-linear-to-r from-primary-600 to-primary-600 hover:from-sky-700 hover:to-primary-700 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
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
                  {selectedExamState?.examItem.question_count
                    ? formatDuration(selectedExamState.examItem.question_count)
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
                  {selectedExamState?.examItem.question_count ?? 0}{" "}
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
                {selectedExamState?.packageItem.name ?? "Paket"} •{" "}
                {selectedExamState?.examItem.name ?? "Ujian"}
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
