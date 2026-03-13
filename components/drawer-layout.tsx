"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LogOut,
  ClipboardCheck,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DrawerLayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
}

export default function DrawerLayout({
  navItems,
  children,
}: DrawerLayoutProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const isTestPage = pathname.includes("/test") || pathname.includes("/exam");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Komponen Navigasi Reusable
  const NavigationMenu = () => (
    <nav className="flex flex-col gap-2 mt-4 px-4">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">
        Menu Navigasi
      </p>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between px-4 py-6 h-12 transition-all rounded-xl group",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-blue-600",
                  )}
                >
                  {item.icon}
                </span>
                <span className="font-bold">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-100 bg-white">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100 transform -rotate-6">
              <Stethoscope className="text-white h-5 w-5" />
            </div>
            <span className="text-2xl font-semibold tracking-tighter text-slate-900">
              CBT<span className="text-blue-600">Portal</span>
            </span>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] ml-11">
            Professional CBT
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavigationMenu />
        </div>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-2xl mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">
              User Aktif
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.name || "User"}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-semibold rounded-xl h-12"
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar Sesi</span>
          </Button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <div className="flex flex-col flex-1 min-w-0 bg-[#F8FAFC]">
        {/* HEADER MOBILE */}
        <header className="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-white md:hidden shadow-sm z-30">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetHeader className="sr-only">
                <SheetTitle>Menu Navigasi CBT Apoteker</SheetTitle>
              </SheetHeader>
              <SheetContent
                side="left"
                className="w-80 p-0 flex flex-col border-none"
              >
                {/* Header di dalam Drawer Mobile */}
                <div className="p-8 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                      <Stethoscope className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-semibold tracking-tighter text-slate-900">
                      CBT Apoteker
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <NavigationMenu />
                </div>

                {/* LOGOUT DI DALAM DRAWER MOBILE */}
                <div className="p-6 border-t border-slate-50">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start gap-3 text-rose-500 hover:bg-rose-50 font-semibold rounded-xl h-12"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Keluar Sesi</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-slate-900 tracking-tighter">
              CBT Apoteker
            </span>
          </div>

          {/* QUICK LOGOUT ICON DI HEADER MOBILE */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-500"
          >
            <LogOut size={20} />
          </Button>
        </header>

        {/* BODY UTAMA */}
        <main
          className={cn(
            "flex-1 overflow-y-auto no-scrollbar",
            isTestPage ? "p-4 md:p-6" : "p-4 md:p-10",
          )}
        >
          <div
            className={cn(
              "mx-auto transition-all duration-300",
              isTestPage ? "max-w-full lg:max-w-350" : "max-w-6xl",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
