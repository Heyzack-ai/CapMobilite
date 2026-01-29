"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  FolderOpen,
  Accessibility,
  Wrench,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { getCasesByPatientId, caseStatusLabels, caseStatusColors } from "@/lib/mocks/data/cases";
import { getDevicesByPatientId, getTicketsByPatientId } from "@/lib/mocks/data/devices";
import { getProductById } from "@/lib/mocks/data/products";

export default function PatientDashboard() {
  const t = useTranslations("patient.dashboard");
  const { user } = useAuthStore();

  const patientId = user?.id || "user-1";
  const cases = getCasesByPatientId(patientId);
  const devices = getDevicesByPatientId(patientId);
  const tickets = getTicketsByPatientId(patientId);

  const activeCases = cases.filter(
    (c) => !["DELIVERED", "CLOSED", "CANCELLED"].includes(c.status)
  );
  const openTickets = tickets.filter(
    (t) => !["RESOLVED", "CLOSED"].includes(t.status)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {t("welcome")}, {user?.firstName}
        </h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCases.length}</p>
                <p className="text-sm text-neutral-500">{t("activeCases")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                <Accessibility className="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{devices.length}</p>
                <p className="text-sm text-neutral-500">{t("myDevices")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openTickets.length}</p>
                <p className="text-sm text-neutral-500">{t("openTickets")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cases.length}</p>
                <p className="text-sm text-neutral-500">{t("totalCases")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>{t("activeCasesTitle")}</CardTitle>
            <CardDescription>{t("activeCasesDescription")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dossiers">
              {t("viewAll")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activeCases.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noActiveCases")}</p>
              <Button variant="default" size="sm" className="mt-4" asChild>
                <Link href="/dossiers/nouveau">{t("newCase")}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/dossiers/${caseItem.id}`}
                  className="block p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{caseItem.caseNumber}</p>
                      <p className="text-sm text-neutral-500">
                        {t("created")}: {new Date(caseItem.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge variant={caseStatusColors[caseItem.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}>
                      {caseStatusLabels[caseItem.status]}
                    </Badge>
                  </div>
                  {caseItem.slaDeadline && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-warning">
                      <Clock className="w-4 h-4" />
                      <span>
                        {t("deadline")}: {new Date(caseItem.slaDeadline).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Devices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>{t("myDevicesTitle")}</CardTitle>
            <CardDescription>{t("myDevicesDescription")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/mes-equipements">
              {t("viewAll")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Accessibility className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noDevices")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((device) => {
                const product = getProductById(device.productId);
                const warrantyExpired = new Date(device.warrantyExpiresAt) < new Date();

                return (
                  <Link
                    key={device.id}
                    href={`/mes-equipements/${device.id}`}
                    className="p-4 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Accessibility className="w-8 h-8 text-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{product?.name || "Équipement"}</p>
                        <p className="text-sm text-neutral-500">S/N: {device.serialNumber}</p>
                        <div className="mt-1 flex items-center gap-1 text-sm">
                          {warrantyExpired ? (
                            <span className="text-error flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {t("warrantyExpired")}
                            </span>
                          ) : (
                            <span className="text-success flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {t("underWarranty")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Tickets */}
      {openTickets.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{t("openTicketsTitle")}</CardTitle>
              <CardDescription>{t("openTicketsDescription")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/maintenance">
                {t("viewAll")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/maintenance/${ticket.id}`}
                  className="block p-4 rounded-lg border border-neutral-200 hover:border-warning/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ticket.category}</p>
                      <p className="text-sm text-neutral-500 line-clamp-1">
                        {ticket.description}
                      </p>
                    </div>
                    <Badge variant={ticket.severity === "CRITICAL" ? "error" : ticket.severity === "HIGH" ? "warning" : "default"}>
                      {ticket.severity}
                    </Badge>
                  </div>
                  {ticket.scheduledVisit && (
                    <div className="mt-2 text-sm text-primary-600">
                      {t("scheduledVisit")}: {ticket.scheduledVisit.date} ({ticket.scheduledVisit.timeSlot})
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dossiers/nouveau">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary-600" />
              </div>
              <p className="font-medium">{t("newCaseAction")}</p>
              <p className="text-sm text-neutral-500 mt-1">{t("newCaseDescription")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/maintenance/nouveau">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-warning/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-warning" />
              </div>
              <p className="font-medium">{t("reportIssueAction")}</p>
              <p className="text-sm text-neutral-500 mt-1">{t("reportIssueDescription")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/support">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary-600" />
              </div>
              <p className="font-medium">{t("contactSupportAction")}</p>
              <p className="text-sm text-neutral-500 mt-1">{t("contactSupportDescription")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
