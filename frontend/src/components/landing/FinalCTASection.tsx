"use client";

import { useTranslations } from "next-intl";

export function FinalCTASection() {
  const t = useTranslations("finalCta");
  const common = useTranslations("common");

  return (
    <section className="py-12 bg-white border-t border-neutral-100 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="font-serif text-2xl mb-2 text-navy-900">{t("title")}</h3>
        <p className="text-neutral-500 mb-6">{t("subtitle")}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium">
          <a
            href="#eligibilite"
            className="text-primary-700 hover:underline hover:text-primary-800"
          >
            {t("onlineRequest")}
          </a>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <span className="text-neutral-600">
            {t("orCall")}{" "}
            <a
              href={`tel:${common("phone").replace(/\s/g, "")}`}
              className="hover:text-primary-600 transition-colors"
            >
              {common("phone")}
            </a>{" "}
            (9h-18h)
          </span>
        </div>
      </div>
    </section>
  );
}
