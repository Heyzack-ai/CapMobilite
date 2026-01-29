"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Activity, Phone, Mail, AlertCircle } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const common = useTranslations("common");

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 pt-16 pb-8 text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-navy-900">
                {common("companyName")}
              </span>
            </div>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              {t("tagline")}
            </p>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-600" />
                {common("phone")}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-600" />
                {common("email")}
              </div>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="font-bold text-navy-900 mb-4">{t("usefulLinks")}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#fonctionnement"
                  className="hover:text-primary-600 transition-colors"
                >
                  {t("howItWorks")}
                </a>
              </li>
              <li>
                <a
                  href="#eligibilite"
                  className="hover:text-primary-600 transition-colors"
                >
                  {t("submitRequest")}
                </a>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="hover:text-primary-600 transition-colors"
                >
                  {t("legalMentions")}
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="hover:text-primary-600 transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Disclaimer Box */}
          <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {t("legalTitle")}
            </h5>
            <p className="text-xs text-neutral-500 leading-relaxed text-justify">
              {t("legalText")}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-neutral-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} {common("companyName")}.{" "}
            {t("copyright")}
          </p>
          <div className="flex gap-6">
            <Link href="/cgv" className="hover:text-neutral-600 transition-colors">
              {t("cgv")}
            </Link>
            <Link
              href="/cookies"
              className="hover:text-neutral-600 transition-colors"
            >
              {t("cookies")}
            </Link>
            <Link
              href="/plan-du-site"
              className="hover:text-neutral-600 transition-colors"
            >
              {t("sitemap")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
