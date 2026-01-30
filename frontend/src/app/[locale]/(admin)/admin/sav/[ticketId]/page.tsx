"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Wrench,
  Calendar,
  Package,
  CheckCircle,
  FileText,
  Clock,
  User,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketHeader } from "@/components/admin/sav/ticket-header";
import { TicketInfo } from "@/components/admin/sav/ticket-info";
import { TicketScheduler } from "@/components/admin/sav/ticket-scheduler";
import { TicketResolution } from "@/components/admin/sav/ticket-resolution";
import {
  getTicketById,
  getDeviceById,
  ticketCategoryLabels,
} from "@/lib/mocks/data/devices";
import { findPatientById } from "@/lib/mocks/data/users";
import { getProductById } from "@/lib/mocks/data/products";

// Mock parts data
const mockParts = [
  {
    id: "part-1",
    name: "Batterie lithium-ion 24V",
    partNumber: "BAT-LI-24V",
    status: "ORDERED",
    quantity: 1,
    orderedAt: "2024-02-12T10:00:00Z",
  },
  {
    id: "part-2",
    name: "Roulement roue arriere",
    partNumber: "RLT-AR-001",
    status: "DELIVERED",
    quantity: 2,
    orderedAt: "2024-02-10T14:00:00Z",
    deliveredAt: "2024-02-13T09:00:00Z",
  },
];

// Mock history data
const mockHistory = [
  {
    id: "hist-1",
    action: "CREATED",
    description: "Ticket cree",
    performedBy: "Systeme",
    timestamp: "2024-02-01T10:00:00Z",
  },
  {
    id: "hist-2",
    action: "ASSIGNED",
    description: "Assigne a Lucas Moreau",
    performedBy: "Marie Martin",
    timestamp: "2024-02-02T09:30:00Z",
  },
  {
    id: "hist-3",
    action: "SCHEDULED",
    description: "Visite planifiee pour le 15/02/2024",
    performedBy: "Marie Martin",
    timestamp: "2024-02-03T11:00:00Z",
  },
];

const partStatusColors: Record<string, "warning" | "info" | "success"> = {
  ORDERED: "warning",
  SHIPPED: "info",
  DELIVERED: "success",
};

const partStatusLabels: Record<string, string> = {
  ORDERED: "Commande",
  SHIPPED: "Expedie",
  DELIVERED: "Livre",
};

export default function TicketDetailPage() {
  const t = useTranslations("admin.ticketDetail");
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [activeTab, setActiveTab] = useState("details");

  const ticket = getTicketById(ticketId);
  const device = ticket ? getDeviceById(ticket.deviceId) : undefined;
  const product = device?.productId ? getProductById(device.productId) : undefined;
  const patient = ticket ? findPatientById(ticket.patientId) : undefined;

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/sav"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToList")}
        </Link>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <h2 className="text-lg font-semibold text-neutral-700">
              {t("ticketNotFound")}
            </h2>
            <p className="text-neutral-500 mt-1">{t("ticketNotFoundDesc")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticketNumber = `SAV-${ticket.id.split("-")[1]?.toUpperCase() || ticket.id}`;

  const handleSchedule = (data: { date: string; timeSlot: string; technicianId: string }) => {
    console.log("Schedule data:", data);
    // In a real app, this would make an API call
  };

  const handleResolve = (data: { outcome: string; notes: string }) => {
    console.log("Resolution data:", data);
    // In a real app, this would make an API call
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/sav"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToList")}
      </Link>

      {/* Ticket Header */}
      <TicketHeader ticket={ticket} ticketNumber={ticketNumber} />

      {/* Device and Patient Info */}
      <TicketInfo device={device} product={product} patient={patient} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details" className="gap-2">
            <FileText className="w-4 h-4" />
            {t("tabs.details")}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            {t("tabs.schedule")}
          </TabsTrigger>
          <TabsTrigger value="parts" className="gap-2">
            <Package className="w-4 h-4" />
            {t("tabs.parts")}
          </TabsTrigger>
          <TabsTrigger value="resolution" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            {t("tabs.resolution")}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("description")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {ticket.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500">{t("category")}</p>
                      <p className="font-medium text-neutral-900">
                        {ticketCategoryLabels[ticket.category]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">{t("createdAt")}</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(ticket.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  {t("history")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHistory.map((item, index) => (
                    <div
                      key={item.id}
                      className={`relative pl-6 pb-4 ${
                        index !== mockHistory.length - 1
                          ? "border-l-2 border-neutral-200"
                          : ""
                      }`}
                    >
                      <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary-500" />
                      <p className="text-sm font-medium text-neutral-900">
                        {item.description}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {item.performedBy} -{" "}
                        {new Date(item.timestamp).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <TicketScheduler ticket={ticket} onSchedule={handleSchedule} />
        </TabsContent>

        {/* Parts Tab */}
        <TabsContent value="parts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                {t("partsOrdered")}
              </CardTitle>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t("addPart")}
              </Button>
            </CardHeader>
            <CardContent>
              {mockParts.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {mockParts.map((part) => (
                    <div
                      key={part.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900">{part.name}</p>
                          <Badge variant={partStatusColors[part.status]} size="sm">
                            {partStatusLabels[part.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {t("partNumber")}: {part.partNumber} | {t("quantity")}:{" "}
                          {part.quantity}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {t("orderedOn")}{" "}
                          {new Date(part.orderedAt).toLocaleDateString("fr-FR")}
                          {part.deliveredAt && (
                            <>
                              {" "}
                              - {t("deliveredOn")}{" "}
                              {new Date(part.deliveredAt).toLocaleDateString("fr-FR")}
                            </>
                          )}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-neutral-500">{t("noPartsOrdered")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resolution Tab */}
        <TabsContent value="resolution">
          <TicketResolution ticket={ticket} onResolve={handleResolve} />
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-end">
            {ticket.status === "OPEN" && (
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                {t("actions.assign")}
              </Button>
            )}
            {(ticket.status === "OPEN" || ticket.status === "ASSIGNED") && (
              <Button variant="outline" onClick={() => setActiveTab("schedule")}>
                <Calendar className="w-4 h-4 mr-2" />
                {t("actions.scheduleVisit")}
              </Button>
            )}
            {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
              <>
                <Button variant="outline" onClick={() => setActiveTab("parts")}>
                  <Package className="w-4 h-4 mr-2" />
                  {t("actions.orderParts")}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setActiveTab("resolution")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t("actions.resolve")}
                </Button>
              </>
            )}
            {ticket.status === "RESOLVED" && (
              <Button variant="outline">
                <X className="w-4 h-4 mr-2" />
                {t("actions.close")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
