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
              className="bg-white p-6 rounded-xl border border-gray-100 hover:border-primary-100 hover:shadow-xl transition-all group"
            >
              <div
                className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-navy-900">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-gray-500 text-sm">
                {t(`${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
