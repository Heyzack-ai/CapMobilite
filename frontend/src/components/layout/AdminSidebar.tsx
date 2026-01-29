"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Receipt,
  Truck,
  Wrench,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
  { href: "/admin/tableau-de-bord", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/admin/dossiers", icon: FolderOpen, labelKey: "cases" },
  { href: "/admin/devis", icon: FileText, labelKey: "quotes" },
  { href: "/admin/facturation", icon: Receipt, labelKey: "billing" },
  { href: "/admin/livraisons", icon: Truck, labelKey: "deliveries" },
  { href: "/admin/sav", icon: Wrench, labelKey: "service" },
  { href: "/admin/utilisateurs", icon: Users, labelKey: "users" },
  { href: "/admin/audit", icon: ClipboardList, labelKey: "audit" },
];

interface SidebarContentProps {
  user: { firstName?: string; lastName?: string; role?: string } | null;
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
      <div className="p-4 border-b border-neutral-700">
        <Link href="/admin/tableau-de-bord" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-white">CapMobilité</span>
          <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">Admin</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-neutral-700 bg-neutral-800/50">
        <p className="text-xs text-neutral-400">Connecté en tant que</p>
        <p className="font-medium text-white truncate">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-neutral-400 truncate">{user?.role}</p>
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
                ? "bg-primary-600 text-white"
                : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-neutral-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-300 hover:text-red-400 hover:bg-red-900/20"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t("logout")}
        </Button>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
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
        className="fixed top-4 left-4 z-50 lg:hidden text-white"
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
          "fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 transform transition-transform lg:hidden",
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
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-navy-900">
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
