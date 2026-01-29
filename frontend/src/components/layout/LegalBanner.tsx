"use client";

import { useTranslations } from "next-intl";

export function LegalBanner() {
  const t = useTranslations("legalBanner");

  return (
    <div className="bg-navy-900 text-white text-xs py-2 px-4 text-center">
      {t("text")}
    </div>
  );
}
