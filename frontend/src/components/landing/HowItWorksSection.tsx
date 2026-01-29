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
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-gray-200 via-primary-200 to-gray-200 -z-10 border-t border-dashed border-gray-300" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white p-8 rounded-2xl border border-gray-100 text-center group hover:shadow-xl transition-all duration-300"
              >
                {/* Step Number */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-gray-50 z-10 group-hover:scale-110 transition-transform duration-300">
                  <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-6 mt-4 flex justify-center">
                  <step.icon className="w-12 h-12 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
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
