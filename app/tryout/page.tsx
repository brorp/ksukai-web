"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthStore } from "@/lib/store/auth";

function TryoutGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const intent = searchParams.get("intent");

    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/apoteker/dashboard");
      }
      return;
    }

    if (intent === "free") {
      router.replace("/register");
      return;
    }

    router.replace("/login");
  }, [isAuthenticated, mounted, router, searchParams, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#1A365D]" />
        <p className="text-gray-600">Menyiapkan akses tryout...</p>
      </div>
    </div>
  );
}

export default function TryoutGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#1A365D]" />
            <p className="text-gray-600">Menyiapkan akses tryout...</p>
          </div>
        </div>
      }
    >
      <TryoutGatewayContent />
    </Suspense>
  );
}
