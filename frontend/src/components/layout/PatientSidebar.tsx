"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  FolderOpen,
  Accessibility,
  Wrench,
  FileText,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/dossiers", icon: FolderOpen, labelKey: "cases" },
  { href: "/mes-equipements", icon: Accessibility, labelKey: "devices" },
  { href: "/maintenance", icon: Wrench, labelKey: "maintenance" },
  { href: "/documents", icon: FileText, labelKey: "documents" },
  { href: "/profil", icon: User, labelKey: "profile" },
  { href: "/support", icon: HelpCircle, labelKey: "support" },
];

interface SidebarContentProps {
  user: { firstName?: string; lastName?: string; email?: string } | null;
  pathname: string;
  t: (key: string) => string;
  onLogout: () => void;
  onNavClick?: () => void;
}

function SidebarContent({ user, pathname, t, onLogout, onNavClick }: SidebarContentProps) {
  const isActive = (href: string) => {
    const currentPath = pathname.replace(/^\/(fr|en)/, "");
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-neutral-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Accessibility className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">CapMobilité</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50">
        <p className="text-sm text-neutral-500">Connecté en tant que</p>
        <p className="font-medium truncate">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary-100 text-primary-700"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-neutral-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-600 hover:text-error hover:bg-error/10"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t("logout")}
        </Button>
      </div>
    </>
  );
}

export function PatientSidebar() {
  const pathname = usePathname();
  const t = useTranslations("patient.nav");
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/connexion";
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarContent
            user={user}
            pathname={pathname}
            t={t}
            onLogout={handleLogout}
            onNavClick={handleNavClick}
          />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-neutral-200">
        <SidebarContent
          user={user}
          pathname={pathname}
          t={t}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
