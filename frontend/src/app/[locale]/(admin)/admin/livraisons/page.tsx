"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Package,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockDevices } from "@/lib/mocks/data/devices";
import { findPatientById } from "@/lib/mocks/data/users";
import { getProductById } from "@/lib/mocks/data/products";

interface Delivery {
  id: string;
  deviceId: string;
  patientId: string;
  status: "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
  scheduledDate?: string;
  deliveredAt?: string;
  address: string;
  notes?: string;
  technicianId?: string;
  technicianName?: string;
}

// Mock deliveries based on devices
const mockDeliveries: Delivery[] = [
  {
    id: "delivery-1",
    deviceId: "device-1",
    patientId: "user-1",
    status: "DELIVERED",
    scheduledDate: "2024-01-20",
    deliveredAt: "2024-01-20T10:30:00",
    address: "15 Rue de la République, 75001 Paris",
    technicianId: "tech-1",
    technicianName: "Pierre Martin",
  },
  {
    id: "delivery-2",
    deviceId: "device-2",
    patientId: "patient-1",
    status: "SCHEDULED",
    scheduledDate: "2024-02-28",
    address: "42 Avenue des Champs-Élysées, 75008 Paris",
    technicianId: "tech-2",
    technicianName: "Marie Dupont",
  },
  {
    id: "delivery-3",
    deviceId: "device-3",
    patientId: "patient-2",
    status: "IN_TRANSIT",
    scheduledDate: "2024-02-15",
    address: "8 Place Bellecour, 69002 Lyon",
    technicianId: "tech-1",
    technicianName: "Pierre Martin",
  },
  {
    id: "delivery-4",
    deviceId: "device-4",
    patientId: "patient-3",
    status: "PENDING",
    address: "25 Quai des Belges, 13001 Marseille",
    notes: "Attente confirmation CPAM",
  },
];

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  SCHEDULED: "Planifiée",
  IN_TRANSIT: "En cours",
  DELIVERED: "Livrée",
  FAILED: "Échouée",
};

const statusColors: Record<string, string> = {
  PENDING: "secondary",
  SCHEDULED: "info",
  IN_TRANSIT: "warning",
  DELIVERED: "success",
  FAILED: "error",
};

export default function DeliveriesPage() {
  const t = useTranslations("admin.deliveries");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredDeliveries = mockDeliveries.filter((delivery) => {
    const patient = findPatientById(delivery.patientId);
    const matchesSearch =
      delivery.address.toLowerCase().includes(search.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(search.toLowerCase()) ||
      patient?.firstName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || delivery.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockDeliveries.filter((d) => d.status === "PENDING").length;
  const scheduledCount = mockDeliveries.filter((d) => d.status === "SCHEDULED").length;
  const inTransitCount = mockDeliveries.filter((d) => d.status === "IN_TRANSIT").length;
  const deliveredCount = mockDeliveries.filter((d) => d.status === "DELIVERED").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "SCHEDULED":
        return <Calendar className="w-4 h-4" />;
      case "IN_TRANSIT":
        return <Truck className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "PENDING" ? "ring-2 ring-primary-500" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "PENDING" ? null : "PENDING")}
        >
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-sm text-neutral-500">{t("pending")}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "SCHEDULED" ? "ring-2 ring-primary-500" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "SCHEDULED" ? null : "SCHEDULED")}
        >
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-info" />
            <p className="text-2xl font-bold text-info">{scheduledCount}</p>
            <p className="text-sm text-neutral-500">{t("scheduled")}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "IN_TRANSIT" ? "ring-2 ring-primary-500" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "IN_TRANSIT" ? null : "IN_TRANSIT")}
        >
          <CardContent className="p-4 text-center">
            <Truck className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold text-warning">{inTransitCount}</p>
            <p className="text-sm text-neutral-500">{t("inTransit")}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "DELIVERED" ? "ring-2 ring-primary-500" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "DELIVERED" ? null : "DELIVERED")}
        >
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold text-success">{deliveredCount}</p>
            <p className="text-sm text-neutral-500">{t("delivered")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {statusFilter && (
              <Button variant="outline" onClick={() => setStatusFilter(null)}>
                {t("clearFilter")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-500">{t("noDeliveriesFound")}</p>
            </CardContent>
          </Card>
        ) : (
          filteredDeliveries.map((delivery) => {
            const patient = findPatientById(delivery.patientId);
            const device = mockDevices.find((d) => d.id === delivery.deviceId);
            const product = device?.productId ? getProductById(device.productId) : undefined;

            return (
              <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Status & Device */}
                      <div className="flex items-center gap-3 mb-3">
                        <Badge
                          variant={statusColors[delivery.status] as "default" | "success" | "warning" | "info" | "secondary"}
                          className="gap-1"
                        >
                          {getStatusIcon(delivery.status)}
                          {statusLabels[delivery.status]}
                        </Badge>
                        <span className="text-sm text-neutral-500">
                          {product?.name || "N/A"} ({device?.serialNumber})
                        </span>
                      </div>

                      {/* Patient & Address */}
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 font-medium">
                          <User className="w-4 h-4 text-neutral-400" />
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-neutral-600">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          {delivery.address}
                        </p>
                      </div>

                      {/* Schedule Info */}
                      {delivery.scheduledDate && (
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-neutral-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(delivery.scheduledDate).toLocaleDateString("fr-FR")}
                          </span>
                          {delivery.technicianName && (
                            <span className="flex items-center gap-1 text-neutral-500">
                              <User className="w-4 h-4" />
                              {delivery.technicianName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {delivery.notes && (
                        <p className="mt-2 text-sm text-warning bg-warning/10 px-3 py-2 rounded">
                          {delivery.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/livraisons/${delivery.id}`}>
                          Voir
                        </Link>
                      </Button>
                      {delivery.status === "PENDING" && (
                        <Button size="sm" asChild>
                          <Link href={`/admin/livraisons/${delivery.id}`}>
                            {t("schedule")}
                          </Link>
                        </Button>
                      )}
                      {delivery.status === "SCHEDULED" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/livraisons/${delivery.id}`}>
                            {t("startDelivery")}
                          </Link>
                        </Button>
                      )}
                      {delivery.status === "IN_TRANSIT" && (
                        <Button size="sm" className="bg-success hover:bg-success/90" asChild>
                          <Link href={`/admin/livraisons/${delivery.id}`}>
                            {t("markDelivered")}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
