"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MessageSquareMore,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Hash,
  ChevronRight,
  SendHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  adminApi,
  type QuestionReportDetail,
  type QuestionReportSummary,
} from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function AdminReportsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "open" | "replied" | "closed" | ""
  >("");
  const [rows, setRows] = useState<QuestionReportSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<QuestionReportDetail | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"replied" | "closed">(
    "replied",
  );

  const loadList = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminApi.questionReports(token, {
        status: statusFilter || undefined,
      });
      setRows(response);
      if (!selectedId && response[0]) {
        setSelectedId(response[0].id);
      }
    } catch (err) {
      toast.error("Gagal Memuat List", {
        description:
          err instanceof Error ? err.message : "Terjadi kesalahan koneksi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (reportId: number) => {
    if (!token) return;
    setDetailLoading(true);
    try {
      const response = await adminApi.questionReportDetail(token, reportId);
      setDetail(response);
    } catch (err) {
      toast.error("Gagal Memuat Detail", {
        description: "Tidak dapat mengambil data detail report.",
      });
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
    const promise = adminApi.replyQuestionReport(token, selectedId, {
      message_text: replyText.trim(),
      status: replyStatus,
    });

    toast.promise(promise, {
      loading: "Mengirim balasan...",
      success: (response) => {
        setReplyText("");
        loadList();
        loadDetail(selectedId);
        return response.email_sent
          ? "Balasan terkirim ke email user."
          : "Balasan tersimpan (Email gagal terkirim).";
      },
      error: "Gagal mengirim balasan.",
      finally: () => setReplying(false),
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        title="Laporan Kendala Soal"
        description="Kelola feedback dan laporan teknis mengenai butir soal dari pengguna."
        icon={<MessageSquareMore className="text-primary-600" size={24} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        {/* Sidebar: List Laporan */}
        <div className="space-y-4">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Filter size={18} className="text-slate-400" />
                  Filter Status
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-bold uppercase tracking-tight"
                  onClick={() => void loadList()}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              <div className="mt-4">
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="">Semua Laporan</option>
                  <option value="open">Menunggu (Open)</option>
                  <option value="replied">Sudah Dibalas</option>
                  <option value="closed">Selesai (Closed)</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-150 overflow-y-auto divide-y divide-slate-100">
                {loading ? (
                  <div className="p-8 text-center animate-pulse">
                    <p className="text-sm text-slate-400 font-medium">
                      Menyelaraskan data...
                    </p>
                  </div>
                ) : rows.length === 0 ? (
                  <div className="p-12 text-center">
                    <Search className="mx-auto text-slate-200 mb-3" size={32} />
                    <p className="text-sm text-slate-400">
                      Tidak ada laporan ditemukan.
                    </p>
                  </div>
                ) : (
                  rows.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "w-full p-5 text-left transition-all hover:bg-slate-50 relative group",
                        selectedId === item.id
                          ? "bg-primary-50/50"
                          : "bg-white",
                      )}
                    >
                      {selectedId === item.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600" />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                          <Hash size={12} /> {item.id}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                        {item.report_text}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                          <User size={12} className="text-slate-300" />{" "}
                          {item.user_name}
                        </span>
                        <ChevronRight
                          size={14}
                          className={cn(
                            "text-slate-300 transition-transform group-hover:translate-x-1",
                            selectedId === item.id && "text-primary-500",
                          )}
                        />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content: Detail & Balasan */}
        <div className="space-y-6">
          {detailLoading ? (
            <div className="h-100 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-400">
                  Mengambil detail laporan...
                </p>
              </div>
            </div>
          ) : detail ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Pelapor"
                  value={detail.user.name}
                  icon={<User size={14} />}
                />
                <MetricCard label="Status" value={detail.status} isStatus />
                <MetricCard label="Email User" value={detail.user.email} />
                <MetricCard
                  label="ID Soal"
                  value={`#${detail.question.id || "N/A"}`}
                />
              </div>

              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-primary-600 rounded-full" />
                    <div>
                      <CardTitle className="text-md">
                        Konten Soal Terkait
                      </CardTitle>
                      <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400 mt-1">
                        {detail.package.name ?? "Tanpa Kategori"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 italic text-slate-600 text-sm leading-relaxed">
                    "
                    {detail.question.text ??
                      "Konten soal sudah dihapus atau tidak tersedia."}
                    "
                  </div>
                </CardContent>
              </Card>

              {/* Thread Chat */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 px-1">
                  Riwayat Komunikasi
                </h3>
                {detail.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl p-5 shadow-sm border transition-all",
                      reply.author_role === "admin"
                        ? "ml-auto bg-primary-600 border-primary-700 text-white"
                        : "bg-white border-slate-200 text-slate-700",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2 gap-8">
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          reply.author_role === "admin"
                            ? "text-primary-100"
                            : "text-slate-400",
                        )}
                      >
                        {reply.author_role === "admin"
                          ? "Tanggapan Admin"
                          : "Laporan Pengguna"}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-medium flex items-center gap-1",
                          reply.author_role === "admin"
                            ? "text-primary-200"
                            : "text-slate-400",
                        )}
                      >
                        <Clock size={10} />{" "}
                        {new Date(reply.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {reply.message_text}
                    </p>
                    {reply.author_role === "admin" && (
                      <div className="mt-3 pt-3 border-t border-primary-500/50 flex items-center gap-2">
                        <Badge className="bg-primary-800/40 text-[9px] border-none font-bold">
                          {reply.emailed_at
                            ? "Email Terkirim"
                            : "Hanya Dashboard"}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Form Balasan */}
              <Card className="border-primary-100 bg-primary-50/30 shadow-none border-dashed">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                      <SendHorizontal size={18} />
                    </div>
                    <h4 className="font-bold text-slate-800">
                      Kirim Tanggapan Resmi
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                        Update Status
                      </label>
                      <select
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value as any)}
                      >
                        <option value="replied">Keep as Replied</option>
                        <option value="closed">Solve & Close Report</option>
                      </select>
                    </div>
                  </div>

                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis penjelasan teknis atau permohonan maaf ke user..."
                    className="min-h-32 bg-white rounded-xl border-slate-200 focus:ring-primary-500 p-4"
                  />

                  <div className="flex justify-end">
                    <Button
                      onClick={() => void handleReply()}
                      disabled={replying || !replyText.trim()}
                      className="px-8 rounded-full bg-primary-600 hover:bg-primary-700 font-bold shadow-lg shadow-primary-200"
                    >
                      {replying
                        ? "Sedang Mengirim..."
                        : "Kirim Balasan & Email"}
                      <Mail className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <ShieldCheck size={24} className="text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-500">Pilih Laporan</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Gunakan panel kiri untuk meninjau kendala soal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  isStatus,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isStatus?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1 flex items-center gap-1.5">
        {icon} {label}
      </p>
      {isStatus ? (
        <div className="mt-1">
          <StatusBadge status={value} />
        </div>
      ) : (
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-amber-100 text-amber-700 border-amber-200",
    replied: "bg-primary-100 text-primary-700 border-primary-200",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <Badge
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        styles[status] || styles.closed,
      )}
    >
      {status}
    </Badge>
  );
}
