"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { TechnicianSelector } from "./technician-selector";

type DeliveryStatus = "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

interface Delivery {
  id: string;
  status: DeliveryStatus;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  technicianId?: string;
  technicianName?: string;
  notes?: string;
}

interface DeliveryScheduleProps {
  delivery: Delivery;
  onSchedule: () => void;
  isLoading: boolean;
}

export function DeliverySchedule({ delivery, onSchedule, isLoading }: DeliveryScheduleProps) {
  const t = useTranslations("admin.deliveryDetail");

  const [scheduledDate, setScheduledDate] = useState(delivery.scheduledDate || "");
  const [timeSlot, setTimeSlot] = useState(delivery.scheduledTimeSlot || "");
  const [technicianId, setTechnicianId] = useState(delivery.technicianId || "");
  const [notes, setNotes] = useState(delivery.notes || "");

  const isScheduled = delivery.status !== "PENDING";
  const canEdit = delivery.status === "PENDING" || delivery.status === "SCHEDULED";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getTimeSlotLabel = (slot: string) => {
    switch (slot) {
      case "morning":
        return t("schedule.morning");
      case "afternoon":
        return t("schedule.afternoon");
      case "evening":
        return t("schedule.evening");
      default:
        return slot;
    }
  };

  if (isScheduled && !canEdit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            {t("schedule.scheduled")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">{t("schedule.date")}</p>
                <p className="font-medium">
                  {delivery.scheduledDate ? formatDate(delivery.scheduledDate) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">{t("schedule.timeSlot")}</p>
                <p className="font-medium">
                  {delivery.scheduledTimeSlot ? getTimeSlotLabel(delivery.scheduledTimeSlot) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">{t("schedule.technician")}</p>
                <p className="font-medium">{delivery.technicianName || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          {t("schedule.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="delivery-date">{t("schedule.date")}</Label>
            <Input
              id="delivery-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="max-w-xs"
            />
          </div>

          {/* Time Slot Selector */}
          <div className="space-y-2">
            <Label htmlFor="time-slot">{t("schedule.timeSlot")}</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger id="time-slot" className="max-w-xs">
                <SelectValue placeholder={t("schedule.timeSlotPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t("schedule.morning")}</SelectItem>
                <SelectItem value="afternoon">{t("schedule.afternoon")}</SelectItem>
                <SelectItem value="evening">{t("schedule.evening")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Technician Selector */}
          <div className="space-y-2">
            <Label>{t("schedule.technician")}</Label>
            <TechnicianSelector
              value={technicianId}
              onChange={setTechnicianId}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="delivery-notes">{t("schedule.notes")}</Label>
            <Textarea
              id="delivery-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("schedule.notesPlaceholder")}
              rows={3}
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={onSchedule}
              loading={isLoading}
              disabled={!scheduledDate || !timeSlot || !technicianId}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {delivery.status === "PENDING" ? t("actions.schedule") : t("actions.save")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
