"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Calendar, Clock, AlertTriangle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Case, CaseStatus } from "@/types";

interface UserCasesListProps {
  cases: Case[];
}

export function UserCasesList({ cases }: UserCasesListProps) {
  const t = useTranslations("admin.userDetail.cases");
  const params = useParams();
  const locale = params.locale as string;

  const caseStatusLabels: Record<CaseStatus, string> = {
    INTAKE_RECEIVED: t("status.intakeReceived"),
    DOCUMENTS_PENDING: t("status.documentsPending"),
    UNDER_REVIEW: t("status.underReview"),
    QUOTE_READY: t("status.quoteReady"),
    QUOTE_APPROVED: t("status.quoteApproved"),
    SUBMITTED_TO_CPAM: t("status.submittedToCpam"),
    CPAM_APPROVED: t("status.cpamApproved"),
    CPAM_REJECTED: t("status.cpamRejected"),
    DELIVERY_SCHEDULED: t("status.deliveryScheduled"),
    DELIVERED: t("status.delivered"),
    CLOSED: t("status.closed"),
    CANCELLED: t("status.cancelled"),
  };

  const caseStatusColors: Record<CaseStatus, "default" | "success" | "warning" | "error" | "info" | "secondary"> = {
    INTAKE_RECEIVED: "info",
    DOCUMENTS_PENDING: "warning",
    UNDER_REVIEW: "info",
    QUOTE_READY: "success",
    QUOTE_APPROVED: "success",
    SUBMITTED_TO_CPAM: "info",
    CPAM_APPROVED: "success",
    CPAM_REJECTED: "error",
    DELIVERY_SCHEDULED: "info",
    DELIVERED: "success",
    CLOSED: "secondary",
    CANCELLED: "error",
  };

  const priorityLabels: Record<string, string> = {
    LOW: t("priority.low"),
    NORMAL: t("priority.normal"),
    HIGH: t("priority.high"),
    URGENT: t("priority.urgent"),
  };

  const priorityColors: Record<string, "default" | "success" | "warning" | "error"> = {
    LOW: "default",
    NORMAL: "success",
    HIGH: "warning",
    URGENT: "error",
  };

  const completedChecklist = (caseItem: Case) =>
    caseItem.checklist.filter((item) => item.completedAt).length;

  const totalChecklist = (caseItem: Case) => caseItem.checklist.length;

  const isSlaExpiring = (caseItem: Case) => {
    if (!caseItem.slaDeadline) return false;
    const deadline = new Date(caseItem.slaDeadline);
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24;
  };

  const isSlaOverdue = (caseItem: Case) => {
    if (!caseItem.slaDeadline) return false;
    return new Date(caseItem.slaDeadline) < new Date();
  };

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500">{t("noCases")}</p>
          <p className="text-sm text-neutral-400 mt-1">{t("noCasesDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.total")}</p>
            <p className="text-2xl font-bold">{cases.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.active")}</p>
            <p className="text-2xl font-bold text-info">
              {cases.filter((c) => !["CLOSED", "CANCELLED", "DELIVERED"].includes(c.status)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.completed")}</p>
            <p className="text-2xl font-bold text-success">
              {cases.filter((c) => c.status === "DELIVERED" || c.status === "CLOSED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.urgent")}</p>
            <p className="text-2xl font-bold text-error">
              {cases.filter((c) => c.priority === "URGENT" || c.priority === "HIGH").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-neutral-50">
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.caseNumber")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.status")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.priority")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.progress")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.created")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.sla")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium">{caseItem.caseNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={caseStatusColors[caseItem.status]}>
                        {caseStatusLabels[caseItem.status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={priorityColors[caseItem.priority]}>
                        {priorityLabels[caseItem.priority]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{
                              width: `${(completedChecklist(caseItem) / totalChecklist(caseItem)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-neutral-500">
                          {completedChecklist(caseItem)}/{totalChecklist(caseItem)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(caseItem.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="p-4">
                      {caseItem.slaDeadline ? (
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            isSlaOverdue(caseItem)
                              ? "text-error"
                              : isSlaExpiring(caseItem)
                              ? "text-warning"
                              : "text-neutral-500"
                          }`}
                        >
                          {(isSlaOverdue(caseItem) || isSlaExpiring(caseItem)) && (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          <Clock className="w-4 h-4" />
                          {new Date(caseItem.slaDeadline).toLocaleDateString("fr-FR")}
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${locale}/admin/dossiers/${caseItem.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          {t("table.view")}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
