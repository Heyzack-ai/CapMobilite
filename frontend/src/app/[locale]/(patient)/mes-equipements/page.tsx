"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Accessibility,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Wrench,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { getDevicesByPatientId, getTicketsByDeviceId } from "@/lib/mocks/data/devices";
import { getProductById } from "@/lib/mocks/data/products";

export default function DevicesPage() {
  const t = useTranslations("patient.devices");
  const { user } = useAuthStore();

  const patientId = user?.id || "user-1";
  const devices = getDevicesByPatientId(patientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Devices List */}
      {devices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Accessibility className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-900">{t("noDevices")}</h3>
            <p className="text-neutral-500 mt-1">{t("noDevicesDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {devices.map((device) => {
            const product = device.productId ? getProductById(device.productId) : undefined;
            const tickets = getTicketsByDeviceId(device.id);
            const openTickets = tickets.filter(
              (t) => !["RESOLVED", "CLOSED"].includes(t.status)
            );
            const warrantyExpired = device.warrantyExpiresAt ? new Date(device.warrantyExpiresAt) < new Date() : true;

            return (
              <Card key={device.id} className="hover:shadow-md transition-shadow">
                <Link href={`/mes-equipements/${device.id}`}>
                  <CardContent className="p-6">
                    {/* Device Header */}
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Accessibility className="w-10 h-10 text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {product?.name || "Équipement"}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          S/N: {device.serialNumber}
                        </p>
                        <Badge
                          variant={device.status === "ACTIVE" ? "success" : "warning"}
                          className="mt-2"
                        >
                          {device.status === "ACTIVE" ? t("active") : t("inRepair")}
                        </Badge>
                      </div>
                    </div>

                    {/* Device Info */}
                    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                      {/* Delivery Date */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-500">{t("deliveredOn")}:</span>
                        <span>{device.deliveredAt ? new Date(device.deliveredAt).toLocaleDateString("fr-FR") : "-"}</span>
                      </div>

                      {/* Warranty Status */}
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className={`w-4 h-4 ${warrantyExpired ? "text-error" : "text-success"}`} />
                        {warrantyExpired ? (
                          <span className="text-error flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {t("warrantyExpired")}
                          </span>
                        ) : (
                          <span className="text-success flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {t("underWarranty")} ({t("until")} {device.warrantyExpiresAt ? new Date(device.warrantyExpiresAt).toLocaleDateString("fr-FR") : "-"})
                          </span>
                        )}
                      </div>

                      {/* Open Tickets */}
                      {openTickets.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-warning">
                          <Wrench className="w-4 h-4" />
                          <span>
                            {openTickets.length} {t("openTickets")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-neutral-100 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/mes-equipements/${device.id}`}>
                          {t("viewDetails")}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/maintenance/nouveau?deviceId=${device.id}`}>
                          <Wrench className="w-4 h-4 mr-1" />
                          {t("reportIssue")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Specifications Info */}
      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("needHelp")}</CardTitle>
            <CardDescription>{t("needHelpDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/maintenance/nouveau">{t("reportIssue")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/support">{t("contactSupport")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
