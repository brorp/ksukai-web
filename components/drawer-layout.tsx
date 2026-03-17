"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function DrawerLayout({
  navItems,
  children,
}: {
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const isTestPage = pathname.includes("/test");

  if (isTestPage) {
    return (
      <div className="h-screen w-full overflow-hidden bg-white font-sans">
        <main className="h-full w-full overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans">
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-slate-100 bg-white transition-all duration-300 relative",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 z-50 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-all text-slate-400 hover:text-primary"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div
          className={cn(
            "p-8 transition-all",
            isCollapsed ? "px-4 text-center" : "px-8",
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={100}
              className={cn(
                "w-auto object-contain transition-all",
                isCollapsed ? "h-8" : "h-16",
              )}
            />
            {!isCollapsed && (
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">
                Professional CBT
              </p>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1.5">
          {!isCollapsed && (
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-4 px-4">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full transition-all rounded-xl group",
                    isCollapsed
                      ? "justify-center px-0 h-12"
                      : "justify-between px-4 h-12",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-500 hover:bg-primary-50 hover:text-primary",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-primary",
                      )}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="font-bold text-xs uppercase tracking-wide">
                        {item.label}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div
            className={cn(
              "bg-primary-50 rounded-2xl mb-4 border border-primary-100/50 transition-all",
              isCollapsed ? "p-2 text-center" : "p-4",
            )}
          >
            {!isCollapsed && (
              <p className="text-[9px] font-semibold text-primary-400 uppercase tracking-wider mb-1">
                User
              </p>
            )}
            <p className="text-xs font-semibold text-primary-900 truncate">
              {isCollapsed ? user?.name?.charAt(0) : user?.name || "A"}
            </p>
          </div>
          <Button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            variant="ghost"
            className={cn(
              "w-full text-rose-500 hover:bg-rose-50 rounded-xl transition-all",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4",
            )}
          >
            <LogOut size={isCollapsed ? 20 : 16} />
            {!isCollapsed && (
              <span className="text-xs font-bold uppercase tracking-widest">
                Keluar
              </span>
            )}
          </Button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 bg-[#F8FAFC]">
        <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 md:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
