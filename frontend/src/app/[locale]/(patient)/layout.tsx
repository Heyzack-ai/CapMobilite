"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PatientSidebar } from "@/components/layout/PatientSidebar";
import { useAuthStore } from "@/stores/auth.store";

export default function PatientLayout({
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
    
    // Redirect admin/staff users to admin dashboard
    if (user && ['ADMIN', 'OPS_AGENT', 'BILLING_AGENT', 'TECHNICIAN'].includes(user.role)) {
      router.push("/admin/tableau-de-bord");
    }
  }, [isAuthenticated, user, router]);

  // Show nothing while checking auth or redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Prevent rendering patient UI for admin users (will redirect)
  if (['ADMIN', 'OPS_AGENT', 'BILLING_AGENT', 'TECHNICIAN'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PatientSidebar />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
