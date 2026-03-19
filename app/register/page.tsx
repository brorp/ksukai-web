"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import GoogleAuthButton from "@/components/google-auth-button";
import { authApi } from "@/lib/api/client";

const simpleRegisterSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email({ message: "Email tidak valid" }),
});

type SimpleRegisterData = z.infer<typeof simpleRegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SimpleRegisterData>({
    resolver: zodResolver(simpleRegisterSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SimpleRegisterData) => {
    setIsLoading(true);
    setError("");

    try {
      await authApi.reqEmailOtp(data.email);

      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengirim OTP. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
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
              alt="KS UKAI Logo"
              width={320}
              height={96}
              priority
              className="h-40 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Daftar <span className="text-primary">Akun</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.3em] mt-1">
            Mulai Persiapan UKAI Anda
          </p>
        </div>

        <Card className="shadow-[0_24px_60px_rgba(0,133,209,0.14)] border-slate-200/70 rounded-4xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardHeader className="pt-9 pb-2 text-center">
            <CardDescription className="font-medium text-slate-500 text-xs px-6">
              Pilih lanjut dengan Google atau verifikasi email terlebih dahulu.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-6">
            <div className="mb-6">
              <GoogleAuthButton intent="register" />

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-[0.2em]">
                    Atau via Email
                  </span>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase ml-1">
                        Alamat Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="nama@email.com"
                            className="pl-11 h-12 bg-slate-50/70 border-slate-200 rounded-xl focus:ring-primary transition-all"
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
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-primary/20 group transition-all"
                >
                  {isLoading ? "Mengirim OTP..." : "Lanjutkan dengan Email"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                Sudah punya akun?
              </p>
              <Link
                href="/login"
                className="text-primary hover:text-primary-700 text-sm font-semibold transition-colors"
              >
                Masuk Sekarang
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-7 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          © 2026 KSUKAI
        </p>
      </div>
    </div>
  );
}
