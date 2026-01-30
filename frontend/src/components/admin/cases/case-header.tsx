"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { caseStatusLabels, caseStatusColors } from "@/lib/mocks/data/cases";
import type { Case, CaseStatus, CasePriority, Patient } from "@/types";

interface CaseHeaderProps {
  caseData: Case;
  patient?: Patient | null;
  onChangeStatus?: () => void;
  onAssign?: () => void;
}

const priorityColors: Record<CasePriority, string> = {
  LOW: "secondary",
  NORMAL: "default",
  HIGH: "warning",
  URGENT: "error",
};

const priorityLabels: Record<CasePriority, string> = {
  LOW: "Basse",
  NORMAL: "Normale",
  HIGH: "Haute",
  URGENT: "Urgente",
};

export function CaseHeader({
  caseData,
  patient,
  onChangeStatus,
  onAssign,
}: CaseHeaderProps) {
  const t = useTranslations("admin.caseDetail");

  const slaExpired = caseData.slaDeadline && new Date(caseData.slaDeadline) < new Date();

  return (
    <div className="space-y-4">
      {/* Navigation and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dossiers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToList")}
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onChangeStatus}>
            {t("actions.changeStatus")}
          </Button>
          <Button variant="outline" size="sm" onClick={onAssign}>
            <UserCog className="w-4 h-4 mr-2" />
            {t("actions.assign")}
          </Button>
        </div>
      </div>

      {/* Case Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Case Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {caseData.caseNumber}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      (caseStatusColors[caseData.status as CaseStatus] ||
                        "default") as
                        | "default"
                        | "success"
                        | "warning"
                        | "error"
                        | "info"
                        | "secondary"
                    }
                    className="text-sm"
                  >
                    {caseStatusLabels[caseData.status as CaseStatus] ||
                      caseData.status}
                  </Badge>
                  <Badge
                    variant={
                      priorityColors[caseData.priority] as
                        | "default"
                        | "warning"
                        | "error"
                        | "secondary"
                    }
                  >
                    {caseData.priority === "URGENT" && (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {priorityLabels[caseData.priority]}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(caseData.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {caseData.slaDeadline && (
                  <div
                    className={`flex items-center gap-1.5 ${
                      slaExpired ? "text-error" : ""
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>
                      SLA:{" "}
                      {new Date(caseData.slaDeadline).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                    {slaExpired && (
                      <Badge variant="error" className="text-xs">
                        Expiré
                      </Badge>
                    )}
                  </div>
                )}
                {caseData.assignedToId && (
                  <div className="flex items-center gap-1.5">
                    <UserCog className="w-4 h-4" />
                    <span>Assigné</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Patient Info */}
            {patient && (
              <div className="lg:text-right">
                <div className="inline-flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-neutral-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <div className="flex flex-col gap-0.5 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
