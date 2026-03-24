"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import DrawerLayout from "@/components/drawer-layout";
import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Layers,
  MessageSquareMore,
  Package2,
  Users,
  WalletCards,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Pengguna",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Transaksi",
      href: "/admin/transactions",
      icon: <WalletCards className="h-4 w-4" />,
    },
    {
      label: "Kelola Paket",
      href: "/admin/packages",
      icon: <Package2 className="h-4 w-4" />,
    },
    {
      label: "Kelola Ujian",
      href: "/admin/exams",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: "Hasil Ujian",
      href: "/admin/exam-results",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Bank Soal",
      href: "/admin/bank-soal",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Kelola Soal",
      href: "/admin/kelola-soal",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      label: "Report Soal",
      href: "/admin/reports",
      icon: <MessageSquareMore className="h-4 w-4" />,
    },
    {
      label: "Log Aktivitas",
      href: "/admin/log-aktivitas",
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  return <DrawerLayout navItems={navItems}>{children}</DrawerLayout>;
}
