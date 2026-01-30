"use client";

import { useTranslations } from "next-intl";
import { Wrench, User, Phone, MapPin, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient, Product, Device } from "@/types";

interface TicketInfoProps {
  device: Device | undefined;
  product: Product | undefined;
  patient: Patient | undefined;
}

export function TicketInfo({ device, product, patient }: TicketInfoProps) {
  const t = useTranslations("admin.ticketDetail");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Device Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary-600" />
            {t("deviceInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("product")}</dt>
              <dd className="text-sm font-medium text-neutral-900">
                {product?.name || "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("serialNumber")}</dt>
              <dd className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-neutral-400" />
                {device?.serialNumber || "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("deliveredAt")}</dt>
              <dd className="text-sm font-medium text-neutral-900">
                {device?.deliveredAt
                  ? new Date(device.deliveredAt).toLocaleDateString("fr-FR")
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("warrantyExpires")}</dt>
              <dd className="text-sm font-medium text-neutral-900">
                {device?.warrantyExpiresAt
                  ? new Date(device.warrantyExpiresAt).toLocaleDateString("fr-FR")
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("deviceStatus")}</dt>
              <dd className="text-sm font-medium text-neutral-900">
                {device?.status || "-"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Patient Contact Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            {t("patientContact")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("patientName")}</dt>
              <dd className="text-sm font-medium text-neutral-900">
                {patient ? `${patient.firstName} ${patient.lastName}` : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("phone")}</dt>
              <dd className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                {patient?.phone || "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500">{t("email")}</dt>
              <dd className="text-sm font-medium text-neutral-900">
                {patient?.email || "-"}
              </dd>
            </div>
            {patient?.address && (
              <div className="pt-2 border-t border-neutral-100">
                <dt className="text-sm text-neutral-500 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {t("address")}
                </dt>
                <dd className="text-sm text-neutral-900">
                  <p>{patient.address.street}</p>
                  <p>
                    {patient.address.postalCode} {patient.address.city}
                  </p>
                  {patient.address.deliveryNotes && (
                    <p className="text-neutral-500 text-xs mt-1">
                      {patient.address.deliveryNotes}
                    </p>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
