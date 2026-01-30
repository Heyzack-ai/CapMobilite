"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ServiceTicket } from "@/types";

interface TicketHeaderProps {
  ticket: ServiceTicket;
  ticketNumber: string;
}

const severityColors: Record<string, "secondary" | "info" | "warning" | "error"> = {
  LOW: "secondary",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "error",
};

const statusColors: Record<string, "warning" | "info" | "success" | "secondary"> = {
  OPEN: "warning",
  ASSIGNED: "info",
  SCHEDULED: "info",
  IN_PROGRESS: "info",
  PARTS_ORDERED: "warning",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const severityLabels: Record<string, string> = {
  LOW: "Faible",
  MEDIUM: "Moyen",
  HIGH: "Elevee",
  CRITICAL: "Critique",
};

const statusLabels: Record<string, string> = {
  OPEN: "Ouvert",
  ASSIGNED: "Assigne",
  SCHEDULED: "Planifie",
  IN_PROGRESS: "En cours",
  PARTS_ORDERED: "Pieces commandees",
  RESOLVED: "Resolu",
  CLOSED: "Cloture",
};

export function TicketHeader({ ticket, ticketNumber }: TicketHeaderProps) {
  const t = useTranslations("admin.ticketDetail");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
          <span>{t("ticketNumber")}</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{ticketNumber}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={severityColors[ticket.severity]} size="lg">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          {severityLabels[ticket.severity]}
        </Badge>

        <Badge variant={statusColors[ticket.status]} size="lg">
          {statusLabels[ticket.status]}
        </Badge>

        {ticket.isSafetyIssue && (
          <Badge variant="error" size="lg" className="gap-1">
            <Shield className="w-3.5 h-3.5" />
            {t("safetyIssue")}
          </Badge>
        )}
      </div>
    </div>
  );
}
