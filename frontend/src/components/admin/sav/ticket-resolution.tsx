"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, FileText, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServiceTicket } from "@/types";

interface TicketResolutionProps {
  ticket: ServiceTicket;
  onResolve?: (data: ResolutionData) => void;
}

interface ResolutionData {
  outcome: string;
  notes: string;
}

const resolutionOutcomes = [
  { value: "REPAIRED", label: "Repare" },
  { value: "REPLACED", label: "Remplace" },
  { value: "ADJUSTED", label: "Ajuste" },
  { value: "NO_ISSUE_FOUND", label: "Aucun probleme trouve" },
  { value: "REFERRED", label: "Transfere" },
  { value: "PARTS_NEEDED", label: "Pieces necessaires" },
];

export function TicketResolution({ ticket, onResolve }: TicketResolutionProps) {
  const t = useTranslations("admin.ticketDetail");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState(ticket.resolutionNotes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onResolve && outcome && notes) {
      onResolve({ outcome, notes });
    }
  };

  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          {t("resolution")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isResolved && ticket.resolutionNotes && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-700">
                {t("resolvedOn")}{" "}
                {ticket.resolvedAt
                  ? new Date(ticket.resolvedAt).toLocaleDateString("fr-FR")
                  : "-"}
              </p>
            </div>
            <div className="flex items-start gap-2 mt-3">
              <FileText className="w-4 h-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-900">{ticket.resolutionNotes}</p>
            </div>
          </div>
        )}

        {!isResolved && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="outcome">{t("resolutionOutcome")}</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger id="outcome" className="mt-1.5">
                  <SelectValue placeholder={t("selectOutcome")} />
                </SelectTrigger>
                <SelectContent>
                  {resolutionOutcomes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Textarea
                id="resolution-notes"
                label={t("resolutionNotes")}
                placeholder={t("resolutionNotesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!outcome || !notes.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {t("markResolved")}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
