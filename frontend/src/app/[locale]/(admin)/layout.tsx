"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuthStore } from "@/stores/auth.store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }

    // Redirect if not admin or ops agent
    if (user && !["ADMIN", "OPS_AGENT", "BILLING_AGENT", "TECHNICIAN"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Show nothing while checking auth
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
