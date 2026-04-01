"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import DrawerLayout from "@/components/drawer-layout";
import { LayoutDashboard, BookOpen, Award, User } from "lucide-react";

export default function ApotekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const logout = useAuthStore((state) => state.logout);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "user")) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !sessionExpiresAt) {
      return;
    }

    const remainingMs = sessionExpiresAt - Date.now();
    if (remainingMs <= 0) {
      logout();
      router.push("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      logout();
      router.push("/login");
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [logout, mounted, router, sessionExpiresAt]);

  if (!mounted || !isAuthenticated || user?.role !== "user") {
    return null;
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/apoteker/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Pembelian",
      href: "/apoteker/purchases",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Hasil Ujian",
      href: "/apoteker/results",
      icon: <Award className="h-4 w-4" />,
    },
    {
      label: "Profil Saya",
      href: "/apoteker/profile",
      icon: <User className="h-4 w-4" />,
    },
  ];

  return <DrawerLayout navItems={navItems}>{children}</DrawerLayout>;
}
