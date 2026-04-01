"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: "Tentang Kami", target: "tentang-kami" },
  { label: "Keunggulan", target: "keunggulan" },
  { label: "Fitur Tryout", target: "fitur-tryout" },
  { label: "Testimoni", target: "testimoni" },
];

const trustStats = [
  {
    icon: BookOpenCheck,
    value: "7.500+",
    label: "Buku Terjual",
  },
  {
    icon: Users,
    value: "1.000+",
    label: "Calon Apoteker Telah Bergabung",
  },
  {
    icon: Award,
    value: "Best Seller",
    label: "2021-2025",
  },
];

const advantageCards = [
  {
    icon: MonitorSmartphone,
    title: "Sistem CBT Realistis",
    description:
      "Mengerjakan 200 soal dengan interface dan timer yang mensimulasikan kondisi ujian UKMPPAI sesungguhnya.",
  },
  {
    icon: ShieldCheck,
    title: "Fokus Blueprint Nasional",
    description:
      "Materi soal dikurasi ketat oleh lulusan terbaik S2 dan praktisi, memastikan akurasi dengan standar Kemenkes & IAI.",
  },
  {
    icon: ClipboardCheck,
    title: "Pembahasan Komprehensif",
    description:
      "Tidak hanya tahu jawaban yang benar, tapi pahami alasannya dengan pustaka acuan ter-update.",
  },
];

const tryoutFeatures = [
  {
    title: "Timer & pacing seperti ujian asli",
    description:
      "Latih fokus, ritme, dan strategi menjawab sebelum hari H tiba.",
  },
  {
    title: "Pembahasan mudah dipelajari ulang",
    description:
      "Setiap latihan membantu Anda belajar, bukan sekadar menebak hasil.",
  },
  {
    title: "Akses cepat dari laptop maupun mobile",
    description:
      "Tetap latihan dari mana saja saat butuh sesi belajar yang ringkas.",
  },
];

const aboutPillars = [
  {
    icon: Award,
    eyebrow: "Visi",
    title:
      "Membantu calon apoteker mencapai standar kompetensi nasional dan lulus UKMPPAI CBT & OSCE.",
    description:
      "KS UKAI dibangun untuk menjembatani proses belajar yang lebih tepat sasaran, selaras dengan standar Kemenkes & IAI.",
  },
  {
    icon: BookOpenCheck,
    eyebrow: "Misi",
    title:
      "Menyediakan solusi belajar terbaik melalui buku dan bimbel yang sistematis, update, dan sesuai blueprint resmi.",
    description:
      "Setiap materi, tryout, dan pembahasan dirancang agar peserta bisa belajar lebih efisien tanpa kehilangan kedalaman konsep.",
  },
];

const founders = [
  {
    name: "Mathias Lourdion Kusnaman",
    campus: "ITB • Founder KS UKAI",
    imageUrl:
      "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/lourdion_-p1RDZG3O",
    summary:
      "Alumnus Sains dan Teknologi Farmasi ITB yang melanjutkan Profesi Apoteker di kampus yang sama. Pada UKAI CBT periode X September 2021, ia meraih nilai 85,5 dengan selisih sangat tipis dari nilai tertinggi nasional 86.",
    highlights: [
      "Nilai UKAI hampir sempurna dan menjadi yang tertinggi di ITB pada periodenya",
      "Berpengalaman di industri farmasi sebagai formulation scientist",
      "Melanjutkan studi Master of Pharmaceutical Science di Monash University, Australia",
      "Aktif mengajar dan membimbing calon apoteker",
    ],
  },
  {
    name: "Christopher Wijaya",
    campus: "ITB • Founder KS UKAI",
    imageUrl:
      "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/chris_xSU2HLiBS",
    summary:
      "Lulusan Sains dan Teknologi Farmasi ITB yang menuntaskan Profesi Apoteker ITB dengan predikat Cum Laude. Ia aktif mengajar calon apoteker dari berbagai universitas dan mengikuti perkembangan UKMPPAI CBT & OSCE secara langsung.",
    highlights: [
      "Mahasiswa Berprestasi ITB 2017 dan Peserta Sidang Terbaik Sekolah Farmasi ITB 2020",
      "Lulus Apoteker ITB Cum Laude dengan IPK 3,92",
      "Aktif menyusun materi belajar yang sistematis dan selaras blueprint resmi",
      "Fokus membimbing calon apoteker menuju kelulusan nasional",
    ],
  },
];

const testimonials = [
  {
    quote:
      "Materi yang diberikan sesuai dengan blueprint, ppt-nya lengkap dan mudah untuk dibaca-baca kembali, latihan soal banyaaakk ada pre test dan post test, sangat membantu untuk latihan.",
    name: "Binti Sholihatin",
    campus: "Universitas Mulawarman",
    imageUrl: "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/binti_9UWEMfPGi.png",
  },
  {
    quote:
      "Cakupan materi pada buku sesuai blueprint UKMPPAI. Buku ini cocok banget buat recall materi dan memperkuat ingatan pasca belajar. Soal-soalnya cenderung sederhana, jadi bisa dipakai untuk memperkuat pemahaman dasar. Aku rekomendasiin buku soal KS untuk kalian yang mau ngulang materi yang menyenangkan dan ga bikin tertekan.",
    name: "Celine Aurellia",
    campus: "Universitas Gadjah Mada",
    imageUrl: "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/celine_7iAu8zmUq.png",
  },
  {
    quote:
      "Soalnya sangat membantu dan bagus. Sangat membantu dalam saya melewati UKMPPAI CBT dan OSCE.",
    name: "Kurnia Sandy",
    campus: "Universitas Pertahanan RI",
    imageUrl: "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/kurnia_PtmrEkI72.png",
  },
  {
    quote:
      "Latihan soalnya mantap, banyak yang mirip dengan CBT. Great job KS UKAI",
    name: "Ahmad Prakoso",
    campus: "Institut Teknologi Bandung",
    imageUrl: "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/ahmad%20prakoso_q4gzsW5Nt.png",
  },
  {
    quote:
      "Soalnya bervariasi dan penjelasannya mudah dipahami. Semuanya sesuai Blueprint dan keluar di hari H ujian!",
    name: "Diaz Andhini",
    campus: "Universitas Setia Budi",
    imageUrl: "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/diaz_UmNsDvFye.png",
  },
  {
    quote:
      "Buku KS UKAI ini sangat membantu aku dalam belajar dan mempersiapkan UKAI. Kumpulan soalnya sesuai dengan blueprint UKAI dan juga dilengkapi dengan kunci jawaban dengan pembahasan soal yang mudah dipahami. Tentunya itu sangat membantu aku untuk memahami soal-soal yang masih belum bisa aku jawab. Terima kasih Kak Chris dan Kak Dion juga team yang menyusun buku ini dengan begitu rapi dan sistematis.",
    name: "Silva Izza",
    campus: "Universitas Bhakti Kencana",
    imageUrl: "https://ik.imagekit.io/fjaskqdnu0xp/ksukai/silva_zdYOkBnze.png",
  },
];

const FREE_TRYOUT_HREF = "/tryout?intent=free";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const isMobile = useIsMobile();
  const testimonialCardsPerView = isMobile ? 1 : 2;
  const testimonialMaxIndex = Math.max(
    0,
    testimonials.length - testimonialCardsPerView,
  );
  const testimonialSlideCount = testimonialMaxIndex + 1;

  useEffect(() => {
    setActiveTestimonialIndex((current) =>
      Math.min(current, testimonialMaxIndex),
    );
  }, [testimonialMaxIndex]);

  useEffect(() => {
    if (testimonialSlideCount <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex((current) =>
        current >= testimonialMaxIndex ? 0 : current + 1,
      );
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [testimonialMaxIndex, testimonialSlideCount]);

  const showTestimonialControls = testimonialSlideCount > 1;
  const handlePreviousTestimonial = () => {
    setActiveTestimonialIndex((current) =>
      current === 0 ? testimonialMaxIndex : current - 1,
    );
  };
  const handleNextTestimonial = () => {
    setActiveTestimonialIndex((current) =>
      current >= testimonialMaxIndex ? 0 : current + 1,
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-800">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <nav className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl shadow-[0_4px_12px_rgba(26,54,93,0.18)] transition-transform duration-300 group-hover:-rotate-3">
              <Image
                src="/logo.png"
                alt="Logo KS UKAI"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="text-left">
              <p className="text-base font-black uppercase tracking-[0.3em] text-[#1A365D] sm:text-lg">
                KS{" "}
                <span className="rounded-full bg-[#FBBF24] px-2 py-1 text-[#1A365D]">
                  UKAI
                </span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Kumpulan Soal UKAI
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.target}
                href={`#${item.target}`}
                className="text-sm font-semibold text-slate-600 transition hover:text-[#1A365D]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/tryout"
              className="pointer-events-auto inline-flex items-center justify-center rounded-full border border-[#1A365D]/20 px-5 py-2.5 text-sm font-semibold text-[#1A365D] transition hover:border-[#1A365D] hover:bg-[#1A365D]/5"
            >
              Login
            </Link>
            <Link
              href={FREE_TRYOUT_HREF}
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#FBBF24] px-5 py-2.5 text-sm font-bold text-[#1A365D] shadow-[0_14px_35px_rgba(251,191,36,0.35)] transition hover:-translate-y-0.5 hover:bg-[#f5b100]"
            >
              Coba Gratis
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Buka menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </nav>

        {mobileMenuOpen ? (
          <div className="pointer-events-auto border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.target}
                  href={`#${item.target}`}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/tryout"
                className="inline-flex items-center justify-center rounded-2xl border border-[#1A365D]/20 px-4 py-3 text-sm font-semibold text-[#1A365D]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href={FREE_TRYOUT_HREF}
                className="inline-flex items-center justify-center rounded-2xl bg-[#FBBF24] px-4 py-3 text-sm font-bold text-[#1A365D]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Coba Gratis
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <section className="relative overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#FBBF24]/14 blur-3xl" />
        <div className="pointer-events-none absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[#1A365D]/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-[-8rem] h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1A365D]/10 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#1A365D] shadow-sm">
            <Sparkles className="h-4 w-4 text-[#FBBF24]" />
            Platform Tryout Online #1 untuk Calon Apoteker
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight text-[#1E293B] sm:text-5xl lg:text-6xl text-center mx-auto">
            Lulus UKMPPAI CBT &amp; OSCE Lebih Mudah dan Percaya Diri Bersama{" "}
            <span className="relative inline-block text-[#1A365D]">
              KS UKAI.
              <span className="absolute inset-x-1 bottom-1 -z-10 h-3 rounded-full bg-[#FBBF24]/35" />
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg mx-auto text-center">
            Platform Tryout Online #1 untuk Calon Apoteker Indonesia. Sistem
            CBT dirancang khusus menyerupai ujian asli dan disusun berdasarkan
            Blueprint UKMPPAI terbaru.
          </p>

          <div className="relative z-30 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={FREE_TRYOUT_HREF}
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#FBBF24] px-7 py-4 text-base font-black text-[#1A365D] shadow-[0_18px_40px_rgba(251,191,36,0.38)] transition hover:-translate-y-0.5 hover:bg-[#f5b100]"
            >
              Mulai Test Gratis Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/tryout"
              className="pointer-events-auto inline-flex items-center justify-center rounded-full border border-[#1A365D]/15 bg-white px-7 py-4 text-base font-semibold text-[#1A365D] transition hover:border-[#1A365D] hover:bg-[#1A365D]/5"
            >
              Login ke Panel Tryout
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-600 mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Simulasi soal bergaya CBT
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Pembahasan dan referensi ter-update
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Uji Coba Gratis
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-16 sm:-mt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pointer-events-none relative mx-auto w-full max-w-5xl select-none">
          <div className="absolute -left-6 top-10 hidden rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-[0_22px_50px_rgba(15,23,42,0.12)] backdrop-blur lg:block z-30">
            <div className="flex items-center gap-3">
              {/* <div className="rounded-2xl bg-[#1A365D] p-2">
                <Clock3 className="h-5 w-5 text-[#FBBF24]" />
              </div> */}
              {/* <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Timer CBT
                </p>
                <p className="text-lg font-black text-[#1A365D]">180 Menit</p>
              </div> */}
            </div>
          </div>

          {/* <div className="absolute -right-6 bottom-16 z-30 hidden rounded-[2rem] bg-[#1A365D] p-5 text-white shadow-[0_22px_55px_rgba(26,54,93,0.28)] lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
              Siap Hari H
            </p>
            <p className="mt-2 text-2xl font-black">200 Soal</p>
            <p className="mt-1 max-w-[12rem] text-sm leading-6 text-slate-200">
              Latih konsistensi dengan alur yang terasa familiar sejak sesi
              pertama.
            </p>
          </div> */}

          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_35px_100px_rgba(15,23,42,0.12)] sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,rgba(26,54,93,0.96)_0%,rgba(15,23,42,0.92)_100%)]" />

            <div className="relative z-10">
              <div className="flex flex-col gap-4 rounded-[2rem] bg-white/10 p-1.5 sm:flex-row sm:items-center sm:justify-between border border-white/5 shadow-sm">
                <div className="flex min-w-0 flex-1 items-center gap-4 rounded-[1.5rem] bg-white px-4 py-2.5 shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Logo KS UKAI"
                    width={84}
                    height={84}
                    className="h-9 w-auto object-contain sm:h-11"
                    priority
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 sm:text-[11px]">
                      Mockup Dashboard CBT
                    </p>
                    <p className="truncate text-base font-black text-[#1A365D]">
                      Ujian Tryout Gratis
                    </p>
                  </div>
                </div>

                <div className="inline-flex w-fit self-start sm:self-auto rounded-[1.5rem] bg-[#FBBF24] px-5 py-2.5 text-left text-[#1A365D] shadow-sm sm:shrink-0 sm:text-right mr-1.5 border border-[#FBBF24]/50">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em]">
                      Blueprint
                    </p>
                    <p className="text-base font-black">UKMPPAI</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-400">
                        Sesi Ujian Aktif
                      </p>
                      <p className="text-xl font-black text-slate-900 mt-1">
                        Farmakoterapi Klinis
                      </p>
                    </div>
                    <div className="w-fit rounded-full bg-[#1A365D] px-4 py-1.5 text-sm font-bold text-white shadow-sm">
                      01:59:32
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.8rem] border border-white bg-white p-5 sm:p-7 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                          Soal 78 dari 200
                        </p>
                        <p className="mt-3 text-base font-semibold leading-relaxed text-slate-700">
                          Antibiotik empiris yang paling tepat untuk kasus
                          pneumonia komunitas pada pasien dengan komorbid memburuk kondisinya adalah...
                        </p>
                      </div>
                      <div className="hidden shrink-0 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 lg:block shadow-sm">
                        Tersimpan
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {["A", "B", "C", "D", "E"].map((option, index) => (
                        <div
                          key={option}
                          className={`flex items-center gap-4 rounded-2xl border px-4 py-3 text-base font-medium transition-colors ${
                            index === 1
                              ? "border-[#FBBF24] bg-[#FBBF24]/12 text-[#1A365D]"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-sm ${
                              index === 1
                                ? "bg-[#1A365D] text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {option}
                          </div>
                          <span>
                            {index === 1
                              ? "Amoksisilin-klavulanat + azitromisin"
                              : "Pilihan jawaban simulasi CBT yang sesuai blueprint"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[2rem] bg-[#1A365D] p-6 text-white shadow-md">
                    <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-200">
                      Ringkasan Belajar
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex flex-col items-center justify-center rounded-[1.25rem] bg-white/10 p-3 sm:p-4 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-200 sm:text-xs">
                          Hasil Ujian
                        </p>
                        <p className="mt-1 text-lg font-black">
                          Instan Skoring
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-[1.25rem] bg-white/10 p-3 sm:p-4 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-200 sm:text-xs">
                          Review Ujian
                        </p>
                        <p className="mt-1 text-lg font-black">
                          Lengkap
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-400">
                      Progress Panel
                    </p>
                    <div className="mt-5 grid grid-cols-5 gap-2.5">
                      {[...Array(15)].map((_, index) => (
                        <div
                          key={`progress-${index + 1}`}
                          className={`flex h-10 sm:h-11 items-center justify-center rounded-xl text-sm font-black shadow-sm ${
                            index < 8
                              ? "bg-[#1A365D] text-white"
                              : index < 11
                                ? "bg-[#FBBF24]/20 text-[#1A365D]"
                                : "bg-slate-50 text-slate-400 border border-slate-100"
                          }`}
                        >
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-[1.25rem] bg-slate-50 p-5 text-sm font-medium leading-relaxed text-slate-600 border border-slate-100">
                      Interface ini dibuat menyerupai CBT asli dengan layout responsif untuk kenyamanan berlatih maksimal.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <a
        href="https://wa.me/6285171241417"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi KS UKAI via WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-[0_20px_45px_rgba(37,211,102,0.32)] transition hover:-translate-y-1 hover:bg-[#20c25c] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18">
          <MessageCircle className="h-6 w-6" />
        </span>
        <span className="hidden sm:block">
          Chat WhatsApp
        </span>
      </a>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:grid-cols-3 sm:p-7">
            {trustStats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A365D] text-[#FBBF24] shadow-sm">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#1A365D]">
                      {item.value}
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="tentang-kami"
        className="scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#1A365D]">
                About Us
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#1E293B] sm:text-4xl">
                Dibangun untuk calon apoteker yang ingin belajar lebih terarah,
                percaya diri, dan siap menghadapi standar nasional.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                KS UKAI merupakan one-stop learning solution untuk persiapan
                UKMPPAI CBT &amp; OSCE. Kami menggabungkan buku, bimbel, dan
                tryout dalam satu ekosistem belajar yang sistematis, update,
                dan relevan dengan blueprint resmi.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#1A365D] px-4 py-2 text-sm font-semibold text-white">
                  <Users className="h-4 w-4 text-[#FBBF24]" />
                  Praktisi & akademisi berprestasi dari ITB
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  <Sparkles className="h-4 w-4 text-[#1A365D]" />
                  Selaras Kemenkes, IAI, dan blueprint UKMPPAI
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {aboutPillars.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.eyebrow}
                    className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1A365D] text-[#FBBF24] shadow-sm">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#1A365D]">
                          {item.eyebrow}
                        </p>
                        <h3 className="mt-2 text-xl font-black leading-snug text-[#1E293B]">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-10 rounded-[2.25rem] border border-slate-200 bg-[linear-gradient(135deg,#0f2744_0%,#1A365D_60%,#264f82_100%)] p-6 text-white shadow-[0_24px_60px_rgba(26,54,93,0.22)] sm:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-slate-200">
                Tentang Founder
              </p>
              <h3 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">
                Dibangun oleh praktisi dan akademisi berprestasi yang memahami
                medan UKMPPAI dari ruang kelas sampai dunia industri.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-200">
                KS UKAI lahir dari pengalaman nyata dalam menghadapi ujian,
                mengajar, dan menyusun materi yang relevan untuk calon apoteker
                Indonesia.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {founders.map((founder) => {
                return (
                  <article
                    key={founder.name}
                    className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-sm">
                        <img
                          src={founder.imageUrl}
                          alt={founder.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xl font-black text-white">
                          {founder.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                          {founder.campus}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-100">
                      {founder.summary}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {founder.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="inline-flex items-start gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-2 text-sm text-slate-100"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FBBF24]" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="keunggulan"
        className="scroll-mt-28 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#1A365D]">
              Mengapa Memilih KS UKAI
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#1E293B] sm:text-4xl">
              Mengapa Tryout KS UKAI Menjadi Pilihan Terbaik?
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Setiap elemen dirancang untuk membantu Anda berlatih lebih
              strategis, lebih tenang, dan lebih siap menghadapi pola soal yang
              menuntut ketelitian tinggi.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {advantageCards.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A365D] text-[#FBBF24] shadow-sm transition group-hover:scale-105">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-[#1E293B]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="fitur-tryout"
        className="scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#1A365D]">
              Fitur Tryout
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#1E293B] sm:text-4xl">
              Belajar lebih terarah dengan simulasi yang terasa seperti sistem
              ujian sesungguhnya.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Cocok untuk peserta yang ingin tahu level kesiapan mereka,
              memperbaiki kelemahan lebih cepat, dan masuk ke hari ujian dengan
              rasa percaya diri yang lebih tinggi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1A365D] px-4 py-2 text-sm font-semibold text-white">
                <Star className="h-4 w-4 text-[#FBBF24]" />
                Blueprint UKMPPAI terbaru
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                <Clock3 className="h-4 w-4 text-[#1A365D]" />
                Compact, cepat, dan fokus
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {tryoutFeatures.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FBBF24]/15 text-lg font-black text-[#1A365D]">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1E293B]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1A365D]">
                      Pelajari lebih cepat
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="testimoni"
        className="scroll-mt-28 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#1A365D]">
              Testimoni
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#1E293B] sm:text-4xl">
              Kata Mereka yang Telah Lulus Bersama KS UKAI
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Testimoni berikut diambil dari e-Catalogue KS UKAI Agustus 2025
              dan ditampilkan dalam carousel agar tetap ringkas di mobile.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.07)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#1A365D] px-4 py-2 text-sm font-semibold text-white">
                  <Quote className="h-4 w-4 text-[#FBBF24]" />
                  TESTIMONI
                </div>
              </div>

              {showTestimonialControls ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePreviousTestimonial}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-[#1A365D] transition hover:border-[#1A365D] hover:bg-[#1A365D]/5"
                    aria-label="Testimoni sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextTestimonial}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-[#1A365D] transition hover:border-[#1A365D] hover:bg-[#1A365D]/5"
                    aria-label="Testimoni berikutnya"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-6 overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  width: `${(testimonials.length / testimonialCardsPerView) * 100}%`,
                  transform: `translateX(-${(activeTestimonialIndex * 100) / testimonials.length}%)`,
                }}
              >
                {testimonials.map((item) => {
                  const initials = item.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <div
                      key={item.name}
                      className="shrink-0 px-2"
                      style={{ width: `${100 / testimonials.length}%` }}
                    >
                      <article className="flex h-full min-h-[22rem] flex-col rounded-[2rem] border border-slate-200 bg-slate-50/70 p-6 sm:p-7">
                        <div className="flex items-center gap-4">
                          {item.imageUrl ? (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-sm">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1A365D] text-lg font-black text-[#FBBF24] shadow-sm">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1 text-[#FBBF24]">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={`${item.name}-star-${index + 1}`}
                                  className="h-4 w-4 fill-current"
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                              Peserta KS UKAI
                            </p>
                          </div>
                        </div>

                        <p className="mt-6 text-base font-semibold leading-8 text-slate-700">
                          “{item.quote}”
                        </p>

                        <div className="mt-auto border-t border-dashed border-slate-200 pt-5">
                          <p className="text-base font-black text-[#1A365D]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {item.campus}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>

            {showTestimonialControls ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: testimonialSlideCount }).map((_, index) => (
                  <button
                    key={`testimonial-dot-${index + 1}`}
                    type="button"
                    onClick={() => setActiveTestimonialIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeTestimonialIndex
                        ? "w-8 bg-[#1A365D]"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Ke testimoni ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#1A365D] px-6 py-10 text-white shadow-[0_30px_80px_rgba(26,54,93,0.35)] sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-slate-200">
                Siap Meraih Nilai UKAI Tertinggi?
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                Siap Meraih Nilai UKAI Tertinggi? Jangan biarkan waktu terbuang.
                Uji kesiapanmu sekarang dengan simulasi sistem CBT terbaik.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                Mulai dari paket gratis untuk melihat langsung bagaimana sistem
                bekerja, lalu lanjutkan persiapanmu dengan ritme belajar yang
                lebih percaya diri.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <Link
                href={FREE_TRYOUT_HREF}
                className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#FBBF24] px-7 py-4 text-base font-black text-[#1A365D] shadow-[0_18px_40px_rgba(251,191,36,0.38)] transition hover:-translate-y-0.5 hover:bg-[#f5b100]"
              >
                Ambil Tryout Gratis Saya
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100">
                <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                Cocok untuk persiapan CBT &amp; OSCE
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 Kumpulan Soal UKAI. All rights reserved.</p>
          <p>kumpulansoalukai@gmail.com | 0851-7124-1417</p>
          <a
            href="https://instagram.com/kumpulansoalukai"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#1A365D] transition hover:text-[#FBBF24]"
          >
            Instagram @kumpulansoalukai
          </a>
        </div>
      </footer>
    </main>
  );
}
