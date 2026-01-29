"use client";

import { useTranslations } from "next-intl";
import { FileText, Settings, Truck } from "lucide-react";

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      icon: FileText,
      title: t("step1.title"),
      description: t("step1.description"),
    },
    {
      icon: Settings,
      title: t("step2.title"),
      description: t("step2.description"),
    },
    {
      icon: Truck,
      title: t("step3.title"),
      description: t("step3.description"),
    },
  ];

  return (
    <section id="fonctionnement" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-secondary-400" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 bg-primary-50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-primary-600" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
