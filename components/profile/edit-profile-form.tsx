"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Phone,
  GraduationCap,
  School,
  Target,
  ClipboardList,
  MapPin,
  Save,
} from "lucide-react";
import { toast } from "sonner";

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
import { authApi } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

const profileEditSchema = z.object({
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
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

const PURPOSE_OPTIONS = [
  { label: "Persiapan UKAI", value: "persiapan_ukai" },
  {
    label: "Persiapan Masuk Apoteker",
    value: "persiapan_masuk_apoteker",
  },
  { label: "Lainnya", value: "lainnya" },
] as const;

export default function EditProfileForm() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: user?.name || "",
      education: user?.education || "",
      schoolOrigin: user?.schoolOrigin || "",
      examPurpose: (user?.examPurpose as any) || "persiapan_ukai",
      address: user?.address || "",
      phone: user?.phone || "",
      targetScore: user?.targetScore || 75,
    },
  });

  const onSubmit = async (data: ProfileEditFormData) => {
    if (!token) return;
    setIsLoading(true);

    try {
      await authApi.updateProfile(token, {
        name: data.name,
        education: data.education,
        school_origin: data.schoolOrigin,
        exam_purpose: data.examPurpose,
        address: data.address,
        phone: data.phone,
        target_score: data.targetScore,
      });

      toast.success("Profil berhasil diperbarui!");
      // Refresh user data globally
      await fetchProfile();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui profil."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    className="rounded-xl bg-slate-50 border border-slate-200 focus:bg-white h-11"
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
                    className="rounded-xl bg-slate-50 border border-slate-200 focus:bg-white h-11"
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
                    className="rounded-xl bg-slate-50 border border-slate-200 focus:bg-white h-11"
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
                    className="rounded-xl bg-slate-50 border border-slate-200 focus:bg-white h-11"
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
                  <ClipboardList className="w-4 h-4 text-sky-600" /> Tujuan Ujian
                </FormLabel>
                <FormControl>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
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
                  <Target className="w-4 h-4 text-sky-600" /> Target Skor (0-100)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="rounded-xl bg-slate-50 border border-slate-200 focus:bg-white h-11"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    value={field.value === 0 ? "" : field.value}
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
                  className="rounded-xl bg-slate-50 border border-slate-200 focus:bg-white h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 text-white font-bold h-11 rounded-xl shadow-lg shadow-sky-100 transition-all bg-sky-600 hover:bg-sky-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
