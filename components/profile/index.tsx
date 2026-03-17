"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  GraduationCap,
  School,
  Target,
  ClipboardList,
  MapPin,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registrationApi } from "@/lib/api/client";
import {
  clearPendingRegistration,
  getPendingRegistration,
} from "@/lib/registration-flow";
import { useAuthStore } from "@/lib/store/auth";

const profileSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    education: z.string().min(1, "Pendidikan wajib diisi"),
    schoolOrigin: z.string().min(1, "Asal institusi wajib diisi"),
    examPurpose: z.enum([
      "persiapan_ukai",
      "persiapan_masuk_apoteker",
      "lainnya",
    ]),
    address: z.string().min(5, "Alamat minimal 5 karakter"),
    phone: z.string().min(10, "No. HP tidak valid"),
    targetScore: z.number().min(0).max(100),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;

const PURPOSE_OPTIONS = [
  { label: "Persiapan UKAI", value: "persiapan_ukai" },
  {
    label: "Persiapan Masuk Apoteker",
    value: "persiapan_masuk_apoteker",
  },
  { label: "Lainnya", value: "lainnya" },
] as const;

export default function RegisterProfileForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [authSource, setAuthSource] = useState<"email" | "google">("email");
  const [isReady, setIsReady] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      education: "",
      schoolOrigin: "",
      examPurpose: "persiapan_ukai",
      address: "",
      phone: "",
      targetScore: 75,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const pendingRegistration = getPendingRegistration();

    if (!pendingRegistration) {
      router.replace("/register");
      return;
    }

    setPendingEmail(pendingRegistration.email);
    setAuthSource(pendingRegistration.source);
    setIsReady(true);

    form.reset({
      name: pendingRegistration.name || "",
      education: "",
      schoolOrigin: "",
      examPurpose: "persiapan_ukai",
      address: "",
      phone: "",
      targetScore: 75,
      password: "",
      confirmPassword: "",
    });
  }, [form, router]);

  const onSubmit = async (data: ProfileFormData) => {
    setError("");

    const pendingRegistration = getPendingRegistration();
    if (!pendingRegistration) {
      setError("Sesi registrasi tidak ditemukan. Silakan mulai lagi.");
      router.replace("/register");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registrationApi.complete({
        registration_token: pendingRegistration.registrationToken,
        name: data.name,
        password: data.password,
        education: data.education,
        school_origin: data.schoolOrigin,
        exam_purpose: data.examPurpose,
        address: data.address,
        phone: data.phone,
        target_score: data.targetScore,
      });

      if (!result.user) {
        throw new Error("Profil pengguna tidak ditemukan pada response.");
      }

      clearPendingRegistration();
      setSession(result.token, result.user);
      router.push("/apoteker/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Pendaftaran gagal. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="w-full h-125 bg-white/50 animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-medium">
        Menyiapkan formulir profil...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 text-sky-600 shadow-sm">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                Metode Registrasi
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {authSource === "google"
                  ? "Lanjutkan dengan Google"
                  : "Lanjutkan dengan Email"}
              </p>
              <p className="text-sm text-slate-500">{pendingEmail}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <User className="w-4 h-4 text-sky-600" /> Nama Lengkap
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama sesuai ijazah"
                    {...field}
                    className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                  />
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
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Phone className="w-4 h-4 text-sky-600" /> No. WhatsApp
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="08xxxxxxxxxx"
                    {...field}
                    className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                  />
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
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <GraduationCap className="w-4 h-4 text-sky-600" /> Pendidikan
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: S1 Farmasi"
                    {...field}
                    className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
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
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <School className="w-4 h-4 text-sky-600" /> Universitas
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama institusi"
                    {...field}
                    className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                  />
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
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <ClipboardList className="w-4 h-4 text-sky-600" /> Tujuan
                  Ujian
                </FormLabel>
                <FormControl>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    {...field}
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
            name="targetScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Target className="w-4 h-4 text-sky-600" /> Target Skor
                  (0-100)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Lock className="w-4 h-4 text-sky-600" /> Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    {...field}
                    className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                  />
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
                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Lock className="w-4 h-4 text-sky-600" /> Konfirmasi Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Ulangi password"
                    {...field}
                    className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
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
              <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold">
                <MapPin className="w-4 h-4 text-sky-600" /> Alamat Domisili
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Alamat lengkap saat ini"
                  {...field}
                  className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full  text-white font-semibold h-12 rounded-xl shadow-lg shadow-sky-100 group transition-all"
        >
          {isLoading ? "Menyimpan..." : "Selesaikan Pendaftaran"}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Form>
  );
}
