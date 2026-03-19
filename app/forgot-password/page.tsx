"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/client";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const result = await authApi.forgotPassword(data.email);
      setSuccessMessage(
        result.delivered
          ? "Link reset password sudah dikirim. Silakan cek inbox email Anda."
          : result.warning || "Permintaan reset diterima, tetapi email belum berhasil dikirim.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Gagal mengirim link reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FF] p-4 relative overflow-hidden">
      <div className="absolute top-[-12%] left-[-8%] w-[34%] h-[34%] bg-primary/10 rounded-full blur-3xl opacity-70" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[42%] h-[42%] bg-cyan-100 rounded-full blur-3xl opacity-60" />

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
            Pemulihan Akses Akun
          </p>
        </div>

        <Card className="shadow-[0_24px_60px_rgba(0,133,209,0.14)] border-slate-200/70 rounded-4xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardHeader className="pt-9 pb-2 text-center">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Lupa Password
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Masukkan email akun manual Anda. Kami akan kirim link reset yang
              berlaku selama 15 menit.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {successMessage}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="nama@email.com"
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
                  {isSubmitting ? "Mengirim..." : "Kirim Link Reset Password"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center">
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
