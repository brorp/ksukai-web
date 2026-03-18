"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Loader2, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/lib/api/client";
import {
  clearPendingRegistration,
  savePendingRegistration,
} from "@/lib/registration-flow";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

type SessionWithGoogle = {
  googleIdToken?: string;
};

export default function GoogleAuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || hasStartedRef.current) return;

    const googleSession = session as
      | (typeof session & SessionWithGoogle)
      | null;
    const idToken = googleSession?.googleIdToken;

    if (!idToken) {
      setError("Sesi Google tidak lengkap. Silakan coba lagi.");
      return;
    }

    hasStartedRef.current = true;

    void (async () => {
      try {
        const result = await authApi.continueWithGoogle({ id_token: idToken });

        if (result.next_step === "login" && result.token && result.user) {
          clearPendingRegistration();
          setSession(result.token, result.user);
          await signOut({ redirect: false });
          router.replace("/apoteker/dashboard");
          return;
        }

        if (
          result.next_step === "complete_profile" &&
          result.registration_token &&
          result.registration
        ) {
          savePendingRegistration({
            registrationToken: result.registration_token,
            email: result.registration.email,
            name: result.registration.name,
            pictureUrl: result.registration.picture_url ?? null,
            source: "google",
            expiresAt: result.registration_token_expires_at,
          });
          await signOut({ redirect: false });
          router.replace("/profile");
          return;
        }

        setError("Respons autentikasi Google tidak lengkap.");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Autentikasi Google gagal.",
        );
        hasStartedRef.current = false;
      }
    })();
  }, [router, session, setSession, status]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px]" />
      </div>

      <Card className="relative w-full max-w-md overflow-hidden rounded-4xl border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
        <CardContent className="p-8 pt-12">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 opacity-20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-primary">
                {error ? (
                  <AlertCircle
                    size={36}
                    className="text-rose-500 animate-in zoom-in duration-300"
                  />
                ) : (
                  <ShieldCheck size={36} className="animate-pulse" />
                )}
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
              {error ? "Waduh, Ada Kendala" : "Menyiapkan Akun"}
            </h1>

            <p className="mb-8 text-sm leading-relaxed text-slate-500 max-w-70">
              {error
                ? "Terjadi kesalahan saat menghubungkan akun Google Anda."
                : "Tunggu sebentar ya, kami sedang memverifikasi data Anda untuk keamanan."}
            </p>

            {error && (
              <div className="mb-8 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-xs font-semibold text-rose-600 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {!error && (
              <div className="mb-10 flex items-center gap-3 rounded-full bg-slate-50 px-5 py-2 border border-slate-100">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Verifying Session...
                </span>
              </div>
            )}

            <div className="w-full space-y-3">
              <Button
                variant={error ? "default" : "ghost"}
                onClick={() => router.replace("/register")}
                className={cn(
                  "w-full h-12 rounded-2xl font-bold transition-all active:scale-95",
                  error
                    ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                {error ? (
                  "Coba Lagi"
                ) : (
                  <div className="flex items-center gap-2">
                    <ArrowLeft size={16} /> Kembali ke Registrasi
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>

        {!error && (
          <div className="h-1.5 w-full bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary animate-progress-loading w-full" />
          </div>
        )}
      </Card>

      <style jsx global>{`
        @keyframes progress-loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-progress-loading {
          animation: progress-loading 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
