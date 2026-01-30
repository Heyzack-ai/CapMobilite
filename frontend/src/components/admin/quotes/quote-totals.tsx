"use client";

import { useTranslations } from "next-intl";
import { Euro, Calendar, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuoteTotalsProps {
  totalAmount: number;
  cpamAmount: number;
  mutuelleAmount: number;
  patientAmount: number;
  validUntil: string;
}

export function QuoteTotals({
  totalAmount,
  cpamAmount,
  mutuelleAmount,
  patientAmount,
  validUntil,
}: QuoteTotalsProps) {
  const t = useTranslations("admin.quoteDetail.totals");

  const validUntilDate = new Date(validUntil);
  const today = new Date();
  const isExpiringSoon = validUntilDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000;
  const isExpired = validUntilDate < today;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Euro className="w-5 h-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coverage breakdown */}
        <div className="space-y-3">
          {/* CPAM */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">{t("cpam")}</span>
            <span className="font-medium text-blue-600">
              {cpamAmount.toLocaleString("fr-FR")} EUR
            </span>
          </div>

          {/* Mutuelle */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">{t("mutuelle")}</span>
            <span className="font-medium text-green-600">
              {mutuelleAmount.toLocaleString("fr-FR")} EUR
            </span>
          </div>

          {/* RAC (Patient amount) */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-medium text-neutral-700">{t("rac")}</span>
            <span className="font-bold text-orange-600">
              {patientAmount.toLocaleString("fr-FR")} EUR
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-3 border-t-2 border-neutral-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-neutral-900">{t("total")}</span>
            <span className="text-xl font-bold text-neutral-900">
              {totalAmount.toLocaleString("fr-FR")} EUR
            </span>
          </div>
        </div>

        {/* Validity */}
        <div
          className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
            isExpired
              ? "bg-error/10 text-error"
              : isExpiringSoon
              ? "bg-warning/10 text-warning"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {(isExpired || isExpiringSoon) && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <Calendar className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isExpired || isExpiringSoon ? "hidden" : ""}`} />
          <div className="text-sm">
            <p className="font-medium">
              {isExpired ? t("expired") : t("validUntil")}
            </p>
            <p>
              {validUntilDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Coverage percentages */}
        <div className="text-xs text-neutral-500 space-y-1 pt-2">
          <p>
            CPAM: {((cpamAmount / totalAmount) * 100).toFixed(0)}% |
            Mutuelle: {((mutuelleAmount / totalAmount) * 100).toFixed(0)}% |
            RAC: {((patientAmount / totalAmount) * 100).toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
