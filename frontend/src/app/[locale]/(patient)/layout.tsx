"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PatientSidebar } from "@/components/layout/PatientSidebar";
import { useAuthStore } from "@/stores/auth.store";

const ADMIN_ROLES = ['ADMIN', 'OPS_AGENT', 'BILLING_AGENT', 'TECHNICIAN'];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace("/connexion");
      return;
    }
    
    // Redirect admin/staff users to admin dashboard
    if (user && ADMIN_ROLES.includes(user.role)) {
      setIsRedirecting(true);
      router.replace("/admin/tableau-de-bord");
    }
  }, [isAuthenticated, user, router]);

  // Show loading while checking auth or redirecting
  if (!isAuthenticated || !user || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Prevent rendering patient UI for admin users (will redirect)
  if (ADMIN_ROLES.includes(user.role)) {
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
