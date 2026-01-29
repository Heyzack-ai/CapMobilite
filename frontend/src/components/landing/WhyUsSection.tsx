"use client";

import { useTranslations } from "next-intl";
import { Zap, Heart, CreditCard, Wrench } from "lucide-react";

export function WhyUsSection() {
  const t = useTranslations("whyUs");

  const features = [
    {
      icon: Zap,
      key: "fast",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: Heart,
      key: "human",
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      icon: CreditCard,
      key: "noCost",
      color: "text-secondary-500",
      bg: "bg-secondary-50",
    },
    {
      icon: Wrench,
      key: "maintenance",
      color: "text-primary-500",
      bg: "bg-primary-50",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900">
            {t("title")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="text-center p-6 rounded-2xl hover:bg-neutral-50 transition-colors"
            >
              <div
                className={`w-16 h-16 ${feature.bg} rounded-2xl mx-auto mb-4 flex items-center justify-center`}
              >
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-neutral-500 text-sm">
                {t(`${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
