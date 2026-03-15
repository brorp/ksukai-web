"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BadgeCheck,
  Lock,
  Mail,
  Phone,
  UserPlus,
} from "lucide-react";
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
import { registerSchema, type RegisterFormData } from "@/lib/schemas";
import { useAuthStore } from "@/lib/store/auth";

const PURPOSE_OPTIONS: Array<{
  label: string;
  value: "ukai" | "cpns" | "pppk" | "other";
}> = [
  { label: "UKAI", value: "ukai" },
  { label: "CPNS", value: "cpns" },
  { label: "PPPK", value: "pppk" },
  { label: "Lainnya", value: "other" },
];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [error, setError] = useState("");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      education: "",
      schoolOrigin: "",
      examPurpose: "persiapan_ukai",
      address: "",
      phone: "",
      targetScore: 75,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    const result = await register({
      name: data.name,
      email: data.email,
      password: data.password,
      education: data.education,
      school_origin: data.schoolOrigin,
      exam_purpose: data.examPurpose,
      address: data.address,
      phone: data.phone,
      target_score: Number(data.targetScore),
    });

    if (!result.success) {
      setError(result.message ?? "Gagal membuat akun.");
      return;
    }

    router.push("/apoteker/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FF] p-4 relative overflow-hidden">
      <div className="absolute top-[-12%] right-[-12%] w-[42%] h-[42%] bg-cyan-100 rounded-full blur-3xl opacity-70" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[34%] h-[34%] bg-sky-100 rounded-full blur-3xl opacity-70" />

      <div className="w-full max-w-195 z-10 py-8">
        <div className="flex flex-col items-center mb-7">
          <div className="bg-sky-600 p-3 rounded-2xl shadow-xl shadow-sky-200 mb-4">
            <BadgeCheck className="text-white h-8 w-8" />
          </div>
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em]">
            Peserta Registration Portal
          </p>
        </div>

        <Card className="shadow-[0_24px_60px_rgba(2,132,199,0.14)] border-slate-200/70 rounded-4xl overflow-hidden bg-white/95">
          <CardHeader className="pt-9 pb-2 text-center">
            <CardTitle className="text-2xl font-semibold text-slate-800">
              Daftar Akun Peserta
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Lengkapi data profil untuk aktivasi akun CBT.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              className="pl-10"
                              placeholder="nama@email.com"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pendidikan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="S1 Farmasi / Profesi Apoteker"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schoolOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asal Sekolah / Universitas</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama institusi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="examPurpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tujuan Ujian</FormLabel>
                        <FormControl>
                          <select
                            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            value={field.value}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value as
                                  | "ukai"
                                  | "cpns"
                                  | "pppk"
                                  | "other",
                              )
                            }
                          >
                            {PURPOSE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. HP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              className="pl-10"
                              placeholder="08xxxxxxxxxx"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Skor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={field.value}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="password"
                              className="pl-10"
                              placeholder="Minimal 6 karakter"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Ulangi password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input placeholder="Alamat lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-sky-100 group transition-all mt-2"
                >
                  {isLoading ? "Memproses..." : "Buat Akun"}
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>

            <div className="mt-7 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                Sudah punya akun?
              </p>
              <Link
                href="/login"
                className="text-sky-600 hover:text-sky-700 text-sm font-semibold"
              >
                Login di sini
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-7 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Data Anda akan digunakan untuk kebutuhan ujian CBT
        </p>
      </div>
    </div>
  );
}
