"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, User, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServiceTicket } from "@/types";

interface TicketSchedulerProps {
  ticket: ServiceTicket;
  onSchedule?: (data: ScheduleData) => void;
}

interface ScheduleData {
  date: string;
  timeSlot: string;
  technicianId: string;
}

const mockTechnicians = [
  { id: "tech-1", name: "Lucas Moreau" },
  { id: "tech-2", name: "Emma Bernard" },
  { id: "tech-3", name: "Thomas Petit" },
];

const timeSlots = [
  "08:00-10:00",
  "09:00-12:00",
  "10:00-12:00",
  "14:00-16:00",
  "14:00-17:00",
  "16:00-18:00",
];

export function TicketScheduler({ ticket, onSchedule }: TicketSchedulerProps) {
  const t = useTranslations("admin.ticketDetail");
  const [date, setDate] = useState(ticket.scheduledVisit?.date || "");
  const [timeSlot, setTimeSlot] = useState(ticket.scheduledVisit?.timeSlot || "");
  const [technicianId, setTechnicianId] = useState(
    ticket.scheduledVisit?.technicianId || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSchedule && date && timeSlot && technicianId) {
      onSchedule({ date, timeSlot, technicianId });
    }
  };

  const isScheduled = ticket.status === "SCHEDULED" && ticket.scheduledVisit;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          {t("scheduleVisit")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isScheduled && (
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm font-medium text-primary-700 mb-2">
              {t("currentSchedule")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-primary-900">
                  {new Date(ticket.scheduledVisit!.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-primary-900">
                  {ticket.scheduledVisit!.timeSlot}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-primary-900">
                  {ticket.scheduledVisit!.technicianName}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visit-date">{t("visitDate")}</Label>
              <Input
                id="visit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="time-slot">{t("timeSlot")}</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger id="time-slot" className="mt-1.5">
                  <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                  <SelectValue placeholder={t("selectTimeSlot")} />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="technician">{t("assignTechnician")}</Label>
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger id="technician" className="mt-1.5">
                <User className="w-4 h-4 mr-2 text-neutral-400" />
                <SelectValue placeholder={t("selectTechnician")} />
              </SelectTrigger>
              <SelectContent>
                {mockTechnicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={!date || !timeSlot || !technicianId}>
              <Save className="w-4 h-4 mr-2" />
              {isScheduled ? t("updateSchedule") : t("scheduleVisit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
