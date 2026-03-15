"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquareMore, ShieldCheck } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  adminApi,
  type QuestionReportDetail,
  type QuestionReportSummary,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";

export default function AdminReportsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"open" | "replied" | "closed" | "">("");
  const [rows, setRows] = useState<QuestionReportSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<QuestionReportDetail | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"replied" | "closed">("replied");

  const loadList = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.questionReports(token, {
        status: statusFilter || undefined,
      });
      setRows(response);
      if (!selectedId && response[0]) {
        setSelectedId(response[0].id);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat report soal.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (reportId: number) => {
    if (!token) return;
    setDetailLoading(true);
    setError("");
    try {
      const response = await adminApi.questionReportDetail(token, reportId);
      setDetail(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat detail report.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadList();
  }, [token, statusFilter]);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    }
  }, [selectedId, token]);

  const handleReply = async () => {
    if (!token || !selectedId || !replyText.trim()) return;

    setReplying(true);
    setError("");
    setMessage("");
    try {
      const response = await adminApi.replyQuestionReport(token, selectedId, {
        message_text: replyText.trim(),
        status: replyStatus,
      });
      setMessage(
        response.email_sent
          ? "Balasan berhasil dikirim dan email user terkirim."
          : `Balasan tersimpan, tetapi email belum terkirim${response.email_error ? `: ${response.email_error}` : "."}`,
      );
      setReplyText("");
      await Promise.all([loadList(), loadDetail(selectedId)]);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Gagal mengirim balasan report.",
      );
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Report Soal"
        description="Pantau report soal dari user dan kirim balasan langsung dari dashboard admin."
        icon={<ShieldCheck size={20} />}
        actionLabel="Refresh Report"
        onAction={() => void loadList()}
        actionDisabled={loading}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Daftar Report</CardTitle>
            <CardDescription>
              Filter dan pilih report yang ingin ditinjau.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "open" | "replied" | "closed" | "")
              }
            >
              <option value="">Semua status</option>
              <option value="open">Open</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>

            {loading ? (
              <p className="text-sm text-slate-500">Memuat report...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada report soal.</p>
            ) : (
              rows.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                    selectedId === item.id
                      ? "border-sky-600 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">#{item.id}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase text-slate-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 line-clamp-3">{item.report_text}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {item.user_name} • {item.package_name ?? "-"}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Detail Report</CardTitle>
            <CardDescription>
              Lihat thread report dan balas langsung ke user.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {detailLoading ? (
              <p className="text-sm text-slate-500">Memuat detail report...</p>
            ) : !detail ? (
              <p className="text-sm text-slate-500">Pilih salah satu report di sebelah kiri.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard label="User" value={detail.user.name} />
                  <InfoCard label="Email" value={detail.user.email} />
                  <InfoCard label="Paket" value={detail.package.name ?? "-"} />
                  <InfoCard label="Status" value={detail.status} />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Soal
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {detail.question.text ?? "Soal sudah tidak tersedia."}
                  </p>
                </div>

                <div className="space-y-3">
                  {detail.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-xl border p-4 ${
                        reply.author_role === "admin"
                          ? "border-sky-200 bg-sky-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {reply.author_role === "admin" ? "Admin" : "User"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(reply.created_at).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{reply.message_text}</p>
                      {reply.author_role === "admin" ? (
                        <p className="mt-2 text-xs text-slate-400">
                          Email: {reply.emailed_at ? "terkirim" : "belum tercatat"}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <MessageSquareMore className="h-4 w-4 text-sky-600" />
                    <p className="font-semibold">Balas Report</p>
                  </div>
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={replyStatus}
                    onChange={(event) =>
                      setReplyStatus(event.target.value as "replied" | "closed")
                    }
                  >
                    <option value="replied">Set status: replied</option>
                    <option value="closed">Set status: closed</option>
                  </select>
                  <Textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Tulis balasan admin untuk user."
                    className="min-h-32"
                  />
                  <Button
                    onClick={() => void handleReply()}
                    disabled={replying || !replyText.trim()}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {replying ? "Mengirim..." : "Simpan Balasan & Kirim Email"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
