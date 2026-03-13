"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/types";

interface SidebarDrawerProps {
  userRole: UserRole;
}

export default function SidebarDrawer({ userRole }: SidebarDrawerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const adminMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Manajemen Pengguna", icon: Users, href: "/admin/dashboard" },
    { label: "Hasil Ujian", icon: BarChart3, href: "/admin/dashboard" },
  ];

  const apotekerMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/apoteker/dashboard" },
    { label: "Mulai Ujian", icon: FileText, href: "/apoteker/test" },
    { label: "Hasil Ujian", icon: BarChart3, href: "/apoteker/results" },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : apotekerMenuItems;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {userRole === "admin" ? "Admin Panel" : "Apoteker Portal"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Desktop Navigation */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:bg-white md:flex md:flex-col md:z-40">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {userRole === "admin" ? "Admin Panel" : "Apoteker Portal"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
