"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import SimpleTable from "@/components/admin/simple-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi, type AdminQuestion } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

export default function AdminBankSoalPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<AdminQuestion[]>([]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.questions(token);
      setRows(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat bank soal.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const query = search.toLowerCase();
    return rows.filter((item) => item.question_text.toLowerCase().includes(query));
  }, [rows, search]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      await adminApi.deleteQuestion(token, id);
      setMessage("Soal berhasil dihapus.");
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal menghapus soal.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Bank Soal"
        description="Daftar soal aktif/nonaktif untuk sesi ujian."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Bank Soal"
        onAction={() => void loadData()}
        actionDisabled={loading}
      />

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari pertanyaan..."
          className="md:max-w-sm bg-white"
        />
        <Link href="/admin/kelola-soal">
          <Button>Tambah / Kelola Soal</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <SimpleTable
            loading={loading}
            headers={["ID", "Pertanyaan", "Kunci", "Aktif", "Aksi"]}
            rows={filteredRows.map((item) => [
              String(item.id),
              item.question_text,
              item.correct_answer.toUpperCase(),
              item.is_active ? "Ya" : "Tidak",
              <Button
                key={item.id}
                size="sm"
                variant="destructive"
                disabled={actionLoading}
                onClick={() => void handleDelete(item.id)}
              >
                Hapus
              </Button>,
            ])}
            emptyText="Belum ada data bank soal."
          />
        </CardContent>
      </Card>
    </div>
  );
}
