"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { FolderOpen, Plus, Clock, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth.store";
import { getCasesByPatientId, caseStatusLabels, caseStatusColors } from "@/lib/mocks/data/cases";

export default function CasesListPage() {
  const t = useTranslations("patient.cases");
  const { user } = useAuthStore();

  const patientId = user?.id || "user-1";
  const cases = getCasesByPatientId(patientId);

  const getChecklistProgress = (checklist: { completedAt?: string }[]) => {
    const completed = checklist.filter((item) => item.completedAt).length;
    return Math.round((completed / checklist.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/dossiers/nouveau">
            <Plus className="w-4 h-4 mr-2" />
            {t("newCase")}
          </Link>
        </Button>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-900">{t("noCases")}</h3>
            <p className="text-neutral-500 mt-1 mb-4">{t("noCasesDescription")}</p>
            <Button asChild>
              <Link href="/dossiers/nouveau">
                <Plus className="w-4 h-4 mr-2" />
                {t("startCase")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => {
            const progress = getChecklistProgress(caseItem.checklist);
            const isComplete = ["DELIVERED", "CLOSED"].includes(caseItem.status);

            return (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <Link href={`/dossiers/${caseItem.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Case Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isComplete ? "bg-success/10" : "bg-primary-100"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : (
                              <FolderOpen className="w-5 h-5 text-primary-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{caseItem.caseNumber}</h3>
                            <p className="text-sm text-neutral-500">
                              {t("created")}: {new Date(caseItem.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Progress */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Progress Bar */}
                        <div className="w-full sm:w-40">
                          <div className="flex justify-between text-xs text-neutral-500 mb-1">
                            <span>{t("progress")}</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant={caseStatusColors[caseItem.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                          className="whitespace-nowrap"
                        >
                          {caseStatusLabels[caseItem.status]}
                        </Badge>
                      </div>
                    </div>

                    {/* Deadline Warning */}
                    {caseItem.slaDeadline && !isComplete && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-warning">
                          {t("deadline")}: {new Date(caseItem.slaDeadline).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}

                    {/* Checklist Summary */}
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <p className="text-sm text-neutral-500 mb-2">{t("checklistProgress")}:</p>
                      <div className="flex flex-wrap gap-2">
                        {caseItem.checklist.map((item) => (
                          <span
                            key={item.key}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              item.completedAt
                                ? "bg-success/10 text-success"
                                : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            {item.completedAt && <CheckCircle className="w-3 h-3" />}
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
