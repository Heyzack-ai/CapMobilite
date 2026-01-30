"use client";

import { useTranslations } from "next-intl";
import { Truck, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DeliveryStatus = "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

interface Delivery {
  id: string;
  status: DeliveryStatus;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  familyId: string;
}

interface Device {
  id: string;
  serialNumber: string;
  productId?: string;
}

interface DeliveryHeaderProps {
  delivery: Delivery;
  product?: Product;
  device?: Device;
}

const statusVariantMap: Record<DeliveryStatus, "default" | "info" | "warning" | "success" | "error"> = {
  PENDING: "warning",
  SCHEDULED: "info",
  IN_TRANSIT: "default",
  DELIVERED: "success",
  FAILED: "error",
};

export function DeliveryHeader({ delivery, product, device }: DeliveryHeaderProps) {
  const t = useTranslations("admin.deliveryDetail");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <Truck className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                {t("deliveryId")}: {delivery.id}
              </h1>
              <Badge variant={statusVariantMap[delivery.status]}>
                {t(`status.${delivery.status}`)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {product?.name || "N/A"}
              </span>
              {device && (
                <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">
                  SN: {device.serialNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {delivery.scheduledDate && (
            <div className="text-sm">
              <span className="text-neutral-500">{t("schedule.scheduledFor")}: </span>
              <span className="font-medium">{formatDate(delivery.scheduledDate)}</span>
            </div>
          )}
          <div className="text-xs text-neutral-400">
            {t("tracking.timeline.created")}: {formatDate(delivery.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
