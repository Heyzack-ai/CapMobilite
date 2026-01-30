"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Truck,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Package,
  Phone,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliveryHeader } from "@/components/admin/deliveries/delivery-header";
import { DeliverySchedule } from "@/components/admin/deliveries/delivery-schedule";
import { DeliveryTimeline } from "@/components/admin/deliveries/delivery-timeline";
import { DeliveryConfirmation } from "@/components/admin/deliveries/delivery-confirmation";
import { mockDevices } from "@/lib/mocks/data/devices";
import { findPatientById } from "@/lib/mocks/data/users";
import { getProductById } from "@/lib/mocks/data/products";

// Types
type DeliveryStatus = "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

interface Delivery {
  id: string;
  deviceId: string;
  patientId: string;
  status: DeliveryStatus;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  deliveredAt?: string;
  address: string;
  notes?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
}

// Mock deliveries data
const mockDeliveries: Delivery[] = [
  {
    id: "delivery-1",
    deviceId: "device-1",
    patientId: "user-1",
    status: "DELIVERED",
    scheduledDate: "2024-01-20",
    scheduledTimeSlot: "morning",
    deliveredAt: "2024-01-20T10:30:00",
    address: "15 Rue de la Republique, 75001 Paris",
    technicianId: "tech-1",
    technicianName: "Pierre Martin",
    createdAt: "2024-01-15T08:00:00",
  },
  {
    id: "delivery-2",
    deviceId: "device-2",
    patientId: "user-1",
    status: "SCHEDULED",
    scheduledDate: "2024-02-28",
    scheduledTimeSlot: "afternoon",
    address: "42 Avenue des Champs-Elysees, 75008 Paris",
    technicianId: "tech-2",
    technicianName: "Marie Dupont",
    createdAt: "2024-02-20T09:00:00",
  },
  {
    id: "delivery-3",
    deviceId: "device-1",
    patientId: "user-1",
    status: "IN_TRANSIT",
    scheduledDate: "2024-02-15",
    scheduledTimeSlot: "morning",
    address: "8 Place Bellecour, 69002 Lyon",
    technicianId: "tech-1",
    technicianName: "Pierre Martin",
    createdAt: "2024-02-10T10:00:00",
  },
  {
    id: "delivery-4",
    deviceId: "device-2",
    patientId: "user-1",
    status: "PENDING",
    address: "25 Quai des Belges, 13001 Marseille",
    notes: "Attente confirmation CPAM",
    createdAt: "2024-02-22T14:00:00",
  },
];

export default function DeliveryDetailPage() {
  const t = useTranslations("admin.deliveryDetail");
  const params = useParams();
  const deliveryId = params.deliveryId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

  // Find delivery
  const delivery = mockDeliveries.find((d) => d.id === deliveryId);
  const patient = delivery ? findPatientById(delivery.patientId) : undefined;
  const device = delivery ? mockDevices.find((d) => d.id === delivery.deviceId) : undefined;
  const product = device?.productId ? getProductById(device.productId) : undefined;

  // Action handlers
  const handleSchedule = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Would update delivery status
    }, 1000);
  };

  const handleStartDelivery = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Would update delivery status to IN_TRANSIT
    }, 1000);
  };

  const handleMarkDelivered = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Would update delivery status to DELIVERED
    }, 1000);
  };

  const handleReschedule = () => {
    setActiveTab("schedule");
  };

  if (!delivery) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/livraisons">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToList")}
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <h2 className="text-xl font-semibold text-neutral-900">{t("notFound")}</h2>
            <p className="text-neutral-500 mt-2">{t("notFoundDescription")}</p>
            <Button asChild className="mt-4">
              <Link href="/admin/livraisons">{t("backToList")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/livraisons">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToList")}
          </Link>
        </Button>
      </div>

      {/* Delivery Header */}
      <DeliveryHeader
        delivery={delivery}
        product={product}
        device={device}
      />

      {/* Patient & Device Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Patient Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary-500" />
              {t("patientInfo.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500">{t("patientInfo.name")}</p>
              <p className="font-medium">
                {patient?.firstName} {patient?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("patientInfo.phone")}</p>
              <p className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400" />
                {patient?.phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("patientInfo.address")}</p>
              <p className="font-medium flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                {delivery.address}
              </p>
            </div>
            {delivery.notes && (
              <div>
                <p className="text-sm text-neutral-500">{t("patientInfo.notes")}</p>
                <p className="text-sm bg-warning/10 text-warning px-3 py-2 rounded mt-1">
                  {delivery.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary-500" />
              {t("deviceInfo.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500">{t("deviceInfo.product")}</p>
              <p className="font-medium">{product?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("deviceInfo.serialNumber")}</p>
              <p className="font-medium font-mono">{device?.serialNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("deviceInfo.category")}</p>
              <p className="font-medium">{product?.familyId === "family-1" ? "Manuel" : product?.familyId === "family-2" ? "Electrique" : "Tout-terrain"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t("tabs.schedule")}
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            {t("tabs.tracking")}
          </TabsTrigger>
          <TabsTrigger value="confirmation" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t("tabs.confirmation")}
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6">
          <DeliverySchedule
            delivery={delivery}
            onSchedule={handleSchedule}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="mt-6">
          <DeliveryTimeline
            delivery={delivery}
          />
        </TabsContent>

        {/* Confirmation Tab */}
        <TabsContent value="confirmation" className="mt-6">
          <DeliveryConfirmation
            delivery={delivery}
            onConfirm={handleMarkDelivered}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <Card className="sticky bottom-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {delivery.status === "PENDING" && (
              <Button onClick={handleSchedule} loading={isLoading}>
                <Calendar className="w-4 h-4 mr-2" />
                {t("actions.schedule")}
              </Button>
            )}
            {delivery.status === "SCHEDULED" && (
              <>
                <Button variant="outline" onClick={handleReschedule}>
                  <Clock className="w-4 h-4 mr-2" />
                  {t("actions.reschedule")}
                </Button>
                <Button onClick={handleStartDelivery} loading={isLoading}>
                  <Truck className="w-4 h-4 mr-2" />
                  {t("actions.startDelivery")}
                </Button>
              </>
            )}
            {delivery.status === "IN_TRANSIT" && (
              <>
                <Button variant="outline" onClick={handleReschedule}>
                  <Clock className="w-4 h-4 mr-2" />
                  {t("actions.reschedule")}
                </Button>
                <Button
                  onClick={handleMarkDelivered}
                  loading={isLoading}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t("actions.markDelivered")}
                </Button>
              </>
            )}
            {delivery.status === "DELIVERED" && (
              <Badge variant="success" className="text-sm px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("status.DELIVERED")}
              </Badge>
            )}
            {delivery.status === "FAILED" && (
              <>
                <Badge variant="error" className="text-sm px-4 py-2">
                  {t("status.FAILED")}
                </Badge>
                <Button onClick={handleReschedule}>
                  <Calendar className="w-4 h-4 mr-2" />
                  {t("actions.reschedule")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
