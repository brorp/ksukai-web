"use client";

import { User } from "lucide-react";
import EditProfileForm from "@/components/profile/edit-profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Profil Saya
          </h1>
          <p className="text-slate-500">
            Kelola informasi data diri dan tujuan ujian Anda.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-3 bg-sky-50 rounded-xl">
              <User className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Data Diri Peserta
              </h2>
              <p className="text-sm text-slate-500">
                Pastikan data yang dimasukkan benar.
              </p>
            </div>
          </div>
          <EditProfileForm />
        </div>
      </div>
    </div>
  );
}
