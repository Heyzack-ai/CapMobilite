"use client";

import { useTranslations } from "next-intl";
import { Calendar, Clock, User, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScheduledVisit } from "@/types";

interface TicketVisitCardProps {
  scheduledVisit: ScheduledVisit;
  patientAddress?: string;
}

export function TicketVisitCard({
  scheduledVisit,
  patientAddress,
}: TicketVisitCardProps) {
  const t = useTranslations("patient.maintenance");
  const tDetail = useTranslations("patient.ticketDetail");

  // Parse the date for display
  const visitDate = new Date(scheduledVisit.date);
  const formattedDate = visitDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Check if visit is today or in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = visitDate.toDateString() === today.toDateString();
  const isPast = visitDate < today;

  return (
    <Card className={isToday ? "border-primary-300 bg-primary-50/30" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            {tDetail("scheduledVisitTitle")}
          </CardTitle>
          {isToday && (
            <Badge variant="info" size="lg">
              {tDetail("today")}
            </Badge>
          )}
          {isPast && (
            <Badge variant="warning" size="lg">
              {tDetail("pastVisit")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100">
            <Calendar className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 capitalize">
              {formattedDate}
            </p>
            <div className="flex items-center gap-1 text-sm text-neutral-600 mt-1">
              <Clock className="w-4 h-4" />
              <span>{scheduledVisit.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* Technician Info */}
        <div className="flex items-start gap-4 pt-3 border-t">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary-100">
            <User className="w-6 h-6 text-secondary-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">{tDetail("technician")}</p>
            <p className="font-semibold text-neutral-900">
              {scheduledVisit.technicianName}
            </p>
          </div>
        </div>

        {/* Address */}
        {patientAddress && (
          <div className="flex items-start gap-4 pt-3 border-t">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-neutral-100">
              <MapPin className="w-6 h-6 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">{tDetail("visitAddress")}</p>
              <p className="font-medium text-neutral-900">{patientAddress}</p>
            </div>
          </div>
        )}

        {/* Important notice */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mt-4">
          <p className="text-sm text-amber-800">
            <strong>{tDetail("importantNotice")}</strong>{" "}
            {tDetail("visitNotice")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
