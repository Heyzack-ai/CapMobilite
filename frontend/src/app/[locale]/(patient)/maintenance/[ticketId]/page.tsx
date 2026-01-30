"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketStatusCard } from "@/components/patient/ticket-status-card";
import { TicketVisitCard } from "@/components/patient/ticket-visit-card";
import {
  getTicketById,
  getDeviceById,
  ticketCategoryLabels,
  ticketSeverityLabels,
} from "@/lib/mocks/data/devices";
import { getProductById } from "@/lib/mocks/data/products";
import { findPatientById } from "@/lib/mocks/data/users";

export default function TicketDetailPage() {
  const t = useTranslations("patient.maintenance");
  const tDetail = useTranslations("patient.ticketDetail");
  const tCommon = useTranslations("common");
  const params = useParams();

  const ticketId = params.ticketId as string;
  const ticket = getTicketById(ticketId);

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/maintenance"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tDetail("backToList")}
        </Link>

        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-900">
              {tDetail("notFound")}
            </h3>
            <p className="text-neutral-500 mt-1">
              {tDetail("notFoundDescription")}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/maintenance">{tDetail("backToList")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const device = getDeviceById(ticket.deviceId);
  const product = device?.productId ? getProductById(device.productId) : undefined;
  const patient = findPatientById(ticket.patientId);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      default:
        return "secondary";
    }
  };

  const getNextStepInfo = () => {
    switch (ticket.status) {
      case "OPEN":
        return tDetail("nextStepOpen");
      case "ASSIGNED":
        return tDetail("nextStepAssigned");
      case "SCHEDULED":
        return tDetail("nextStepScheduled");
      case "IN_PROGRESS":
        return tDetail("nextStepInProgress");
      case "PARTS_ORDERED":
        return tDetail("nextStepPartsOrdered");
      default:
        return undefined;
    }
  };

  const patientAddress = patient?.address
    ? `${patient.address.street}, ${patient.address.postalCode} ${patient.address.city}`
    : undefined;

  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/maintenance"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {tDetail("backToList")}
      </Link>

      {/* Ticket Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={getSeverityColor(ticket.severity) as "error" | "warning" | "info" | "secondary"}
            >
              {ticketSeverityLabels[ticket.severity]}
            </Badge>
            {ticket.isSafetyIssue && (
              <Badge variant="error" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t("safetyIssue")}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-2">
            {ticketCategoryLabels[ticket.category]}
          </h1>
          <p className="text-neutral-500 mt-1">
            {tDetail("ticketNumber")}: {ticket.id.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Device Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5 text-neutral-500" />
            {tDetail("deviceInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {product?.imageUrl && (
              <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-semibold text-neutral-900">
                {product?.name || tDetail("unknownDevice")}
              </p>
              {device && (
                <>
                  <p className="text-sm text-neutral-500">
                    {tDetail("serialNumber")}: {device.serialNumber}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {tDetail("deliveredOn")}:{" "}
                    {device.deliveredAt ? new Date(device.deliveredAt).toLocaleDateString("fr-FR") : "-"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Issue Description */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-neutral-700 mb-2">
              {tDetail("issueDescription")}
            </p>
            <p className="text-neutral-600">{ticket.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <TicketStatusCard
        currentStatus={ticket.status}
        createdAt={ticket.createdAt}
        nextStepInfo={getNextStepInfo()}
      />

      {/* Scheduled Visit Card */}
      {ticket.scheduledVisit && !isResolved && (
        <TicketVisitCard
          scheduledVisit={ticket.scheduledVisit}
          patientAddress={patientAddress}
        />
      )}

      {/* Resolution Card */}
      {isResolved && ticket.resolvedAt && (
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              {tDetail("resolutionTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-neutral-500">{tDetail("resolvedOn")}</p>
              <p className="font-medium text-neutral-900">
                {new Date(ticket.resolvedAt).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {ticket.resolutionNotes && (
              <div className="pt-3 border-t">
                <p className="text-sm text-neutral-500 mb-1">
                  {tDetail("resolutionNotes")}
                </p>
                <p className="text-neutral-700">{ticket.resolutionNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Support CTA Card */}
      <Card className="bg-primary-50 border-primary-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{tDetail("needHelp")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 mb-4">{tDetail("needHelpDescription")}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={`tel:${tCommon("phone").replace(/\s/g, "")}`}>
                <Phone className="w-4 h-4" />
                {tCommon("phone")}
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={`mailto:${tCommon("email")}`}>
                <Mail className="w-4 h-4" />
                {tDetail("emailUs")}
              </a>
            </Button>
            <Button variant="default" size="sm" className="gap-2" asChild>
              <Link href="/support">
                <MessageCircle className="w-4 h-4" />
                {tDetail("chatWithUs")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
