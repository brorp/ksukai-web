import { Suspense } from "react";
import { BadgeCheck } from "lucide-react";
import FormProfilePage from "@/components/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lengkapi Profil Peserta",
  description:
    "Finalisasi pendaftaran akun KSUKAI Anda untuk persiapan UKAI dan masuk profesi apoteker.",
  keywords: [
    "Daftar KSUKAI",
    "Profil Peserta UKAI",
    "Tryout Apoteker",
    "Persiapan Masuk Apoteker",
    "Pendaftaran Tryout Farmasi",
  ],
  openGraph: {
    title: "Lengkapi Profil Peserta | KSUKAI",
    description: "Satu langkah lagi untuk mulai simulasi CBT terbaik.",
    url: "https://kumpulansoalukai.com/profile",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};
export default function ProfilePage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FF] p-4 relative overflow-hidden">
      {/* Background Ornaments agar konsisten dengan Register & OTP */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-cyan-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[40%] h-[40%] bg-sky-100 rounded-full blur-3xl opacity-60" />

      <div className="w-full max-w-200 z-10 py-12">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#0085D1] p-3 rounded-2xl shadow-xl shadow-blue-200 mb-5 animate-in fade-in zoom-in duration-500">
            <BadgeCheck className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center">
            Sedikit Lagi <span className="text-[#0085D1]">Selesai!</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
            Lengkapi Profil Peserta KS UKAI
          </p>
        </div>

        {/* Client Component Profile Form */}
        <Suspense
          fallback={
            <div className="w-full h-125 bg-white/50 animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-medium">
              Menyiapkan formulir profil...
            </div>
          }
        >
          <FormProfilePage />
        </Suspense>

        <p className="text-center mt-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
          Data yang Anda masukkan akan digunakan untuk pencetakan <br />
          sertifikat tryout dan analisis skor.
        </p>
      </div>
    </div>
  );
}
