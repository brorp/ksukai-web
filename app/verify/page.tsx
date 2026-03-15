import { Suspense } from "react";
import OTPComponent from "@/components/otp/page";

export const metadata = {
  title: "Verifikasi Email | KS UKAI",
  description: "Masukkan kode OTP untuk mengaktifkan akun CBT Anda",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          Memuat form verifikasi...
        </div>
      }
    >
      <OTPComponent />
    </Suspense>
  );
}
