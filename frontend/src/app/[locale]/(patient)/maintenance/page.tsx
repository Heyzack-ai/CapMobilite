"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth.store";
import {
  getTicketsByPatientId,
  ticketCategoryLabels,
  ticketSeverityLabels,
  ticketStatusLabels,
} from "@/lib/mocks/data/devices";
import { getDeviceById } from "@/lib/mocks/data/devices";
import { getProductById } from "@/lib/mocks/data/products";

export default function MaintenancePage() {
  const t = useTranslations("patient.maintenance");
  const { user } = useAuthStore();

  const patientId = user?.id || "user-1";
  const tickets = getTicketsByPatientId(patientId);

  const openTickets = tickets.filter(
    (t) => !["RESOLVED", "CLOSED"].includes(t.status)
  );
  const closedTickets = tickets.filter((t) =>
    ["RESOLVED", "CLOSED"].includes(t.status)
  );

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "success";
      case "SCHEDULED":
      case "IN_PROGRESS":
        return "info";
      case "OPEN":
      case "ASSIGNED":
        return "warning";
      default:
        return "secondary";
    }
  };

  const TicketCard = ({ ticket }: { ticket: (typeof tickets)[0] }) => {
    const device = getDeviceById(ticket.deviceId);
    const product = device?.productId ? getProductById(device.productId) : undefined;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <Link href={`/maintenance/${ticket.id}`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getSeverityColor(ticket.severity) as "default" | "error" | "warning" | "info" | "secondary"}>
                    {ticketSeverityLabels[ticket.severity]}
                  </Badge>
                  <Badge variant={getStatusColor(ticket.status) as "default" | "success" | "warning" | "info" | "secondary"}>
                    {ticketStatusLabels[ticket.status]}
                  </Badge>
                  {ticket.isSafetyIssue && (
                    <Badge variant="error" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t("safetyIssue")}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold mt-2">
                  {ticketCategoryLabels[ticket.category]}
                </h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                  {ticket.description}
                </p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-4 h-4" />
                    {product?.name || "Équipement"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Scheduled Visit */}
            {ticket.scheduledVisit && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                <p className="text-sm font-medium text-primary-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("scheduledVisit")}
                </p>
                <div className="mt-1 text-sm text-primary-600">
                  <p>
                    {ticket.scheduledVisit.date} - {ticket.scheduledVisit.timeSlot}
                  </p>
                  <p className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" />
                    {ticket.scheduledVisit.technicianName}
                  </p>
                </div>
              </div>
            )}

            {/* Resolution Notes */}
            {ticket.resolvedAt && ticket.resolutionNotes && (
              <div className="mt-4 p-3 bg-success/5 rounded-lg border border-success/20">
                <p className="text-sm font-medium text-success flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {t("resolved")}: {new Date(ticket.resolvedAt).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-neutral-600 mt-1">{ticket.resolutionNotes}</p>
              </div>
            )}
          </CardContent>
        </Link>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/maintenance/nouveau">
            <Plus className="w-4 h-4 mr-2" />
            {t("newTicket")}
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open" className="gap-2">
            {t("openTickets")}
            {openTickets.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                {openTickets.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="closed">
            {t("closedTickets")} ({closedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          {openTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success/30" />
                <h3 className="text-lg font-medium text-neutral-900">{t("noOpenTickets")}</h3>
                <p className="text-neutral-500 mt-1">{t("noOpenTicketsDescription")}</p>
                <Button className="mt-4" asChild>
                  <Link href="/maintenance/nouveau">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("reportIssue")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {openTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          {closedTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                <h3 className="text-lg font-medium text-neutral-900">{t("noClosedTickets")}</h3>
                <p className="text-neutral-500 mt-1">{t("noClosedTicketsDescription")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {closedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
