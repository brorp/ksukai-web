"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Layers,
  Play,
  Timer,
  WifiOff,
  Zap,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  transactionApi,
  type ExamPackage,
  type ExamPackageExam,
  type PurchaseRecord,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { ModalPreview } from "@/components/preview-modal";

const getSessionLimitLabel = (value?: number | null) =>
  typeof value === "number" && value > 0
    ? `Maks. ${value} sesi`
    : "Sesi fleksibel";

export default function MyExamsPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
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
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        const [packageList, purchaseList] = await Promise.all([
          transactionApi.getPackages(),
          transactionApi.myTransactions(token),
        ]);
        setPackages(packageList);
        setPurchases(purchaseList);
      } catch (loadError) {
        toast.error(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat data ujian Anda."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const activePackageIds = useMemo(
    () =>
      new Set(
        purchases
          .filter((item) => item.access_status === "active")
          .map((item) => item.package_id)
      ),
    [purchases]
  );

  const purchasedPackages = packages.filter((pkg) => activePackageIds.has(pkg.id) || pkg.price === 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ujian Saya
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Daftar paket ujian yang telah Anda miliki.
          </p>
        </div>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <ClipboardList className="h-5 w-5" />
            Paket Aktif Anda
          </CardTitle>
          <CardDescription>
            Pilih paket dan ujian yang ingin Anda kerjakan di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Memuat ujian Anda...</p>
          ) : purchasedPackages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-sm font-medium text-slate-600">
                Anda belum memiliki paket ujian yang aktif.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Silahkan beli paket dari halaman Dashboard terlebih dahulu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {purchasedPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="border border-slate-200 bg-slate-50/50 shadow-sm transition hover:shadow-md"
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
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-1">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`pkg-${pkg.id}`} className="border-b-0">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center justify-between gap-3 w-full pr-2">
                              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                Mulai Kerjakan Ujian
                              </p>
                              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100">
                                {(pkg.exams ?? []).length} item
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3">
                            <div className="space-y-2 mt-1">
                              {(pkg.exams ?? []).length > 0 ? (
                                (pkg.exams ?? []).map((exam) => (
                                  <div
                                    key={exam.id}
                                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 shadow-sm"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="space-y-2">
                                        <p className="text-sm font-semibold text-slate-900">
                                          {exam.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                          <span className="rounded-full bg-white px-2.5 py-1 text-slate-500 border border-slate-100 shadow-sm">
                                            {exam.question_count} soal
                                          </span>
                                          <span className="rounded-full bg-white px-2.5 py-1 text-slate-500 border border-slate-100 shadow-sm">
                                            {getSessionLimitLabel(exam.session_limit)}
                                          </span>
                                        </div>
                                      </div>

                                      <Button
                                        onClick={() => {
                                          setConfirmStart(true);
                                          setSelectedExamState({
                                            packageItem: pkg,
                                            examItem: exam,
                                          });
                                        }}
                                        className="h-10 rounded-xl bg-emerald-600 px-4 text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 w-full sm:w-auto mt-2 sm:mt-0"
                                      >
                                        <Play size={14} className="mr-1.5 fill-current" />
                                        Mulai Sesi Ujian
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                                  Belum ada ujian yang ditautkan ke paket ini.
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              className="flex-2 bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-700 hover:to-sky-700 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              Mulai Sekarang
            </Button>
          </div>
        }
      >
        <div className="space-y-8 px-1 py-2">
          <div className="relative flex justify-around items-center py-6 bg-slate-50/50 rounded-4xl overflow-hidden">
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
