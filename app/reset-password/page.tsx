"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/client";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [verifying, setVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak ditemukan.");
      setVerifying(false);
      return;
    }

    void (async () => {
      try {
        const result = await authApi.verifyResetPasswordToken(token);
        setVerifiedEmail(result.email);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Link reset password tidak valid.",
        );
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const result = await authApi.resetPassword(token, data.password);
      setSuccessMessage(
        `Password untuk ${result.email} berhasil diperbarui. Anda akan diarahkan ke login.`,
      );
      window.setTimeout(() => router.replace("/login"), 1800);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Gagal memperbarui password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FF] p-4 relative overflow-hidden">
      <div className="absolute top-[-12%] right-[-12%] w-[42%] h-[42%] bg-cyan-100 rounded-full blur-3xl opacity-70" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[34%] h-[34%] bg-primary/10 rounded-full blur-3xl opacity-70" />

      <div className="w-full max-w-115 z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="-mb-10">
            <Image
              src="/logo.png"
              alt="KSUKAI Logo"
              width={320}
              height={96}
              priority
              className="h-40 w-auto object-contain"
            />
          </div>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.3em] mt-1">
            Atur Password Baru
          </p>
        </div>

        <Card className="shadow-[0_24px_60px_rgba(0,133,209,0.14)] border-slate-200/70 rounded-4xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardHeader className="pt-9 pb-2 text-center">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Reset Password
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Buat password baru untuk akun email manual Anda.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-6 space-y-5">
            {verifying ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6 text-center text-sm text-slate-500">
                Memverifikasi link reset password...
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-4 rounded-xl">
                  {error}
                </div>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-600 text-sm font-semibold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Minta Link Baru
                </Link>
              </div>
            ) : successMessage ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-4 rounded-xl">
                {successMessage}
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-2 text-sky-600 shadow-sm">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                        Email Tujuan
                      </p>
                      <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {verifiedEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                            Password Baru
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="password"
                                placeholder="Minimal 6 karakter"
                                className="pl-11 h-12 bg-slate-50/70 border-slate-200 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                            Konfirmasi Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="password"
                                placeholder="Ulangi password baru"
                                className="pl-11 h-12 bg-slate-50/70 border-slate-200 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full hover:bg-primary-700 bg-primary text-white font-semibold h-12 rounded-xl shadow-lg shadow-primary/20 group transition-all"
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </Form>
              </>
            )}

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-600 text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
