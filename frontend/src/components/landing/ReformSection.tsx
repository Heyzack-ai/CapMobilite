"use client";

import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";

export function ReformSection() {
  const t = useTranslations("reform");

  return (
    <section className="py-20 bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl lg:text-4xl text-center mb-16 font-light">
          {t("title")}
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Before */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <h3 className="text-lg font-semibold mb-6 text-neutral-300 flex items-center gap-2">
              <X className="w-5 h-5 text-red-400" />
              {t("before.title")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-neutral-300">{t("before.item1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-neutral-300">{t("before.item2")}</span>
              </li>
            </ul>
          </div>

          {/* After */}
          <div className="bg-secondary-500/10 backdrop-blur rounded-2xl p-8 border border-secondary-500/30">
            <h3 className="text-lg font-semibold mb-6 text-secondary-400 flex items-center gap-2">
              <Check className="w-5 h-5" />
              {t("after.title")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-secondary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-secondary-400" />
                </div>
                <span className="text-white font-medium">{t("after.item1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-secondary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-secondary-400" />
                </div>
                <span className="text-white font-medium">{t("after.item2")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
