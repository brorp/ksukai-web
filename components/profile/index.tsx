"use client";

import React, { useState } from "react";
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
import { useAuthStore } from "@/lib/store/auth";

const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  education: z.string().min(1, "Pendidikan wajib diisi"),
  schoolOrigin: z.string().min(1, "Asal institusi wajib diisi"),
  examPurpose: z.enum(["ukai", "cpns", "pppk", "other"]),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  phone: z.string().min(10, "No. HP tidak valid"),
  targetScore: z.number().min(0).max(100),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const PURPOSE_OPTIONS = [
  { label: "UKAI", value: "ukai" },
  { label: "CPNS", value: "cpns" },
  { label: "PPPK", value: "pppk" },
  { label: "Lainnya", value: "other" },
] as const;

interface RegisterProfileFormProps {
  email?: string;
}

export default function RegisterProfileForm({
  email,
}: RegisterProfileFormProps) {
  const router = useRouter();
  const isLoading = useAuthStore((state) => state.isLoading);
  const [error, setError] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      education: "",
      schoolOrigin: "",
      examPurpose: "ukai",
      address: "",
      phone: "",
      targetScore: 75,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setError("");
    // Panggil fungsi register/update profile di sini menggunakan data + email
    console.log("Submitting profile for:", email, data);
    router.push("/apoteker/dashboard");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

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
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-sky-100 group transition-all"
        >
          {isLoading ? "Menyimpan..." : "Selesaikan Pendaftaran"}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Form>
  );
}
