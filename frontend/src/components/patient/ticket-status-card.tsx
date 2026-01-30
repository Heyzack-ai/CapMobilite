"use client";

import { useTranslations } from "next-intl";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Wrench,
  Package,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/types";
import { ticketStatusLabels } from "@/lib/mocks/data/devices";

interface StatusStep {
  status: TicketStatus;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

interface TicketStatusCardProps {
  currentStatus: TicketStatus;
  createdAt: string;
  nextStepInfo?: string;
}

const statusOrder: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "SCHEDULED",
  "IN_PROGRESS",
  "PARTS_ORDERED",
  "RESOLVED",
  "CLOSED",
];

const statusIcons: Record<TicketStatus, React.ReactNode> = {
  OPEN: <AlertCircle className="w-5 h-5" />,
  ASSIGNED: <Clock className="w-5 h-5" />,
  SCHEDULED: <Calendar className="w-5 h-5" />,
  IN_PROGRESS: <Wrench className="w-5 h-5" />,
  PARTS_ORDERED: <Package className="w-5 h-5" />,
  RESOLVED: <CheckCircle className="w-5 h-5" />,
  CLOSED: <CheckCircle className="w-5 h-5" />,
};

export function TicketStatusCard({
  currentStatus,
  createdAt,
  nextStepInfo,
}: TicketStatusCardProps) {
  const t = useTranslations("patient.maintenance");
  const tDetail = useTranslations("patient.ticketDetail");

  const currentIndex = statusOrder.indexOf(currentStatus);

  // Build simplified timeline (not all statuses are always shown)
  const visibleStatuses: TicketStatus[] = ["OPEN", "ASSIGNED"];

  // Add intermediate statuses based on current status
  if (currentIndex >= statusOrder.indexOf("SCHEDULED")) {
    visibleStatuses.push("SCHEDULED");
  }
  if (currentIndex >= statusOrder.indexOf("IN_PROGRESS")) {
    visibleStatuses.push("IN_PROGRESS");
  }
  if (currentIndex >= statusOrder.indexOf("PARTS_ORDERED") && currentStatus === "PARTS_ORDERED") {
    visibleStatuses.push("PARTS_ORDERED");
  }

  // Always add final statuses
  visibleStatuses.push("RESOLVED", "CLOSED");

  const steps: StatusStep[] = visibleStatuses.map((status) => {
    const statusIndex = statusOrder.indexOf(status);
    return {
      status,
      label: ticketStatusLabels[status],
      icon: statusIcons[status],
      completed: statusIndex < currentIndex,
      current: status === currentStatus,
    };
  });

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "success";
      case "SCHEDULED":
      case "IN_PROGRESS":
        return "info";
      case "OPEN":
      case "ASSIGNED":
        return "warning";
      case "PARTS_ORDERED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tDetail("statusTitle")}</CardTitle>
          <Badge variant={getStatusColor(currentStatus) as "success" | "info" | "warning" | "secondary"}>
            {ticketStatusLabels[currentStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.status} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full
                      ${
                        step.completed
                          ? "bg-success text-white"
                          : step.current
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }
                    `}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`
                      text-xs mt-2 text-center
                      ${
                        step.completed || step.current
                          ? "text-neutral-900 font-medium"
                          : "text-neutral-400"
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 min-w-[20px]">
                    <ArrowRight
                      className={`w-4 h-4 ${
                        step.completed ? "text-success" : "text-neutral-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Created date */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 pt-4 border-t">
            <Clock className="w-4 h-4" />
            <span>
              {tDetail("createdOn")}: {new Date(createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Next step info */}
          {nextStepInfo && currentStatus !== "RESOLVED" && currentStatus !== "CLOSED" && (
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
              <p className="text-sm font-medium text-primary-700">
                {tDetail("nextStep")}
              </p>
              <p className="text-sm text-primary-600 mt-1">{nextStepInfo}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
