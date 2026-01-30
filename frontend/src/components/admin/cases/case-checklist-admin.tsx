"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ChecklistItem } from "@/types";

interface ChecklistItemAdmin extends ChecklistItem {
  description?: string;
}

interface CaseChecklistAdminProps {
  checklist: ChecklistItemAdmin[];
  onToggleItem?: (key: string, completed: boolean) => void;
  readOnly?: boolean;
}

export function CaseChecklistAdmin({
  checklist,
  onToggleItem,
  readOnly = false,
}: CaseChecklistAdminProps) {
  const t = useTranslations("admin.caseDetail");

  const completedItems = checklist.filter((item) => item.completedAt).length;
  const progress =
    checklist.length > 0
      ? Math.round((completedItems / checklist.length) * 100)
      : 0;

  const handleToggle = (key: string, checked: boolean) => {
    if (onToggleItem) {
      onToggleItem(key, checked);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("checklist.title")}</CardTitle>
          <Badge variant={progress === 100 ? "success" : "info"}>
            {completedItems}/{checklist.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklist.map((item) => {
            const isCompleted = !!item.completedAt;

            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isCompleted
                    ? "border-success/30 bg-success/5"
                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? "bg-success text-white"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-medium ${
                          isCompleted ? "text-success" : "text-neutral-900"
                        }`}
                      >
                        {item.label}
                      </p>
                      {item.required && !isCompleted && (
                        <Badge variant="warning" className="text-xs">
                          Requis
                        </Badge>
                      )}
                    </div>
                    {isCompleted && item.completedAt && (
                      <p className="text-sm text-neutral-500">
                        Validé le{" "}
                        {new Date(item.completedAt).toLocaleDateString("fr-FR")}
                        {item.completedBy && ` par ${item.completedBy}`}
                      </p>
                    )}
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isCompleted}
                      onCheckedChange={(checked) =>
                        item.key && handleToggle(item.key, checked)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SLA Warning */}
        {completedItems < checklist.length && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-700">
                Éléments manquants
              </p>
              <p className="text-sm text-neutral-600">
                {checklist.length - completedItems} élément(s) restant(s) à
                valider pour compléter le dossier.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
