"use client";

import { useTranslations } from "next-intl";
import { FileText, User, Calendar, Briefcase } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuoteHeaderProps {
  quoteNumber: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  createdAt: string;
  caseNumber: string;
  patientName: string;
  patientEmail: string;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoye",
  APPROVED: "Approuve",
  REJECTED: "Refuse",
  EXPIRED: "Expire",
};

const statusColors: Record<string, "default" | "success" | "warning" | "error" | "info" | "secondary"> = {
  DRAFT: "secondary",
  SENT: "info",
  APPROVED: "success",
  REJECTED: "error",
  EXPIRED: "warning",
};

export function QuoteHeader({
  quoteNumber,
  status,
  createdAt,
  caseNumber,
  patientName,
  patientEmail,
}: QuoteHeaderProps) {
  const t = useTranslations("admin.quoteDetail");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Quote Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-neutral-900">
                  {quoteNumber}
                </h1>
                <Badge variant={statusColors[status]}>
                  {statusLabels[status]}
                </Badge>
              </div>
              <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t("createdAt")} {new Date(createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Patient & Case Info */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
            {/* Patient Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t("patient")}</p>
                <p className="font-medium text-neutral-900">{patientName}</p>
                <p className="text-xs text-neutral-400">{patientEmail}</p>
              </div>
            </div>

            {/* Case Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t("case")}</p>
                <p className="font-medium text-neutral-900">{caseNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
