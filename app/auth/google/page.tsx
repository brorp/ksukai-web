"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api/client";
import {
  clearPendingRegistration,
  savePendingRegistration,
} from "@/lib/registration-flow";
import { useAuthStore } from "@/lib/store/auth";

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
    if (status !== "authenticated" || hasStartedRef.current) {
      return;
    }

    const googleSession = session as (typeof session & SessionWithGoogle) | null;
    const idToken = googleSession?.googleIdToken;

    if (!idToken) {
      setError("Sesi Google tidak lengkap. Silakan coba lagi.");
      return;
    }

    hasStartedRef.current = true;

    void (async () => {
      try {
        const result = await authApi.continueWithGoogle({
          id_token: idToken,
        });

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
            : "Autentikasi Google gagal. Silakan coba lagi.",
        );
        hasStartedRef.current = false;
      }
    })();
  }, [router, session, setSession, status]);

  return (
    <div className="min-h-screen bg-[#F4F8FF] px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-lg rounded-4xl border-slate-200/70 bg-white/95 shadow-[0_24px_60px_rgba(0,133,209,0.14)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-900">
            Menyiapkan akun Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {status === "loading" || status === "authenticated" ? (
            <p className="text-sm text-slate-500">
              Kami sedang memeriksa akun Google Anda dan menyiapkan langkah
              berikutnya.
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Sesi Google tidak ditemukan. Silakan mulai lagi dari halaman
              daftar atau login.
            </p>
          )}

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-center">
            <Button
              type="button"
              className="rounded-xl bg-[#0085D1] hover:bg-[#0070B0]"
              onClick={() => router.replace("/register")}
            >
              Kembali ke Registrasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
