"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import {
  Wrench,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  mockTickets,
  ticketCategoryLabels,
  ticketSeverityLabels,
  ticketStatusLabels,
  getDeviceById,
} from "@/lib/mocks/data/devices";
import { findPatientById } from "@/lib/mocks/data/users";
import { getProductById } from "@/lib/mocks/data/products";

export default function AdminSAVPage() {
  const t = useTranslations("admin.sav");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredTickets = mockTickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
    if (severityFilter !== "all" && ticket.severity !== severityFilter) return false;
    return true;
  });

  const severityColors = {
    LOW: "secondary",
    MEDIUM: "info",
    HIGH: "warning",
    CRITICAL: "error",
  };

  const statusColors = {
    OPEN: "warning",
    ASSIGNED: "info",
    SCHEDULED: "info",
    IN_PROGRESS: "info",
    PARTS_ORDERED: "warning",
    RESOLVED: "success",
    CLOSED: "secondary",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.open")}</p>
            <p className="text-2xl font-bold">
              {mockTickets.filter((t) => t.status === "OPEN").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.inProgress")}</p>
            <p className="text-2xl font-bold">
              {mockTickets.filter((t) => t.status === "IN_PROGRESS").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.critical")}</p>
            <p className="text-2xl font-bold text-error">
              {mockTickets.filter((t) => t.severity === "CRITICAL").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.resolved")}</p>
            <p className="text-2xl font-bold text-success">
              {mockTickets.filter((t) => t.status === "RESOLVED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input placeholder={t("search")} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                {Object.entries(ticketStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t("filterBySeverity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allSeverities")}</SelectItem>
                {Object.entries(ticketSeverityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => {
          const device = getDeviceById(ticket.deviceId);
          const product = device?.productId ? getProductById(device.productId) : undefined;
          const patient = findPatientById(ticket.patientId);

          return (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={severityColors[ticket.severity] as "default" | "error" | "warning" | "info" | "secondary"}
                      >
                        {ticketSeverityLabels[ticket.severity]}
                      </Badge>
                      <Badge
                        variant={statusColors[ticket.status] as "default" | "success" | "warning" | "info" | "secondary"}
                      >
                        {ticketStatusLabels[ticket.status]}
                      </Badge>
                      {ticket.isSafetyIssue && (
                        <Badge variant="error" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {t("safetyIssue")}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mt-2">
                      {ticketCategoryLabels[ticket.category]}
                    </h3>
                    <p className="text-neutral-500 mt-1">{ticket.description}</p>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {patient?.firstName} {patient?.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wrench className="w-4 h-4" />
                        {product?.name || "Équipement"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {ticket.scheduledVisit && (
                      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                        <p className="text-sm font-medium text-primary-700">
                          {t("scheduled")}: {ticket.scheduledVisit.date} ({ticket.scheduledVisit.timeSlot})
                        </p>
                        <p className="text-sm text-primary-600">
                          {t("technician")}: {ticket.scheduledVisit.technicianName}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/sav/${ticket.id}`}>{t("view")}</Link>
                    </Button>
                    {ticket.status === "OPEN" && (
                      <Button size="sm">{t("assign")}</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredTickets.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-neutral-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noTickets")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
