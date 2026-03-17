"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useAuthStore } from "@/lib/store/auth";
import GoogleAuthButton from "@/components/google-auth-button";
import { PasswordField } from "@/components/password-field";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authNotice = useAuthStore((state) => state.authNotice);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    const result = await login(data.email, data.password);

    if (!result.success) {
      setError(result.message ?? "Email atau password salah.");
      return;
    }

    const user = useAuthStore.getState().user;
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/apoteker/dashboard");
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
              className="h-48 w-auto object-contain"
            />
          </div>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.3em] mt-1">
            Portal Kumpulan Soal UKAI
          </p>
        </div>

        <Card className="shadow-[0_24px_60px_rgba(0,133,209,0.14)] border-slate-200/70 rounded-4xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardHeader className="pt-9 pb-2 text-center">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Masuk ke Dashboard
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Gunakan akun Anda untuk melanjutkan ujian.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {error || authNotice}
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

                <PasswordField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Masukkan Password"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full  hover:bg-primary-700 bg-primary text-white font-semibold h-12 rounded-xl shadow-lg shadow-primary/20 group transition-all"
                >
                  {isLoading ? "Memproses..." : "Masuk Sekarang"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-widest">
                  Atau
                </span>
              </div>
            </div>

            <GoogleAuthButton />

            <div className="mt-8 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                Belum memiliki akun?
              </p>
              <Link
                href="/register"
                className="text-primary hover:text-primary-600 text-sm font-semibold transition-colors"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-7 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          © 2026 KS UKAI
        </p>
      </div>
    </div>
  );
}
