"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CheckCircle2, ArrowRight, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const t = useTranslations("hero");

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
  ];

  return (
    <section className="pt-40 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden hero-pattern">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-50 text-secondary-700 font-semibold text-sm mb-8 border border-secondary-100 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("badge")}</span>
            </div>

            {/* Title */}
            <h1 className="font-bold text-5xl lg:text-6xl leading-[1.1] mb-6 text-navy-900 tracking-tight">
              {t("title")} <br />
              <span className="text-gradient">{t("titleHighlight")}</span>
            </h1>

            {/* Description */}
            <p
              className="text-lg text-neutral-600 mb-8 leading-relaxed font-light"
              dangerouslySetInnerHTML={{ __html: t("description") }}
            />

            {/* Benefits List */}
            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-neutral-700">
                  <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="xl" asChild>
                <a href="#eligibilite">
                  {t("ctaPrimary")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href="tel:01XXXXXXXX">
                  <Phone className="w-5 h-5 mr-2" />
                  {t("ctaSecondary")}
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 border-t border-neutral-100 pt-8">
              <div>
                <div className="font-bold text-2xl text-navy-900">500+</div>
                <div className="text-sm text-neutral-500 font-medium">
                  {t("stats.patients")}
                </div>
              </div>
              <div>
                <div className="font-bold text-2xl text-navy-900">60</div>
                <div className="text-sm text-neutral-500 font-medium">
                  {t("stats.days")}
                </div>
              </div>
              <div>
                <div className="font-bold text-2xl text-navy-900 flex items-center gap-1">
                  4.9 <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-sm text-neutral-500 font-medium">
                  {t("stats.rating")}
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative z-10">
              <Image
                src="/images/hero-new.png"
                alt="Wheelchair"
                width={600}
                height={500}
                className="rounded-2xl shadow-elevated"
                priority
              />
            </div>

            {/* Floating Badge */}
            <div className="hidden md:block absolute -bottom-4 -left-4 z-20 bg-white rounded-xl shadow-elevated p-4 border border-neutral-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600">0€</div>
                <div className="text-xs text-neutral-500 font-medium">
                  {t("zeroBadge")}
                </div>
              </div>
            </div>

            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl -rotate-3 scale-105 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
