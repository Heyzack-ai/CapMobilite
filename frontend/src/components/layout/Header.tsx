"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Phone, Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./LanguageToggle";
import { LegalBanner } from "./LegalBanner";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "#fonctionnement", label: t("howItWorks") },
    { href: "#modeles", label: t("wheelchairs") },
    { href: "#temoignages", label: t("reviews") },
    { href: "#faq", label: t("faq") },
  ];

  return (
    <header className="fixed w-full z-50 top-0">
      <LegalBanner />

      <nav className="bg-white/90 backdrop-blur-xl border-b border-neutral-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-navy-900">
                CapMobilité
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <LanguageToggle />

              <a
                href="tel:01XXXXXXXX"
                className="hidden lg:flex items-center gap-2 text-neutral-600 hover:text-primary-600 font-semibold text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                01 XX XX XX XX
              </a>

              <Button asChild className="hidden sm:inline-flex">
                <a href="#eligibilite">{t("submitRequest")}</a>
              </Button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="md:hidden p-2 text-neutral-600 hover:text-navy-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100 animate-slide-down">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-neutral-600 hover:text-primary-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-neutral-100">
                <Button asChild className="w-full">
                  <a href="#eligibilite">{t("submitRequest")}</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
