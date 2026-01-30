"use client";

import { useTranslations } from "next-intl";
import {
  Package,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DeliveryStatus = "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

interface Delivery {
  id: string;
  status: DeliveryStatus;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  deliveredAt?: string;
  technicianName?: string;
  createdAt: string;
}

interface DeliveryTimelineProps {
  delivery: Delivery;
}

interface TimelineStep {
  key: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "current" | "pending" | "failed";
  date?: string;
}

const statusOrder: DeliveryStatus[] = ["PENDING", "SCHEDULED", "IN_TRANSIT", "DELIVERED"];

export function DeliveryTimeline({ delivery }: DeliveryTimelineProps) {
  const t = useTranslations("admin.deliveryDetail");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSlotLabel = (slot?: string) => {
    switch (slot) {
      case "morning":
        return t("schedule.morning");
      case "afternoon":
        return t("schedule.afternoon");
      case "evening":
        return t("schedule.evening");
      default:
        return "";
    }
  };

  const getStepStatus = (stepStatus: DeliveryStatus): "completed" | "current" | "pending" | "failed" => {
    if (delivery.status === "FAILED") {
      if (stepStatus === delivery.status) return "failed";
      const deliveryIndex = statusOrder.indexOf("IN_TRANSIT");
      const stepIndex = statusOrder.indexOf(stepStatus);
      return stepIndex <= deliveryIndex ? "completed" : "pending";
    }

    const currentIndex = statusOrder.indexOf(delivery.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const timelineSteps: TimelineStep[] = [
    {
      key: "created",
      labelKey: "tracking.timeline.created",
      icon: Package,
      status: "completed",
      date: delivery.createdAt,
    },
    {
      key: "scheduled",
      labelKey: "tracking.timeline.scheduled",
      icon: Calendar,
      status: getStepStatus("SCHEDULED"),
      date: delivery.scheduledDate,
    },
    {
      key: "inTransit",
      labelKey: "tracking.timeline.inTransit",
      icon: Truck,
      status: getStepStatus("IN_TRANSIT"),
    },
    {
      key: delivery.status === "FAILED" ? "failed" : "delivered",
      labelKey: delivery.status === "FAILED" ? "tracking.timeline.failed" : "tracking.timeline.delivered",
      icon: delivery.status === "FAILED" ? XCircle : CheckCircle,
      status: delivery.status === "FAILED" ? "failed" : getStepStatus("DELIVERED"),
      date: delivery.deliveredAt,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary-500" />
            {t("tracking.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-500">{t("tracking.currentStatus")}</p>
              <Badge
                variant={
                  delivery.status === "DELIVERED"
                    ? "success"
                    : delivery.status === "FAILED"
                    ? "error"
                    : delivery.status === "IN_TRANSIT"
                    ? "default"
                    : "info"
                }
                className="mt-1"
              >
                {t(`status.${delivery.status}`)}
              </Badge>
            </div>
            {delivery.scheduledDate && (
              <div>
                <p className="text-sm text-neutral-500">{t("tracking.estimatedDelivery")}</p>
                <p className="font-medium mt-1">
                  {formatDate(delivery.scheduledDate)}
                  {delivery.scheduledTimeSlot && (
                    <span className="text-neutral-500 text-sm ml-2">
                      ({getTimeSlotLabel(delivery.scheduledTimeSlot)})
                    </span>
                  )}
                </p>
              </div>
            )}
            {delivery.technicianName && (
              <div>
                <p className="text-sm text-neutral-500">{t("tracking.technicianAssigned")}</p>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-400" />
                  {delivery.technicianName}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200" />

            <div className="space-y-8">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "current";
                const isFailed = step.status === "failed";

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-success text-white"
                          : isCurrent
                          ? "bg-primary-500 text-white"
                          : isFailed
                          ? "bg-error text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-3">
                        <p
                          className={`font-medium ${
                            isCompleted || isCurrent
                              ? "text-neutral-900"
                              : isFailed
                              ? "text-error"
                              : "text-neutral-400"
                          }`}
                        >
                          {t(step.labelKey)}
                        </p>
                        {isCurrent && (
                          <Badge variant="info" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            En cours
                          </Badge>
                        )}
                      </div>
                      {step.date && (
                        <p className="text-sm text-neutral-500 mt-1">
                          {formatDate(step.date)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
