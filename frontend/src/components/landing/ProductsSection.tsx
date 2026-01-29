"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, Info, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ProductsSection() {
  const t = useTranslations("products");

  const products = [
    {
      key: "manual",
      image: "/images/wheelchair-manual.png",
      badge: null,
      features: [
        t("manual.feature1"),
        t("manual.feature2"),
        t("manual.feature3"),
      ],
    },
    {
      key: "electric",
      image: "/images/wheelchair-electric.png",
      badge: t("electric.badge"),
      features: [
        t("electric.feature1"),
        t("electric.feature2"),
        t("electric.feature3"),
      ],
    },
    {
      key: "terrain",
      image: "/images/wheelchair-terrain.png",
      badge: null,
      features: [
        t("terrain.feature1"),
        t("terrain.feature2"),
        t("terrain.feature3"),
      ],
    },
  ];

  return (
    <section id="modeles" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.key}
              className={`relative overflow-hidden transition-all hover:shadow-elevated ${
                product.badge
                  ? "border-primary-200 ring-2 ring-primary-100"
                  : ""
              }`}
            >
              {product.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="default" className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {product.badge}
                  </Badge>
                </div>
              )}

              <div className="p-6">
                {/* Image */}
                <div className="relative h-48 mb-6 bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl overflow-hidden">
                  <Image
                    src={product.image}
                    alt={t(`${product.key}.title`)}
                    fill
                    className="object-contain p-4"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-navy-900 mb-1">
                  {t(`${product.key}.title`)}
                </h3>
                <p className="text-sm text-neutral-500 mb-4">
                  {t(`${product.key}.subtitle`)}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {product.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-neutral-600"
                    >
                      <Check className="w-4 h-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500 mb-1">
                    {t(`${product.key}.value`)}
                  </div>
                  <div className="text-2xl font-bold text-secondary-600">
                    {t(`${product.key}.cost`)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Note */}
        <div className="mt-12 flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl p-4 max-w-3xl mx-auto">
          <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-800">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}
